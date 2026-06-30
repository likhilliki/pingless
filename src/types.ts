export interface PinglessEvent {
  id: string;
  title: string;
  platform: 'github' | 'slack' | 'zoom' | 'luma' | 'eventbrite' | 'email' | 'custom' | 'google-calendar';
  date: string; // ISO string or human readable
  time?: string;
  deadline?: string; // ISO string or human readable
  description: string;
  actionLink?: string; // Direct link to event
  recommendations?: string[];
  priority: 'high' | 'medium' | 'low';
  scrapedFrom?: string; // Email subject or sender
  isGoogleCalendarEvent?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface LifeGraphNode {
  id: string;
  label: string;
  type: 'registration' | 'prep' | 'travel' | 'main' | 'deadline' | 'dependency';
  status: 'completed' | 'ongoing' | 'pending';
  eventId: string;
  x: number;
  y: number;
}

export interface LifeGraphEdge {
  id: string;
  from: string;
  to: string;
  type: 'sequence' | 'blocker' | 'requires';
}

export interface RiskScore {
  eventId: string;
  riskPercent: number; // 0 - 100
  urgencyPercent: number; // 0 - 100
  completionPercent: number; // 0 - 100
  probabilityOfMissing: number; // 0 - 100
  aiConfidence: number; // 0 - 100
  indicators: string[];
}

export interface InsightsData {
  stressScore: number; // 0 - 100
  weeklyTrend: { day: string; value: number }[];
  avgPrepDays: number;
  unpaidCount: number;
  clashingCount: number;
  successRate: number; // e.g. 78
}
