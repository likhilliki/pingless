import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Mail, ShieldCheck, Play, ArrowRight, CheckCircle, RefreshCw, Layers, Compass, HelpCircle } from 'lucide-react';

interface LandingHeroProps {
  onLoginStandard: () => void;
  onLoginFull: () => void;
  onViewAuthGuide: () => void;
  isLoggingIn: boolean;
}

const SIMULATED_EMAILS = [
  {
    id: '1',
    from: 'Luma <notifications@lu.ma>',
    subject: 'Registration Confirmed: SF AI Hackathon 2026',
    snippet: 'Congratulations! Your spot is secured for June 30 at 9:00 AM. Location: 544 Bryant St. Make sure to update your team repository before submitting...',
    time: '2 hours ago',
    extracted: {
      title: 'SF AI Hackathon 2026',
      platform: 'luma',
      date: '2026-06-30T09:00:00',
      description: 'AI Hackathon at 544 Bryant St. Repository submission deadline is approaching.',
      priority: 'high'
    }
  },
  {
    id: '2',
    from: 'Zoom <no-reply@zoom.us>',
    subject: 'Webinar Confirmation: LLMs in Production',
    snippet: 'Hi there, you are registered for LLMs in Production on July 2 at 3:00 PM EST. Join link: https://zoom.us/j/981242131...',
    time: '1 day ago',
    extracted: {
      title: 'LLMs in Production Webinar',
      platform: 'zoom',
      date: '2026-07-02T15:00:00',
      description: 'Zoom webinar about LLM deployment pipelines and monitoring patterns.',
      priority: 'medium'
    }
  },
  {
    id: '3',
    from: 'Devfolio <support@devfolio.co>',
    subject: 'Acceptance mail for ETHIndia Hackathon',
    snippet: 'You are accepted! Build incredible things at ETHIndia. Deadline to RSVP is July 5. Complete your profile and travel claims here...',
    time: '3 days ago',
    extracted: {
      title: 'ETHIndia RSVP Deadline',
      platform: 'eventbrite',
      date: '2026-07-05T23:59:59',
      description: 'Complete hackathon RSVP confirmation and enter team member details.',
      priority: 'high'
    }
  }
];

