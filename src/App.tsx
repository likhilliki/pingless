import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Mail, 
  Globe, 
  Sparkles, 
  Plus, 
  LogOut, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Github, 
  Slack, 
  Video, 
  Layers, 
  Activity, 
  Compass, 
  RefreshCw,
  Check,
  ChevronRight,
  Info,
  Flame,
  ShieldCheck,
  Search,
  Volume2,
  ShieldAlert,
  Sliders,
  Sparkle
} from 'lucide-react';
import { initAuth, googleSignIn, logout, getAccessToken } from './lib/firebase';
import { PinglessEvent, UserProfile } from './types';
import { User } from 'firebase/auth';
import { OAuthGuide } from './components/OAuthGuide';

// Custom Premium Product components
import { LandingHero } from './components/LandingHero';
import { RiskAnalysisWidget } from './components/RiskAnalysisWidget';
import { LifeGraphSection } from './components/LifeGraphSection';
import { FocusHeatmap } from './components/FocusHeatmap';
import { CommandPalette } from './components/CommandPalette';
import { VoiceAssistantOverlay } from './components/VoiceAssistantOverlay';
import { EmergencyHUD } from './components/EmergencyHUD';
import { InteractiveCopilot } from './components/InteractiveCopilot';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [events, setEvents] = useState<PinglessEvent[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [selectedEventForAi, setSelectedEventForAi] = useState<PinglessEvent | null>(null);
  const [aiPlaybook, setAiPlaybook] = useState<string>('');
  const [isLoadingPlaybook, setIsLoadingPlaybook] = useState<boolean>(false);
  
  // Custom OS State features
  const [emergencyMode, setEmergencyMode] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState<boolean>(false);
  const [selectedDashboardEvent, setSelectedDashboardEvent] = useState<PinglessEvent | null>(null);

  // Modal forms
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newPlatform, setNewPlatform] = useState<PinglessEvent['platform']>('custom');
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('');
  const [newDeadline, setNewDeadline] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newActionLink, setNewActionLink] = useState<string>('');
  const [newPriority, setNewPriority] = useState<PinglessEvent['priority']>('medium');
  const [saveToCalendar, setSaveToCalendar] = useState<boolean>(true);
  const [isSavingManual, setIsSavingManual] = useState<boolean>(false);

  // OAuth Guide modal states
  const [isOAuthGuideOpen, setIsOAuthGuideOpen] = useState<boolean>(false);
  const [oauthErrorType, setOauthErrorType] = useState<'popup-closed' | 'insufficient-scopes' | 'blocked' | null>(null);
  const [isUpgradingAuth, setIsUpgradingAuth] = useState<boolean>(false);

  // Filter and Search states
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (firebaseUser, token) => {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Pingless User',
          photoURL: firebaseUser.photoURL || undefined
        });
        setAccessToken(token);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Trigger keyboard listener for Cmd+K command palette
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        e.preventDefault();
        setIsVoiceAssistantOpen(prev => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault();
        setEmergencyMode(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  // Trigger scanning when logged in
  useEffect(() => {
    if (accessToken) {
      triggerScan();
    }
  }, [accessToken]);

  // Sync selected event automatically on list load
  useEffect(() => {
    if (events.length > 0 && !selectedDashboardEvent) {
      setSelectedDashboardEvent(events[0]);
    }
  }, [events, selectedDashboardEvent]);

  const triggerScan = async () => {
    if (!accessToken) return;
    setIsScanning(true);
    setScanProgress(10);
    setScanStatus('Initializing neural scanning...');
    
    // Animate fake progress to feel "cyberpunk" and tactile
    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p < 85) {
          const add = Math.floor(Math.random() * 15) + 5;
          const next = p + add;
          if (next >= 40 && next < 60) setScanStatus('Scanning Gmail for event registrations...');
          if (next >= 60 && next < 80) setScanStatus('Decrypting ticket and registration emails...');
          if (next >= 80) setScanStatus('Leveraging Gemini AI parser to extract event dates...');
          return next > 90 ? 90 : next;
        }
        return p;
      });
    }, 400);

    try {
      const response = await fetch('/api/events/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      clearInterval(interval);
      setScanProgress(100);
      setScanStatus('Horizon parsed successfully.');

      if (response.ok) {
        const data = await response.json();
        const loadedEvents = data.events || [];
        setEvents(loadedEvents);
        if (loadedEvents.length > 0) {
          setSelectedDashboardEvent(loadedEvents[0]);
        }
      } else if (response.status === 403) {
        console.warn('Insufficient scopes to scan calendar/gmail');
        setOauthErrorType('insufficient-scopes');
        setIsOAuthGuideOpen(true);
      } else {
        console.error('Scan failed:', await response.text());
      }
    } catch (error) {
      console.error('Error scanning events:', error);
      clearInterval(interval);
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanProgress(0);
      }, 1000);
    }
  };

  const handleLogin = async (withScopes: boolean = false) => {
    setIsLoggingIn(true);
    setOauthErrorType(null);
    try {
      const result = await googleSignIn(withScopes);
      if (result) {
        setUser({
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || 'Pingless User',
          photoURL: result.user.photoURL || undefined
        });
        setAccessToken(result.accessToken);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user')) {
        setOauthErrorType('popup-closed');
        setIsOAuthGuideOpen(true);
      } else if (err?.code === 'auth/operation-not-allowed') {
        alert('Operation not allowed. Please ensure Google Sign-In is enabled in Firebase Authentication console.');
      } else if (err?.message?.includes('blocked') || err?.code?.includes('blocked')) {
        setOauthErrorType('blocked');
        setIsOAuthGuideOpen(true);
      } else {
        alert(`Authentication failed: ${err?.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleUpgradeAccess = async () => {
    setIsUpgradingAuth(true);
    try {
      const result = await googleSignIn(true);
      if (result) {
        setUser({
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || 'Pingless User',
          photoURL: result.user.photoURL || undefined
        });
        setAccessToken(result.accessToken);
        setIsOAuthGuideOpen(false);
        // Rescan immediately with new permissions
        setTimeout(() => {
          triggerScan();
        }, 500);
      }
    } catch (err: any) {
      console.error('Upgrade access failed:', err);
      if (err?.code === 'auth/popup-closed-by-user' || err?.message?.includes('popup-closed-by-user')) {
        setOauthErrorType('popup-closed');
        setIsOAuthGuideOpen(true);
      } else {
        setOauthErrorType('blocked');
        setIsOAuthGuideOpen(true);
      }
    } finally {
      setIsUpgradingAuth(false);
    }
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm('Are you sure you want to log out from Pingless?');
    if (!confirmLogout) return;
    await logout();
    setUser(null);
    setAccessToken(null);
    setNeedsAuth(true);
    setEvents([]);
    setSelectedEventForAi(null);
    setAiPlaybook('');
  };

  const handleAskAiPlaybook = async (event: PinglessEvent) => {
    setSelectedEventForAi(event);
    setAiPlaybook('');
    setIsLoadingPlaybook(true);

    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ event })
      });

      if (response.ok) {
        const data = await response.json();
        setAiPlaybook(data.recommendations || 'No recommendations generated.');
      } else {
        setAiPlaybook('Failed to compile your customized AI playbook. Please try again.');
      }
    } catch (error) {
      console.error('AI Playbook error:', error);
      setAiPlaybook('An error occurred while compiling your customized playbook.');
    } finally {
      setIsLoadingPlaybook(false);
    }
  };

  const handleCreateManualEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;
    setIsSavingManual(true);

    const manualEvent: Omit<PinglessEvent, 'id'> = {
      title: newTitle,
      platform: newPlatform,
      date: newTime ? `${newDate}T${newTime}` : newDate,
      deadline: newDeadline || undefined,
      description: newDescription || 'Manually logged commitment',
      actionLink: newActionLink || undefined,
      priority: newPriority,
      recommendations: ['Check action plan', 'Prepare for deadline'],
      isGoogleCalendarEvent: false
    };

    try {
      let createdOnCalendar = false;
      let gcalLink = '';

      if (saveToCalendar && accessToken) {
        // Post to Google Calendar API route
        const calendarRes = await fetch('/api/calendar/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            title: newTitle,
            description: newDescription,
            date: newTime ? `${newDate}T${newTime}:00` : `${newDate}T12:00:00`,
            deadline: newDeadline,
            platform: newPlatform,
            actionLink: newActionLink
          })
        });

        if (calendarRes.ok) {
          const calendarData = await calendarRes.json();
          createdOnCalendar = true;
          gcalLink = calendarData.htmlLink || '';
        }
      }

      const freshEvent: PinglessEvent = {
        ...manualEvent,
        id: `manual_${Date.now()}`,
        isGoogleCalendarEvent: createdOnCalendar,
        actionLink: gcalLink || newActionLink || undefined
      };

      // Add to local events state immediately
      setEvents(prev => {
        const next = [...prev, freshEvent];
        return next.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      });

      setSelectedDashboardEvent(freshEvent);

      // Clear form
      setNewTitle('');
      setNewPlatform('custom');
      setNewDate('');
      setNewTime('');
      setNewDeadline('');
      setNewDescription('');
      setNewActionLink('');
      setNewPriority('medium');
      setShowAddModal(false);
    } catch (err) {
      console.error('Manual event error:', err);
    } finally {
      setIsSavingManual(false);
    }
  };

  // Filter events list
  const filteredEvents = events.filter(evt => {
    const matchPlatform = selectedPlatformFilter === 'all' || evt.platform === selectedPlatformFilter;
    const matchPriority = selectedPriorityFilter === 'all' || evt.priority === selectedPriorityFilter;
    return matchPlatform && matchPriority;
  });

  const getPlatformIcon = (platform: PinglessEvent['platform']) => {
    switch (platform) {
      case 'github':
        return <Github className="w-5 h-5 text-neutral-400" />;
      case 'slack':
        return <Slack className="w-5 h-5 text-[#4A154B]" />;
      case 'zoom':
        return <Video className="w-5 h-5 text-sky-400" />;
      case 'luma':
        return <Compass className="w-5 h-5 text-pink-400" />;
      case 'eventbrite':
        return <Compass className="w-5 h-5 text-orange-400" />;
      case 'google-calendar':
        return <CalendarIcon className="w-5 h-5 text-emerald-400" />;
      case 'email':
        return <Mail className="w-5 h-5 text-indigo-400" />;
      default:
        return <CalendarIcon className="w-5 h-5 text-neutral-400" />;
    }
  };

  const getPriorityBadge = (priority: PinglessEvent['priority']) => {
    switch (priority) {
      case 'high':
        return (
          <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
            <Flame className="w-3 h-3 text-rose-500 animate-pulse" /> Urgent
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            Active
          </span>
        );
      case 'low':
        return (
          <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 bg-neutral-500/10 border border-neutral-500/20 px-2 py-0.5 rounded-full">
            Routine
          </span>
        );
    }
  };

  const formatEventDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-[#e0e0e0] font-sans selection:bg-purple-500 selection:text-white overflow-x-hidden">
      
      {/* Absolute floating lights for ambient feel */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      <AnimatePresence mode="wait">
        {/* Render Emergency HUD Over All If Triggered */}
        {emergencyMode && (
          <motion.div key="emergency-hud" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <EmergencyHUD events={events} onDeactivate={() => setEmergencyMode(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {needsAuth ? (
          /* AUTH LANDING SCREEN WITH THE WORLD-CLASS APPLE HERO AND INBOX SCAN SIMULATOR */
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <LandingHero 
              onLoginStandard={() => handleLogin(false)}
              onLoginFull={() => handleLogin(true)}
              onViewAuthGuide={() => { setOauthErrorType(null); setIsOAuthGuideOpen(true); }}
              isLoggingIn={isLoggingIn}
            />
          </motion.div>
        ) : (
          /* WORLD CLASS FULL-STACK COMPOSITE OPERATING SYSTEM */
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen w-full flex flex-col lg:flex-row overflow-x-hidden"
          >
            {/* SIDEBAR NAVIGATION PANEL */}
            <aside className="w-full lg:w-80 lg:min-h-screen lg:sticky lg:top-0 bg-[#07070b]/90 backdrop-blur-xl border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col p-6 justify-between gap-8 shrink-0 z-30">
              <div className="space-y-8 text-left">
                {/* Logo & Slogan */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" /> Pingless
                    </h1>
                    <p className="text-[9px] uppercase tracking-widest text-white/40 mt-1 italic font-mono">Autonomous AI OS</p>
                  </div>
                  <span className="lg:hidden text-[9px] font-mono text-white/30 px-2 py-1 rounded bg-white/5 uppercase font-bold">Menu</span>
                </div>

                {/* Navigation filters */}
                <nav className="space-y-6">
                  {/* Priority Stream triggers */}
                  <div className="space-y-3">
                    <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold font-mono">Commitment Streams</p>
                    <ul className="space-y-1.5">
                      {[
                        { id: 'all', label: 'All Commitments', color: 'bg-purple-500' },
                        { id: 'high', label: 'Urgent Gaps', color: 'bg-rose-500' },
                        { id: 'medium', label: 'Active Ingests', color: 'bg-amber-500' },
                        { id: 'low', label: 'Routine Tasks', color: 'bg-blue-400' }
                      ].map(item => (
                        <li 
                          key={item.id}
                          onClick={() => setSelectedPriorityFilter(item.id)} 
                          className={`flex items-center gap-3 text-xs p-2.5 rounded-xl border transition-all cursor-pointer ${
                            selectedPriorityFilter === item.id 
                              ? 'text-white bg-white/[0.04] border-white/10 font-bold' 
                              : 'text-white/50 border-transparent hover:bg-white/[0.02]'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${item.color} ${selectedPriorityFilter === item.id ? 'animate-ping' : ''}`} />
                          {item.label}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Sources channel triggers */}
                  <div className="space-y-3">
                    <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold font-mono">Discovered Channels</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: 'github', label: 'GITHUB' },
                        { id: 'slack', label: 'SLACK' },
                        { id: 'zoom', label: 'ZOOM' },
                        { id: 'google-calendar', label: 'CALENDAR' },
                        { id: 'email', label: 'GMAIL' },
                        { id: 'all', label: 'ALL' }
                      ].map(src => (
                        <button
                          id={`filter-src-${src.id}`}
                          key={src.id}
                          onClick={() => setSelectedPlatformFilter(src.id)}
                          className={`py-2 rounded-xl border text-[9px] font-mono transition-all font-bold cursor-pointer uppercase ${
                            selectedPlatformFilter === src.id
                              ? 'bg-purple-600 text-white border-purple-500/50'
                              : 'bg-white/[0.02] border-white/5 text-white/50 hover:bg-white/[0.04]'
                          }`}
                        >
                          {src.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Operating HUD togglers */}
                  <div className="space-y-2 pt-2 border-t border-white/5 text-left">
                    <p className="text-[9px] uppercase tracking-widest text-white/30 font-bold font-mono">Action Hubs</p>
                    <button 
                      id="sidebar-toggle-palette"
                      onClick={() => setIsCommandPaletteOpen(true)}
                      className="w-full flex items-center justify-between text-xs p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all text-white/70 cursor-pointer"
                    >
                      <span className="flex items-center gap-2"><Search className="w-4 h-4 text-purple-400" /> Command Console</span>
                      <span className="text-[9px] font-mono text-white/30 bg-white/5 px-1.5 py-0.5 rounded">⌘K</span>
                    </button>

                    <button 
                      id="sidebar-toggle-voice"
                      onClick={() => setIsVoiceAssistantOpen(true)}
                      className="w-full flex items-center justify-between text-xs p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-all text-white/70 cursor-pointer"
                    >
                      <span className="flex items-center gap-2"><Volume2 className="w-4 h-4 text-blue-400" /> Voice Companion</span>
                      <span className="text-[9px] font-mono text-white/30 bg-white/5 px-1.5 py-0.5 rounded">⌘V</span>
                    </button>

                    <button 
                      id="sidebar-toggle-emergency"
                      onClick={() => setEmergencyMode(true)}
                      className="w-full flex items-center justify-between text-xs p-2.5 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/15 transition-all text-rose-300 cursor-pointer"
                    >
                      <span className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" /> Emergency HUD</span>
                      <span className="text-[9px] font-mono text-rose-400/50 bg-rose-500/10 px-1.5 py-0.5 rounded">⌘E</span>
                    </button>
                  </div>
                </nav>
              </div>

              {/* User bottom profile box */}
              {user && (
                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between gap-3 p-2.5 bg-white/[0.02] rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2.5 overflow-hidden text-left">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName} 
                          referrerPolicy="no-referrer"
                          className="w-9 h-9 rounded-full border border-white/10"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {user.displayName.charAt(0)}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold truncate text-white leading-tight">{user.displayName}</p>
                        <p className="text-[9px] text-white/40 truncate font-mono mt-0.5">{user.email}</p>
                      </div>
                    </div>
                    <button 
                      id="sidebar-logout"
                      onClick={handleLogout}
                      className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer shrink-0"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </aside>

            {/* DASHBOARD CORE GRID LAYOUT */}
            <main className="flex-1 flex flex-col min-h-screen text-left">
              {/* Header bar */}
              <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 sm:px-10 bg-black/40 backdrop-blur-xl sticky top-0 z-20">
                <div>
                  <p className="text-[9px] text-purple-400 font-bold tracking-widest uppercase font-mono">Autonomous Timeline State</p>
                  <h2 className="text-lg font-bold font-display text-white mt-0.5">
                    {filteredEvents.length} Active Nodes cataloged
                  </h2>
                </div>
                <div className="flex gap-3">
                  <button 
                    id="header-trigger-scan"
                    onClick={triggerScan}
                    disabled={isScanning}
                    className="h-10 px-4 flex items-center bg-white/5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-2 text-purple-400 ${isScanning ? 'animate-spin' : ''}`} />
                    {isScanning ? 'Decrypting...' : 'Scan Channels'}
                  </button>
                  <button 
                    id="header-open-add"
                    onClick={() => setShowAddModal(true)}
                    className="h-10 px-4 flex items-center bg-purple-600 rounded-xl text-xs font-bold uppercase tracking-wider text-white hover:bg-purple-700 active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Log Commitment
                  </button>
                </div>
              </header>

              {/* Core interactive dashboard area */}
              <div className="flex-1 p-6 sm:p-8 space-y-8">
                
                {/* Active scan progress indicator */}
                <AnimatePresence>
                  {isScanning && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-2xl flex items-center gap-4">
                        <RefreshCw className="w-5 h-5 text-purple-400 animate-spin shrink-0" />
                        <div className="flex-1">
                          <div className="flex justify-between items-center text-[10px] font-mono text-purple-300 font-bold uppercase tracking-wider">
                            <span>{scanStatus}</span>
                            <span>{scanProgress}% Complete</span>
                          </div>
                          <div className="w-full bg-white/5 h-1 rounded-full mt-1.5 overflow-hidden">
                            <motion.div className="h-full bg-purple-500" animate={{ width: `${scanProgress}%` }} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Dashboard layout grid split */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                  
                  {/* Left block (Timeline feed list) */}
                  <div className="xl:col-span-8 space-y-6">
                    
                    {/* Focus & Stress calendar analysis widget */}
                    <FocusHeatmap eventsCount={events.length} />

                    {/* Integrated Interactive Life Graph Dependency section */}
                    <LifeGraphSection 
                      events={events} 
                      selectedEvent={selectedDashboardEvent} 
                      onSelectEvent={setSelectedDashboardEvent} 
                    />

                    {/* Timeline Commitment Feed list */}
                    <div className="space-y-4 text-left">
                      <div className="flex justify-between items-center px-1">
                        <h4 className="text-xs font-bold font-mono text-white/40 uppercase tracking-widest">Active Ingestion Timeline</h4>
                        <span className="text-[9px] font-mono text-white/30 font-bold uppercase">Chronological list</span>
                      </div>

                      {filteredEvents.length === 0 ? (
                        <div className="bg-white/[0.01] border border-white/5 p-12 rounded-3xl text-center">
                          <CalendarIcon className="w-10 h-10 text-white/20 mx-auto mb-3" />
                          <h4 className="text-white font-bold text-sm">Temporal Horizon Unmarked</h4>
                          <p className="text-white/40 text-xs mt-1 max-w-xs mx-auto">No matching commitments detected. Try running a fresh secure scan.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredEvents.map(evt => {
                            const isSelected = selectedDashboardEvent?.id === evt.id;
                            return (
                              <div 
                                key={evt.id}
                                onClick={() => setSelectedDashboardEvent(evt)}
                                className={`p-4 rounded-2xl border transition-all relative flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer ${isSelected ? 'bg-white/[0.03] border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.05)]' : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.02]'}`}
                              >
                                <div className="flex items-start gap-3.5">
                                  <div className="w-10 h-10 rounded-xl bg-[#09090d] border border-white/5 flex items-center justify-center shrink-0">
                                    {getPlatformIcon(evt.platform)}
                                  </div>
                                  <div className="text-left">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <h4 className="text-sm font-bold text-white font-display leading-snug">{evt.title}</h4>
                                      {evt.isGoogleCalendarEvent && (
                                        <span className="text-[8px] font-bold uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Synced</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-white/50 leading-relaxed font-sans mt-0.5 max-w-xl">{evt.description}</p>
                                    
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                                      <span className="text-[10px] font-mono text-white/30 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-white/20" /> {formatEventDate(evt.date)}
                                      </span>
                                      {evt.deadline && (
                                        <span className="text-[10px] font-mono text-rose-400/80 flex items-center gap-1.5">
                                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400/40" /> Deadline: {formatEventDate(evt.deadline)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex md:flex-col items-center md:items-end gap-3 shrink-0 self-end md:self-center">
                                  {getPriorityBadge(evt.priority)}
                                  <div className="flex gap-2.5">
                                    <button 
                                      id={`evt-action-playbook-${evt.id}`}
                                      onClick={(e) => { e.stopPropagation(); handleAskAiPlaybook(evt); }}
                                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[9px] font-mono uppercase font-bold text-white transition-all cursor-pointer"
                                    >
                                      AI Playbook
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right block: Selected Event details, AI recommendation analysis */}
                  <div className="xl:col-span-4 space-y-6">
                    
                    {/* Selected event details card with circular risk score */}
                    {selectedDashboardEvent ? (
                      <div className="space-y-6 text-left">
                        <div className="glass-morphism rounded-3xl p-6 border border-white/5 bg-black/40 space-y-4">
                          <span className="text-[9px] font-mono text-purple-400 uppercase font-bold tracking-widest">Active Focus Item</span>
                          <h3 className="text-2xl font-bold font-display text-white leading-tight">{selectedDashboardEvent.title}</h3>
                          <p className="text-xs text-white/50 leading-relaxed font-sans">{selectedDashboardEvent.description}</p>
                          
                          <div className="flex gap-2.5 pt-2">
                            {selectedDashboardEvent.actionLink && (
                              <a 
                                id="active-item-cta"
                                href={selectedDashboardEvent.actionLink} 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex-1 py-2.5 bg-white text-black font-bold rounded-xl text-center text-xs uppercase tracking-wider font-mono hover:bg-neutral-200 transition-all"
                              >
                                Access Portal
                              </a>
                            )}
                            <button 
                              id="active-item-ask"
                              onClick={() => handleAskAiPlaybook(selectedDashboardEvent)}
                              className="flex-1 py-2.5 bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/20 font-bold rounded-xl text-center text-xs uppercase tracking-wider font-mono transition-all cursor-pointer"
                            >
                              Action Plan
                            </button>
                          </div>
                        </div>

                        {/* circular telemetry gauges */}
                        <RiskAnalysisWidget event={selectedDashboardEvent} />
                      </div>
                    ) : (
                      <div className="glass-morphism rounded-3xl p-8 border border-white/5 bg-black/40 text-center text-white/30 text-xs">
                        No focal node selected. Please click an ingestion event from the left timeline list.
                      </div>
                    )}

                    {/* Autonomous Copilot assistant sidebar panel */}
                    <InteractiveCopilot 
                      events={events} 
                      onSelectEvent={(evt) => setSelectedDashboardEvent(evt)} 
                      onRunScan={triggerScan} 
                    />
                  </div>
                </div>
              </div>

              {/* Operating System HUD footer */}
              <footer className="h-14 border-t border-white/5 bg-[#050505] flex flex-col sm:flex-row items-center justify-between px-6 text-[9px] font-mono text-white/30 font-bold uppercase tracking-wider shrink-0 mt-auto">
                <div className="flex gap-6">
                  <span>SYSTEM FEED: LOCKED ON SANDBOX</span>
                  <span>INGEST STATUS: SYNCED</span>
                  <span>SECURITY: AES-256 ISOLATED</span>
                </div>
                <span>© 2026 PINGLESS OPERATING CO.</span>
              </footer>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY: COMMAND PALETTE (CTRL+K) */}
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <CommandPalette 
            isOpen={isCommandPaletteOpen}
            onClose={() => setIsCommandPaletteOpen(false)}
            events={events}
            onSelectEvent={(evt) => setSelectedDashboardEvent(evt)}
            onToggleEmergency={() => setEmergencyMode(prev => !prev)}
            onTriggerScan={triggerScan}
            onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* OVERLAY: VOICE ASSISTANT MIC PANEL (CTRL+V) */}
      <AnimatePresence>
        {isVoiceAssistantOpen && (
          <VoiceAssistantOverlay 
            isOpen={isVoiceAssistantOpen}
            onClose={() => setIsVoiceAssistantOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* MODAL: MANUAL EVENT REGISTRATION ENTRY */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#0d0d12] border border-white/10 p-6 sm:p-8 rounded-[32px] shadow-[0_0_50px_rgba(168,85,247,0.15)] overflow-y-auto max-h-[90vh] text-white text-left"
            >
              <h3 className="text-xl font-bold font-display text-white mb-1">
                Log New Commitment Node
              </h3>
              <p className="text-xs text-white/40 mb-6 leading-relaxed font-sans">
                Manually record any registration details or external tickets directly into your Pingless timeline.
              </p>

              <form onSubmit={handleCreateManualEvent} className="space-y-4">
                <div>
                  <label className="text-[9px] uppercase font-mono font-bold text-white/40 block mb-1">Commitment Title</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g., ETHIndia Hackathon RSVP"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-purple-500/50 focus:bg-white/[0.04] transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] uppercase font-mono font-bold text-white/40 block mb-1">Channel Class</label>
                    <select
                      value={newPlatform}
                      onChange={e => setNewPlatform(e.target.value as PinglessEvent['platform'])}
                      className="w-full px-4 py-3 bg-[#0d0d12] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-purple-500/50 transition-all"
                    >
                      <option value="custom">Custom Node</option>
                      <option value="github">GitHub Issues</option>
                      <option value="slack">Slack Pin</option>
                      <option value="zoom">Zoom Link</option>
                      <option value="luma">Luma Ticket</option>
                      <option value="eventbrite">Eventbrite</option>
                      <option value="email">Gmail Receipt</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-mono font-bold text-white/40 block mb-1">Urgency Index</label>
                    <select
                      value={newPriority}
                      onChange={e => setNewPriority(e.target.value as PinglessEvent['priority'])}
                      className="w-full px-4 py-3 bg-[#0d0d12] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-purple-500/50 transition-all"
                    >
                      <option value="low">Routine (Low)</option>
                      <option value="medium">Medium</option>
                      <option value="high">Urgent (High)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] uppercase font-mono font-bold text-white/40 block mb-1">Target Date</label>
                    <input 
                      type="date"
                      required
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-purple-500/50 transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] uppercase font-mono font-bold text-white/40 block mb-1">Start Time</label>
                    <input 
                      type="time"
                      value={newTime}
                      onChange={e => setNewTime(e.target.value)}
                      className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-purple-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-mono font-bold text-white/40 block mb-1">Target Deadline (Optional)</label>
                  <input 
                    type="date"
                    value={newDeadline}
                    onChange={e => setNewDeadline(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-mono font-bold text-white/40 block mb-1">Direct Link (CTA Link)</label>
                  <input 
                    type="url"
                    placeholder="https://zoom.us/j/... or team assembly portal"
                    value={newActionLink}
                    onChange={e => setNewActionLink(e.target.value)}
                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-purple-500/50 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[9px] uppercase font-mono font-bold text-white/40 block mb-1">Diagnostic Context / Description</label>
                  <textarea 
                    placeholder="Specify prerequisites or team details..."
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-white outline-none focus:border-purple-500/50 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center gap-2.5 pt-1.5">
                  <input 
                    type="checkbox"
                    id="gcal_sync"
                    checked={saveToCalendar}
                    onChange={e => setSaveToCalendar(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#0d0d12] border-white/5 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="gcal_sync" className="text-xs font-semibold text-white/70 select-none cursor-pointer font-sans">
                    Synchronize immediately to live Google Calendar
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider font-mono text-white transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingManual}
                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold uppercase tracking-wider font-mono rounded-full text-xs transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingManual ? 'Publishing...' : 'Log commitment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIDE DRAWER: AI PLAYBOOK DISCOVERY */}
      <AnimatePresence>
        {selectedEventForAi && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEventForAi(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg h-full bg-[#08080d] border-l border-white/10 shadow-2xl p-6 sm:p-8 flex flex-col justify-between text-white text-left z-10"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                    <h3 className="text-lg font-bold font-display uppercase tracking-wider">
                      AI Playbook Compiler
                    </h3>
                  </div>
                  <button 
                    id="playbook-close"
                    onClick={() => setSelectedEventForAi(null)}
                    className="p-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white border border-white/10 cursor-pointer text-xs uppercase font-mono font-bold"
                  >
                    Close
                  </button>
                </div>

                <div className="bg-white/[0.01] p-4 rounded-2xl border border-white/5">
                  <span className="text-[9px] uppercase font-mono font-bold text-white/40 block mb-1">Target Ingestion Node</span>
                  <h4 className="font-bold text-sm text-white font-display leading-tight">{selectedEventForAi.title}</h4>
                  <span className="text-[10px] font-mono text-purple-400 flex items-center gap-1.5 mt-1.5">
                    <Clock className="w-4 h-4 text-purple-400" /> Scheduled: {formatEventDate(selectedEventForAi.date)}
                  </span>
                </div>

                {/* Playbook contents */}
                <div className="overflow-y-auto max-h-[55vh] pr-1 space-y-4 scrollbar-thin">
                  {isLoadingPlaybook ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                      <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                      <div>
                        <p className="text-xs uppercase font-mono tracking-widest text-purple-400 animate-pulse">Assembling Playbook Steps...</p>
                        <p className="text-[10px] text-white/40 mt-1">Extracting semantic receipts with Gemini</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-white/80 text-xs leading-relaxed whitespace-pre-line space-y-3 font-sans">
                      {aiPlaybook}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-white/5 pt-4">
                <div className="flex items-start gap-2.5 text-xs text-white/40">
                  <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <p className="font-sans leading-normal">
                    This automated plan maps prerequisite milestones directly. Minimize notification noise: your offline preparation schedule is locked.
                  </p>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <OAuthGuide
        isOpen={isOAuthGuideOpen}
        onClose={() => setIsOAuthGuideOpen(false)}
        onUpgradeAccess={handleUpgradeAccess}
        isUpgrading={isUpgradingAuth}
        errorType={oauthErrorType}
      />
    </div>
  );
}
