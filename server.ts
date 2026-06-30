import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK lazily
let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is not defined. Please set it in AI Studio Secrets.');
    }
    aiClient = new GoogleGenAI({ 
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Robust content generator with automatic model fallback and exponential retry backoff
async function generateGeminiContent(prompt: string): Promise<string> {
  const ai = getAiClient();
  // Try several models in case of high load (503) or rate limits (429)
  const models = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of models) {
    let retries = 2; // Try up to 2 retries per model
    let delay = 1000; // start with 1s delay
    
    while (retries >= 0) {
      try {
        console.log(`Attempting Gemini generation with model ${model} (retries remaining: ${retries})...`);
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
        });
        
        if (response.text) {
          console.log(`Gemini generation succeeded using model ${model}`);
          return response.text;
        }
        throw new Error('Gemini returned an empty response');
      } catch (err: any) {
        lastError = err;
        console.warn(`Error generating content with model ${model}:`, err.message || err);
        
        const errStr = String(err.message || err?.status || '').toLowerCase() + ' ' + JSON.stringify(err);
        const isTransient = errStr.includes('quota') || errStr.includes('limit') || errStr.includes('exhausted') || errStr.includes('503') || errStr.includes('unavailable') || errStr.includes('demand') || errStr.includes('429');
        
        if (isTransient && retries > 0) {
          console.log(`Transient error detected. Retrying model ${model} in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; // exponential backoff
          retries--;
        } else {
          break; // break loop to try the next model
        }
      }
    }
  }
  
  throw lastError || new Error('All Gemini model attempts exhausted.');
}

// Helper to strip HTML and truncate body
function cleanEmailBody(body: string): string {
  // Remove scripts, styles, html tags
  let text = body
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Truncate to save context tokens
  return text.substring(0, 1500);
}

// Helper to decode base64url
function decodeBase64Url(str: string): string {
  // Convert from base64url to standard base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Pad if necessary
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf-8');
}

// Helper to extract email body from Gmail payload
function getEmailBody(payload: any): string {
  if (!payload) return '';
  if (payload.body && payload.body.data) {
    return decodeBase64Url(payload.body.data);
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body && part.body.data) {
        return decodeBase64Url(part.body.data);
      }
    }
    // Fallback to text/html if no plain text
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body && part.body.data) {
        return decodeBase64Url(part.body.data);
      }
    }
    // Recurse into nested parts
    for (const part of payload.parts) {
      const nestedBody = getEmailBody(part);
      if (nestedBody) return nestedBody;
    }
  }
  return '';
}

// Heuristic email parser fallback in case of Gemini API rate-limits/429s
function parseEmailsHeuristically(emails: any[]): any[] {
  const parsedEvents: any[] = [];
  
  for (const email of emails) {
    if (!email) continue;
    try {
      const headers = email.payload?.headers || [];
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'Scheduled Commitment';
      const sender = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
      const dateHeader = headers.find((h: any) => h.name === 'Date')?.value || '';
      
      const rawBody = getEmailBody(email.payload);
      const text = cleanEmailBody(rawBody || email.snippet || '');
      const ltext = text.toLowerCase();
      const lsubj = subject.toLowerCase();

      // Try to parse out event date
      let eventDate = new Date(dateHeader);
      if (isNaN(eventDate.getTime())) {
        eventDate = new Date();
      }
      // If the email date is in the past, default to 1 day in the future to make it actionable in the UI
      if (eventDate.getTime() < Date.now()) {
        eventDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }

      // Determine platform channel
      let platform = 'email';
      if (ltext.includes('github.com') || lsubj.includes('github')) platform = 'github';
      else if (ltext.includes('slack.com') || lsubj.includes('slack')) platform = 'slack';
      else if (ltext.includes('zoom.us') || ltext.includes('zoom meeting') || lsubj.includes('zoom')) platform = 'zoom';
      else if (ltext.includes('lu.ma') || lsubj.includes('luma')) platform = 'luma';
      else if (ltext.includes('eventbrite') || lsubj.includes('eventbrite')) platform = 'eventbrite';
      else if (ltext.includes('calendar') || lsubj.includes('calendar')) platform = 'google-calendar';

      // Extract links
      let actionLink: string | undefined = undefined;
      const urlRegex = /(https?:\/\/[^\s"'<>)]+)/g;
      const matches = text.match(urlRegex);
      if (matches && matches.length > 0) {
        actionLink = matches.find(url => 
          url.includes('zoom.us') || 
          url.includes('lu.ma') || 
          url.includes('eventbrite') || 
          url.includes('github.com')
        ) || matches[0];
        actionLink = actionLink.replace(/[.,;:$&)]*$/, ''); // Clean trailing punctuation
      }

      // High/Medium priority heuristic
      let priority = 'medium';
      if (
        ltext.includes('urgent') || 
        ltext.includes('important') || 
        ltext.includes('action required') ||
        lsubj.includes('action required') ||
        lsubj.includes('urgent')
      ) {
        priority = 'high';
      } else if (ltext.includes('newsletter') || ltext.includes('digest')) {
        priority = 'low';
      }

      // Extract deadline if present
      let deadline: string | undefined = undefined;
      const deadlineKeywords = ['by', 'due', 'before', 'deadline'];
      if (deadlineKeywords.some(kw => ltext.includes(kw))) {
        deadline = new Date(eventDate.getTime() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours before event
      }

      // Custom description and recommendation
      const desc = email.snippet || `Extracted schedule node for ${subject}.`;
      
      parsedEvents.push({
        id: email.id,
        title: subject,
        platform,
        date: eventDate.toISOString(),
        deadline,
        description: desc,
        actionLink,
        priority,
        recommendations: [
          'Open associated Gmail client to inspect full details.',
          'Review attachments and links in access portal.',
          'Ensure notification status is set to high priority.'
        ],
        scrapedFrom: `${subject} (${sender})`,
        isGoogleCalendarEvent: false,
      });
    } catch (e) {
      console.error('Error in heuristic parsing for email id:', email.id, e);
    }
  }

  return parsedEvents;
}

// API Routes

// 1. Scan and parse Gmail and Calendar
app.post('/api/events/scan', async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization header with Google Access Token' });
  }

  try {
    const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    let hasInsufficientScopes = false;

    // Fetch Gmail Registration Emails
    let gmailEvents: any[] = [];
    try {
      const searchQuery = 'register OR registration OR confirmation OR ticket OR luma OR zoom OR meetup OR eventbrite OR workshop OR booking OR rsvp OR invitation OR scheduled OR appointment OR reservation OR session OR receipt OR order OR summit OR conference';
      const gmailListResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=50`,
        {
          headers: { Authorization: bearerToken },
        }
      );

      if (gmailListResponse.ok) {
        const gmailListData = await gmailListResponse.json();
        const messages = gmailListData.messages || [];

        // Fetch detailed content for each email in parallel
        const messagePromises = messages.map(async (msg: any) => {
          try {
            const detailResponse = await fetch(
              `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
              {
                headers: { Authorization: bearerToken },
              }
            );
            if (!detailResponse.ok) return null;
            return await detailResponse.json();
          } catch (e) {
            return null;
          }
        });

        const detailedMessages = (await Promise.all(messagePromises)).filter(Boolean);

        // Smart client-side pre-filtering to pick the top 15 most promising event emails for Gemini parsing
        const eventIndicators = [
          'register', 'registration', 'confirm', 'ticket', 'luma', 'lu.ma', 'zoom', 'meetup', 'eventbrite',
          'workshop', 'booking', 'rsvp', 'invitation', 'invite', 'schedule', 'appointment', 'reservation',
          'session', 'receipt', 'order', 'pass', 'summit', 'conference', 'seminar', 'orientation', 'hackathon', 'meet'
        ];

        const candidateMessages = detailedMessages.filter((email: any) => {
          if (!email) return false;
          const headers = email.payload?.headers || [];
          const subject = (headers.find((h: any) => h.name === 'Subject')?.value || '').toLowerCase();
          const snippet = (email.snippet || '').toLowerCase();

          const hasIndicator = eventIndicators.some(indicator => 
            subject.includes(indicator) || snippet.includes(indicator)
          );
          
          const isSpam = subject.includes('newsletter') || subject.includes('weekly digest') || subject.includes('unsubscribed');

          return hasIndicator && !isSpam;
        }).slice(0, 10); // Keep batch to 10 most promising candidate emails

        if (candidateMessages.length > 0) {
          // Parse candidate emails in a SINGLE batch Gemini request to completely avoid 429 quota exhaustion
          const ai = getAiClient();
          const emailDataForAi = candidateMessages.map((email: any) => {
            const headers = email.payload?.headers || [];
            const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
            const sender = headers.find((h: any) => h.name === 'From')?.value || '';
            const date = headers.find((h: any) => h.name === 'Date')?.value || '';
            const rawBody = getEmailBody(email.payload);
            const bodySnippet = cleanEmailBody(rawBody || email.snippet || '');
            return {
              id: email.id,
              subject,
              sender,
              date,
              bodySnippet
            };
          });

          const prompt = `You are Pingless AI, a professional scheduling companion.
Analyze the following list of email contents to determine if any describe a registered event, meeting, appointment, ticket purchase, workshop, webinar, GitHub issue deadline, Slack commitment, Zoom session, or any actionable event/deadline.

Emails to analyze:
${JSON.stringify(emailDataForAi, null, 2)}

Return a valid JSON array of objects strictly matching this schema (do NOT wrap it in markdown code blocks, do NOT write \`\`\`json, just return raw plain text JSON array of parsed elements):
[
  {
    "id": "must match the exact id of the email being parsed",
    "isEvent": boolean, // true if it's a real event, meeting, registration, booking, or actionable deadline. false if it's newsletter, spam, or general conversational email.
    "title": string, // clear name of the event, meeting, or commitment
    "platform": string, // "github", "slack", "zoom", "luma", "eventbrite", "email"
    "date": string, // ISO 8601 string of the event start date/time, e.g. "2026-06-29T10:00:00Z" (MUST be fully qualified or null if date/time cannot be found at all)
    "deadline": string, // ISO 8601 string of any deadline to respond or prepare, or null
    "description": string, // brief, high-level summary of what the event is and what is expected
    "actionLink": string, // direct URL found in the text for joining, opening, viewing tickets, or logging in (e.g., zoom link, luma URL, eventbrite link, github link)
    "priority": string, // "high", "medium", or "low" based on importance
    "recommendations": string[] // list of 2-3 short, actionable suggestions to prepare for this event so that "you never forget" and are fully prepared.
  }
]
`;

          try {
            const text = await generateGeminiContent(prompt);
            const cleanJsonText = text
              .replace(/^```json\s*/i, '')
              .replace(/^```\s*/, '')
              .replace(/```$/, '')
              .trim();

            const parsedList = JSON.parse(cleanJsonText);
            if (Array.isArray(parsedList)) {
              parsedList.forEach((parsed: any) => {
                if (parsed && parsed.isEvent) {
                  const originalEmail = candidateMessages.find((m: any) => m.id === parsed.id);
                  const headers = originalEmail?.payload?.headers || [];
                  const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
                  const sender = headers.find((h: any) => h.name === 'From')?.value || '';
                  
                  gmailEvents.push({
                    id: parsed.id,
                    title: parsed.title,
                    platform: parsed.platform || 'email',
                    date: parsed.date || new Date().toISOString(),
                    deadline: parsed.deadline || undefined,
                    description: parsed.description || 'Auto-extracted event from registration email.',
                    actionLink: parsed.actionLink || undefined,
                    priority: parsed.priority || 'medium',
                    recommendations: parsed.recommendations || ['Review registration details'],
                    scrapedFrom: `${subject} (${sender})`,
                    isGoogleCalendarEvent: false,
                  });
                }
              });
            } else {
              throw new Error('Response is not a valid JSON array');
            }
          } catch (aiError) {
            console.error('Error batch parsing emails with Gemini, falling back to heuristic offline parser:', aiError);
            gmailEvents = parseEmailsHeuristically(candidateMessages);
          }
        }
      } else {
        if (gmailListResponse.status === 401 || gmailListResponse.status === 403) {
          console.warn(`Gmail list unauthorized/insufficient scopes: ${gmailListResponse.status}`);
          hasInsufficientScopes = true;
        } else {
          const errText = await gmailListResponse.text();
          console.error(`Failed to fetch Gmail list (${gmailListResponse.status}):`, errText.substring(0, 200));
        }
      }
    } catch (err) {
      console.error('Error fetching/scanning Gmail:', err);
    }

    if (hasInsufficientScopes) {
      return res.status(403).json({
        error: 'insufficient_scopes',
        message: 'Google API requests failed with insufficient permissions.'
      });
    }

    // Combine and sort events by date
    const allEvents = [...gmailEvents];
    allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.json({ events: allEvents });
  } catch (error: any) {
    console.error('Scan API error:', error);
    res.status(500).json({ error: error.message || 'Internal server error during scanning' });
  }
});

// 2. Create Event in Google Calendar
app.post('/api/calendar/create', async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Missing authorization header with Google Access Token' });
  }

  const { title, description, date, deadline, platform, actionLink } = req.body;
  if (!title || !date) {
    return res.status(400).json({ error: 'Title and Date are required' });
  }

  try {
    const bearerToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;

    const startDate = new Date(date);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour duration

    const gcalEvent = {
      summary: `[Pingless] ${title}`,
      description: `${description || ''}\n\nPlatform: ${platform || 'Custom'}\nAction Link: ${actionLink || 'None'}\nDeadline: ${deadline || 'None'}\n\nCreated automatically by Pingless.`,
      start: {
        dateTime: startDate.toISOString(),
      },
      end: {
        dateTime: endDate.toISOString(),
      },
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: bearerToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(gcalEvent),
    });

    if (response.ok) {
      const data = await response.json();
      res.json({ success: true, eventId: data.id, htmlLink: data.htmlLink });
    } else {
      const errMsg = await response.text();
      console.error('Google Calendar event creation failed:', errMsg);
      res.status(502).json({ error: 'Failed to save event to Google Calendar', details: errMsg });
    }
  } catch (error: any) {
    console.error('Calendar Create API error:', error);
    res.status(500).json({ error: error.message || 'Internal server error creating event' });
  }
});

// 3. AI Smart Schedule and Recommendations
app.post('/api/ai/recommendations', async (req, res) => {
  const { event } = req.body;
  if (!event) {
    return res.status(400).json({ error: 'Event details are required' });
  }

  try {
    const ai = getAiClient();
    const prompt = `You are Pingless AI, a high-fidelity productivity companion.
Analyze the following event and provide a hyper-customized, step-by-step preparation plan with timings (e.g. T-24 hours, T-2 hours, T-15 minutes) so that the user stays ahead of the deadline.
Focus on helping the user take action and avoid reminders.

Event Title: ${event.title}
Platform: ${event.platform}
Date: ${event.date}
Deadline: ${event.deadline || 'N/A'}
Description: ${event.description}
Priority: ${event.priority}

Provide your suggestions in a structured, concise Markdown format. Use elegant language, bullet points, and highlight key timelines.`;

    const text = await generateGeminiContent(prompt);

    res.json({ recommendations: text });
  } catch (error: any) {
    console.error('AI Recommendations API error:', error);
    // Fallback elegant markdown preparation plan if Gemini fails
    const fallbackPlan = `### 📋 Action Plan: ${event.title || 'Commitment'}
*Because of high server load, we've compiled this high-fidelity preparation playbook for you.*

*   **⏱️ T-24 Hours (Deep Preparation)**:
    *   Review any details or prerequisites related to **${event.title}**.
    *   Set calendar alerts and double-check timezone mappings.
*   **⏱️ T-2 Hours (Focus Block)**:
    *   Set aside dedicated time to prepare. Close distracting tabs and silence notifications.
    *   Verify access link: **${event.actionLink || 'N/A'}**.
*   **⏱️ T-15 Minutes (Final Alignment)**:
    *   Open meeting portals, check audio/camera hardware, and review the description:
        > *"${event.description || 'No description provided.'}"*

*Stay proactive, take complete ownership, and excel!*`;
    res.json({ recommendations: fallbackPlan });
  }
});

// Server setup

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Pingless Server] running on port ${PORT}`);
  });
}

startServer();
