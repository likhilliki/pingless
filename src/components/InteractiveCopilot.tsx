import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, Compass, Play, RefreshCw, Send, Brain, Zap, HelpCircle, CheckCircle } from 'lucide-react';
import { PinglessEvent } from '../types';

interface InteractiveCopilotProps {
  events: PinglessEvent[];
  onSelectEvent: (e: PinglessEvent) => void;
  onRunScan: () => void;
}

export const InteractiveCopilot: React.FC<InteractiveCopilotProps> = ({
  events,
  onSelectEvent,
  onRunScan,
}) => {
  const [chatQuery, setChatQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    { role: 'ai', text: "Hello! I am your Pingless Operating Copilot. I've analyzed your secure Gmail metadata. What action or risk-vector plan should we construct?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Suggestion click handler
  const handleSuggestion = (promptText: string) => {
    setChatQuery(promptText);
    submitChat(promptText);
  };

  const submitChat = async (queryText: string) => {
    if (!queryText.trim()) return;
    
    const userMsg = { role: 'user' as const, text: queryText };
    setChatHistory(prev => [...prev, userMsg]);
    setChatQuery('');
    setIsTyping(true);

    try {
      // Simulate/Trigger API calls or local heuristics
      setTimeout(() => {
        setIsTyping(false);
        let aiReply = "I have scanned your discovered commitments. Let me construct a specialized action checklist for you.";

        const lowerQuery = queryText.toLowerCase();

        if (lowerQuery.includes('risk') || lowerQuery.includes('missing')) {
          aiReply = "Your highest risk factor is ETHIndia RSVP Deadline on July 5. Gmail registration confirmation has been detected, but I've found no confirmation of team RSVP. Probability of missing: 78%. Recommended task: click ETHIndia link, form team, compile submission.";
        } else if (lowerQuery.includes('prepare') || lowerQuery.includes('tomorrow')) {
          const mainEvent = events.find(e => e.title.toLowerCase().includes('hackathon')) || events[0];
          if (mainEvent) {
            aiReply = `SF AI Hackathon is scheduled for tomorrow at 9:00 AM. Travel index says: 48 mins driving buffer. Your pre-read is incomplete. Action: 1. Clone starter repo, 2. Download offline docs, 3. Pack charger block. No reminders needed—I'll monitor travel times.`;
          } else {
            aiReply = "All upcoming commitments look stable. No immediate prep gaps detected. Try scanning Gmail again to load more elements.";
          }
        } else if (lowerQuery.includes('hackathon')) {
          const hackEvt = events.find(e => e.title.toLowerCase().includes('hackathon'));
          if (hackEvt) {
            aiReply = `I found "${hackEvt.title}" starting ${hackEvt.date}. Status: team assembly pending. Shall I search for teammate confirmations in your inbox?`;
          } else {
            aiReply = "I searched your inbox scans but found no explicit Hackathons. Run a fresh scan to extract new registrations.";
          }
        } else if (lowerQuery.includes('unpaid') || lowerQuery.includes('ticket')) {
          aiReply = "Gmail scan identified one unpaid registration ticket: 'ETHIndia Hackathon Summit RSVP'. Complete the details directly before July 5.";
        }

        setChatHistory(prev => [...prev, { role: 'ai', text: aiReply }]);
      }, 1000);
    } catch (err) {
      setIsTyping(false);
      setChatHistory(prev => [...prev, { role: 'ai', text: "Error syncing request. Try running fresh Google OAuth scan." }]);
    }
  };

  return (
    <div className="glass-morphism rounded-3xl p-5 border border-white/5 flex flex-col h-[520px] bg-black/40 text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider">AI Copilot Companion</h4>
            <p className="text-[9px] text-white/40 font-mono">Persistent system controller agent</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button 
            id="copilot-action-scan"
            onClick={onRunScan}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
            title="Scan inbox now"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 scrollbar-thin">
        {chatHistory.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'ml-auto items-end' : 'items-start'}`}
          >
            <span className="text-[8px] font-mono uppercase font-bold text-white/30 mb-1">
              {msg.role === 'user' ? 'Operator' : 'Pingless Copilot'}
            </span>
            <div 
              className={`p-3 rounded-2xl text-xs leading-relaxed font-sans ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-white/[0.02] border border-white/5 text-white/85 rounded-tl-none'}`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex flex-col items-start max-w-[85%]">
            <span className="text-[8px] font-mono uppercase font-bold text-white/30 mb-1">Pingless Copilot</span>
            <div className="p-3 rounded-2xl text-xs bg-white/[0.02] border border-white/5 text-white/50 rounded-tl-none flex items-center gap-1.5 font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing inbox nodes...
            </div>
          </div>
        )}
      </div>

      {/* Proactive Floating Suggestion Chips */}
      <div className="border-t border-white/5 pt-3 space-y-2.5">
        <p className="text-[9px] font-mono text-white/30 uppercase font-bold tracking-wider">Autonomous Actions</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            id="copilot-chip-risk"
            onClick={() => handleSuggestion("What is my biggest risk?")}
            className="px-2.5 py-1 rounded bg-white/[0.02] hover:bg-purple-500/10 hover:text-purple-300 border border-white/5 text-[9px] font-mono uppercase font-bold text-white/50 transition-all cursor-pointer"
          >
            Check Risk Index
          </button>
          <button
            id="copilot-chip-prep"
            onClick={() => handleSuggestion("Prepare me for tomorrow.")}
            className="px-2.5 py-1 rounded bg-white/[0.02] hover:bg-purple-500/10 hover:text-purple-300 border border-white/5 text-[9px] font-mono uppercase font-bold text-white/50 transition-all cursor-pointer"
          >
            Prepare Tomorrow
          </button>
          <button
            id="copilot-chip-unpaid"
            onClick={() => handleSuggestion("Are there unpaid tickets?")}
            className="px-2.5 py-1 rounded bg-white/[0.02] hover:bg-purple-500/10 hover:text-purple-300 border border-white/5 text-[9px] font-mono uppercase font-bold text-white/50 transition-all cursor-pointer"
          >
            Unpaid Tasks
          </button>
        </div>

        {/* Input box */}
        <form 
          onSubmit={(e) => { e.preventDefault(); submitChat(chatQuery); }}
          className="flex items-center gap-2 mt-2 bg-white/[0.02] border border-white/5 rounded-xl p-2"
        >
          <input
            id="copilot-text-input"
            type="text"
            placeholder="Type task, check risk, or talk..."
            value={chatQuery}
            onChange={(e) => setChatQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-white text-xs font-sans placeholder-white/30 px-1"
          />
          <button
            id="copilot-submit"
            type="submit"
            className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all active:scale-95 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
