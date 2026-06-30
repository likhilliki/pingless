import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Zap, Compass, CheckCircle, Flame, ArrowLeft, VolumeX, Shield, Play, Pause, RefreshCw } from 'lucide-react';
import { PinglessEvent } from '../types';

interface EmergencyHUDProps {
  events: PinglessEvent[];
  onDeactivate: () => void;
}

export const EmergencyHUD: React.FC<EmergencyHUDProps> = ({ events, onDeactivate }) => {
  const [focusTime, setFocusTime] = useState(25 * 60); // 25 min Pomodoro
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [selectedTask, setSelectedTask] = useState<PinglessEvent | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && focusTime > 0) {
      interval = setInterval(() => {
        setFocusTime(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, focusTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const criticalEvents = events.filter(e => e.priority === 'high').slice(0, 3);

  useEffect(() => {
    if (criticalEvents.length > 0 && !selectedTask) {
      setSelectedTask(criticalEvents[0]);
    }
  }, [events, selectedTask]);

  // Handle manual focus simulation recommendations
  useEffect(() => {
    if (selectedTask) {
      setIsSynthesizing(true);
      setAiSuggestions([]);
      const timer = setTimeout(() => {
        setIsSynthesizing(false);
        setAiSuggestions([
          `1. Block all Chrome tabs except for the submitted project specifications`,
          `2. Turn on Do Not Disturb (DND) across your system for the next 2 hours`,
          `3. Pingless has identified travel route: clear transit window starts in 45 minutes`,
          `4. Initiate 25 minutes of deep Pomodoro blocks to code repository dependencies`
        ]);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [selectedTask]);

  return (
    <div className="fixed inset-0 z-[120] bg-neutral-950 text-white overflow-y-auto font-sans">
      
      {/* High contrast diagnostic flashing grid backdrops */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-950/40 via-neutral-950 to-neutral-950 opacity-90 pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

      {/* Flashing Alert Line at Top */}
      <div className="bg-rose-600/20 border-b border-rose-500/30 px-4 py-2.5 flex items-center justify-between text-[11px] font-mono tracking-widest uppercase font-bold text-rose-400">
        <span className="flex items-center gap-1.5 animate-pulse">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          SYSTEM STATE: CRITICAL DEADLINES ENGAGED (EMERGENCY SPEEDWAY)
        </span>
        <button 
          id="emergency-hud-deactivate-top"
          onClick={onDeactivate}
          className="text-white hover:text-rose-300 transition-all font-mono border border-white/20 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded text-[10px] cursor-pointer"
        >
          Deactivate HUD
        </button>
      </div>

      <div className="w-full max-w-6xl mx-auto px-4 py-10 space-y-8 relative z-10 text-left">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight font-display text-white">AI Emergency Mode</h2>
            <p className="text-xs text-rose-400 font-mono mt-1">Zero distractions. Only critical deadlines and action tasks remain.</p>
          </div>
          <button 
            id="emergency-hud-back"
            onClick={onDeactivate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Exit Critical Workspace
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Top Critical Deadlines */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-mono uppercase font-bold tracking-widest text-white/40">Critical Deadline Targets</h3>
            
            {criticalEvents.length === 0 ? (
              <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl text-center text-white/40 text-xs">
                No immediate critical deadlines. Stress level safe!
              </div>
            ) : (
              <div className="space-y-3">
                {criticalEvents.map((evt) => {
                  const isSelected = selectedTask?.id === evt.id;
                  return (
                    <button
                      id={`emergency-task-select-${evt.id}`}
                      key={evt.id}
                      onClick={() => setSelectedTask(evt)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${isSelected ? 'bg-rose-500/10 border-rose-500/50 shadow-[0_0_20px_rgba(239,68,68,0.15)] scale-[1.01]' : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.02]'}`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-mono font-bold text-rose-400 uppercase bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">T-24 Hrs</span>
                          <span className="text-[10px] font-mono text-white/30 uppercase font-bold">{evt.platform}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white font-display mt-2 leading-snug">{evt.title}</h4>
                      </div>
                      <p className="text-xs text-white/40 mt-1 line-clamp-1 font-sans">{evt.description}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Pomodoro Timer widget */}
            <div className="p-6 rounded-3xl border border-rose-500/20 bg-rose-500/[0.02] flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest font-bold">Deep Focus Pomodoro</span>
              <h2 className="text-5xl font-extrabold font-display text-white tracking-widest">{formatTime(focusTime)}</h2>
              
              <div className="flex gap-2">
                <button 
                  id="emergency-timer-toggle"
                  onClick={() => setIsTimerActive(!isTimerActive)}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs uppercase tracking-wider font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isTimerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  {isTimerActive ? 'Hold Timer' : 'Begin Focus'}
                </button>
                <button 
                  id="emergency-timer-reset"
                  onClick={() => { setFocusTime(25 * 60); setIsTimerActive(false); }}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 rounded-xl text-xs font-mono uppercase font-bold transition-all cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: AI Action Deck & Solutions */}
          <div className="lg:col-span-8 space-y-6">
            <h3 className="text-xs font-mono uppercase font-bold tracking-widest text-white/40">AI Action & Assistance Deck</h3>
            
            {selectedTask ? (
              <div className="glass-morphism rounded-3xl border border-rose-500/20 p-6 bg-rose-500/[0.01] space-y-6">
                
                {/* Active Task Info */}
                <div className="border-b border-white/5 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-rose-400 uppercase font-bold">Currently Resolving</span>
                      <h3 className="text-xl font-bold text-white font-display mt-1">{selectedTask.title}</h3>
                    </div>
                    {selectedTask.actionLink && (
                      <a 
                        id="emergency-action-link"
                        href={selectedTask.actionLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs uppercase tracking-wider font-mono font-bold hover:bg-rose-500/30 transition-all flex items-center gap-1"
                      >
                        Launch Portal
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-white/50 mt-2 font-sans leading-relaxed">{selectedTask.description}</p>
                </div>

                {/* AI Actions suggestions */}
                <div className="space-y-3">
                  <p className="text-[10px] font-mono text-rose-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-rose-400 animate-pulse" />
                    Autonomous Task Defusion Commands
                  </p>

                  <AnimatePresence mode="wait">
                    {isSynthesizing ? (
                      <motion.div 
                        key="sync"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="py-10 flex flex-col items-center gap-2 text-center"
                      >
                        <RefreshCw className="w-5 h-5 text-rose-400 animate-spin" />
                        <span className="text-[10px] font-mono text-white/30 uppercase font-bold">Synthesizing Critical Directives...</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-3 text-left"
                      >
                        {aiSuggestions.map((sug, idx) => (
                          <div key={idx} className="bg-white/[0.01] border border-white/5 p-4 rounded-xl flex items-start gap-3">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                            <p className="text-xs text-white/80 font-sans leading-relaxed">{sug}</p>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Action Controls */}
                <div className="flex gap-3 pt-2">
                  <button 
                    id="emergency-resolve-button"
                    onClick={() => {
                      alert('Pingless has locked your active session. External notifications muted. Distraction shield is active.');
                    }}
                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all font-mono flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/10"
                  >
                    <Shield className="w-4 h-4" /> Activate DND & Lock Screen
                  </button>
                  <button 
                    id="emergency-done-button"
                    onClick={() => {
                      alert('Fantastic job! Target deadline completed successfully.');
                      onDeactivate();
                    }}
                    className="px-5 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 font-bold text-xs uppercase tracking-wider rounded-xl transition-all font-mono flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" /> Completed Task
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/[0.01] border border-white/5 p-8 rounded-3xl text-center text-white/40 text-xs">
                No active target selected. Please choose a task on the left.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