export const LandingHero: React.FC<LandingHeroProps> = ({
  onLoginStandard,
  onLoginFull,
  onViewAuthGuide,
  isLoggingIn
}) => {
  const [activeTab, setActiveTab] = useState<'sim' | 'timeline' | 'graph'>('sim');
  const [scannedEmails, setScannedEmails] = useState<string[]>([]);
  const [isScanningSim, setIsScanningSim] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [discoveredEvents, setDiscoveredEvents] = useState<any[]>([]);

  // Simulator Scanning Trigger
  const triggerSimScan = () => {
    if (isScanningSim) return;
    setIsScanningSim(true);
    setScanProgress(0);
    setScannedEmails([]);
    setDiscoveredEvents([]);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanningSim(false);
          return 100;
        }
        return prev + 4;
      });
    }, 80);
  };

  useEffect(() => {
    if (isScanningSim) {
      if (scanProgress === 20) {
        setScannedEmails(['1']);
      } else if (scanProgress === 50) {
        setScannedEmails(['1', '2']);
      } else if (scanProgress === 80) {
        setScannedEmails(['1', '2', '3']);
      }
    } else if (scanProgress === 100) {
      setDiscoveredEvents([
        SIMULATED_EMAILS[0].extracted,
        SIMULATED_EMAILS[1].extracted,
        SIMULATED_EMAILS[2].extracted,
      ]);
    }
  }, [scanProgress, isScanningSim]);

  return (
    <div className="relative min-h-screen grid-bg overflow-hidden flex flex-col items-center justify-center px-4 py-20">
      {/* Dynamic Aurora Glow Backdrops */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-[300px] h-[300px] rounded-full bg-pink-500/5 blur-[100px] pointer-events-none" />

      {/* Main Core Container */}
      <div className="w-full max-w-7xl mx-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Editorial Typography & Product Pitch */}
        <div className="lg:col-span-6 space-y-8 text-left">
          {/* Logo badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-xs uppercase tracking-widest font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            AI Life Operating System
          </motion.div>

          {/* Core Tagline Heading */}
          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl sm:text-7xl font-extrabold tracking-tighter text-white font-display leading-[0.95]"
            >
              No reminders needed—<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-300 to-indigo-400">
                you never forget.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base sm:text-lg text-white/50 max-w-xl font-sans font-light leading-relaxed"
            >
              Pingless is an autonomous intelligence that connects to your secure Google sandbox, scanning registrations, confirmations, and tickets. No manual entry. No constant alerts. Just an elegant, unified Life Graph that knows what you need, before you do.
            </motion.p>
          </div>

          {/* Secure Interactive Login CTA Options */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 max-w-lg pt-4"
          >
            <button 
              id="landing-login-standard"
              onClick={onLoginStandard}
              disabled={isLoggingIn}
              className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 bg-white hover:bg-neutral-200 text-black font-bold rounded-full transition-all active:scale-[0.98] cursor-pointer shadow-lg tracking-tight uppercase text-xs"
            >
              {isLoggingIn ? 'Decrypting Secure Auth...' : 'Launch with Standard Access'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button 
              id="landing-login-full"
              onClick={onLoginFull}
              disabled={isLoggingIn}
              className="flex-1 flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/40 hover:to-blue-600/40 text-purple-200 border border-purple-500/30 font-bold rounded-full transition-all active:scale-[0.98] cursor-pointer uppercase text-xs"
            >
              Automatic Scanner Login
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center gap-6 pt-2"
          >
            <button
              id="landing-view-guide"
              onClick={onViewAuthGuide}
              className="text-xs text-white/40 hover:text-purple-400 font-mono underline bg-transparent border-none cursor-pointer flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Setup & Verification Guide
            </button>
            <span className="text-[10px] uppercase font-mono tracking-wider text-white/30 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Fully secure Google OAuth sandbox
            </span>
          </motion.div>
        </div>

        {/* Right Side: Interactive Live AI Operating System Simulator */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="lg:col-span-6 relative"
        >
          {/* Glass Card Container */}
          <div className="glass-morphism rounded-[32px] p-6 relative overflow-hidden shadow-2xl border border-white/[0.07] bg-[#0c0c14]/90">
            {/* Top Bar Decoration */}
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/60" />
                <span className="w-3 h-3 rounded-full bg-amber-500/60" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="flex gap-1.5">
                <button 
                  onClick={() => setActiveTab('sim')}
                  className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'sim' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-white/30 hover:text-white bg-transparent border-none'}`}
                >
                  Live Inbox Scan
                </button>
                <button 
                  onClick={() => setActiveTab('timeline')}
                  className={`px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'timeline' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-white/30 hover:text-white bg-transparent border-none'}`}
                >
                  Timeline Extract
                </button>
              </div>
            </div>

            {/* TAB 1: LIVE INBOX SCAN SIMULATOR */}
            <AnimatePresence mode="wait">
              {activeTab === 'sim' && (
                <motion.div 
                  key="sim" 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-purple-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-mono text-purple-300 uppercase tracking-widest font-bold">Encrypted Inbox</p>
                        <p className="text-lg font-bold font-display text-white">likhilgowda89@gmail.com</p>
                      </div>
                    </div>
                    
                    <button 
                      id="landing-trigger-scan"
                      onClick={triggerSimScan}
                      disabled={isScanningSim}
                      className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs uppercase tracking-wider font-bold transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      {isScanningSim ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Parsing... {scanProgress}%
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-purple-400 fill-purple-400" />
                          Simulate Scan
                        </>
                      )}
                    </button>
                  </div>

                  {/* Incoming Unstructured Emails */}
                  <div className="space-y-3">
                    {SIMULATED_EMAILS.map((email) => {
                      const isScanned = scannedEmails.includes(email.id);
                      return (
                        <div 
                          key={email.id} 
                          className={`border rounded-2xl p-4 text-left transition-all relative overflow-hidden ${isScanned ? 'bg-purple-500/5 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.05)]' : 'bg-white/[0.01] border-white/5'}`}
                        >
                          {/* Laser glow lines scanning when active */}
                          {isScanningSim && isScanned && !discoveredEvents.length && (
                            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-[shimmer_1.5s_infinite]" />
                          )}
                          
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-white/40 font-mono font-bold tracking-tight">{email.from}</p>
                              <h4 className="text-sm font-bold text-white mt-1 leading-tight">{email.subject}</h4>
                            </div>
                            <span className="text-[10px] font-mono text-white/20 uppercase font-bold shrink-0">{email.time}</span>
                          </div>
                          <p className="text-xs text-white/50 mt-2 line-clamp-2 leading-relaxed font-sans">{email.snippet}</p>

                          {/* Extractions Success Label */}
                          <AnimatePresence>
                            {discoveredEvents.length > 0 && (
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mt-3 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[10px] uppercase font-semibold"
                              >
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                AI Extracted Commitment Node
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: ANIMATED TIMELINE PREVIEW */}
              {activeTab === 'timeline' && (
                <motion.div 
                  key="timeline" 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <p className="text-xs text-white/40 text-left uppercase tracking-wider font-mono">Discovered Life Schedule Nodes</p>
                  
                  <div className="relative border-l border-white/10 pl-6 space-y-6 text-left py-2">
                    <div className="absolute top-2 left-[-4px] w-2 h-2 rounded-full bg-purple-500" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-purple-400 uppercase bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">T-1 Day</span>
                        <h4 className="text-sm font-bold text-white font-display">SF AI Hackathon 2026</h4>
                      </div>
                      <p className="text-xs text-white/40">Starts June 30 at 9:00 AM</p>
                      <p className="text-xs text-white/60 font-sans leading-relaxed">System predicts travel buffer of 45 minutes required. Location: 544 Bryant St.</p>
                    </div>

                    <div className="absolute top-[80px] left-[-4px] w-2 h-2 rounded-full bg-blue-500" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-blue-400 uppercase bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">T-3 Days</span>
                        <h4 className="text-sm font-bold text-white font-display">LLMs in Production Webinar</h4>
                      </div>
                      <p className="text-xs text-white/40">Starts July 2 at 3:00 PM EST</p>
                      <p className="text-xs text-white/60 font-sans leading-relaxed">Calendar link detected inside webinar email. Action item prepared: Prep questions.</p>
                    </div>

                    <div className="absolute top-[165px] left-[-4px] w-2 h-2 rounded-full bg-emerald-500" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">T-6 Days</span>
                        <h4 className="text-sm font-bold text-white font-display">ETHIndia RSVP Deadline</h4>
                      </div>
                      <p className="text-xs text-white/40">Closes July 5 at 23:59 PM</p>
                      <p className="text-xs text-white/60 font-sans leading-relaxed">Risk level elevated (HIGH). System detects no registration confirmation RSVP is fully submitted.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Absolute Background Mesh Overlay for floating aesthetics */}
          <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-[-15px] left-[-15px] w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
        </motion.div>
      </div>

      {/* Decorative footer metrics row */}
      <div className="w-full max-w-7xl mx-auto border-t border-white/5 mt-20 pt-10 text-center grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="space-y-1">
          <p className="text-xs uppercase font-mono font-bold tracking-widest text-purple-400">Scan Pipeline</p>
          <p className="text-2xl font-bold font-display text-white">Zero Setup</p>
          <p className="text-xs text-white/40 leading-relaxed font-sans">Single secure Google sign-in handles entire discovery.</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase font-mono font-bold tracking-widest text-blue-400">AI Model</p>
          <p className="text-2xl font-bold font-display text-white">Gemini 2.5 Pro</p>
          <p className="text-xs text-white/40 leading-relaxed font-sans">Server-side multi-layer context extraction parsing.</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase font-mono font-bold tracking-widest text-emerald-400">Security</p>
          <p className="text-2xl font-bold font-display text-white">Full Encryption</p>
          <p className="text-xs text-white/40 leading-relaxed font-sans">Direct sandboxed sessions never persist plain inbox data.</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase font-mono font-bold tracking-widest text-pink-400">Integrations</p>
          <p className="text-2xl font-bold font-display text-white">Autonomous</p>
          <p className="text-xs text-white/40 leading-relaxed font-sans">Discovers Hackathons, Flight, Zoom, Slack, Devfolio naturally.</p>
        </div>
      </div>
    </div>
  );
};
