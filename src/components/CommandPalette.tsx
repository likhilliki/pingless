import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, Terminal, ShieldAlert, Zap, Compass, Volume2, X, Eye } from 'lucide-react';
import { PinglessEvent } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  events: PinglessEvent[];
  onSelectEvent: (e: PinglessEvent) => void;
  onToggleEmergency: () => void;
  onTriggerScan: () => void;
  onOpenVoiceAssistant: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  events,
  onSelectEvent,
  onToggleEmergency,
  onTriggerScan,
  onOpenVoiceAssistant,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle keyboard events inside command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter actions or events based on search query
  const staticActions = [
    {
      id: 'scan',
      title: 'Scan Gmail Inbox',
      description: 'Run deep learning algorithm to discover registration confirmations',
      shortcut: '⌘S',
      action: () => { onTriggerScan(); onClose(); },
      icon: <Terminal className="w-4 h-4 text-purple-400" />
    },
    {
      id: 'emergency',
      title: 'Toggle AI Emergency Mode',
      description: 'Switch HUD interface to focus strictly on immediate critical deadlines',
      shortcut: '⌘E',
      action: () => { onToggleEmergency(); onClose(); },
      icon: <ShieldAlert className="w-4 h-4 text-rose-400" />
    },
    {
      id: 'voice',
      title: 'Launch Voice Assistant Panel',
      description: 'Speak in natural language to query scheduling stress levels',
      shortcut: '⌘V',
      action: () => { onOpenVoiceAssistant(); onClose(); },
      icon: <Volume2 className="w-4 h-4 text-blue-400" />
    }
  ];

  const matchedActions = staticActions.filter(act => 
    act.title.toLowerCase().includes(query.toLowerCase()) || 
    act.description.toLowerCase().includes(query.toLowerCase())
  );

  const matchedEvents = events.filter(evt => 
    evt.title.toLowerCase().includes(query.toLowerCase()) || 
    evt.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.97, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: -10 }}
        className="w-full max-w-xl bg-[#09090d] border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col"
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-white/[0.01]">
          <Search className="w-5 h-5 text-white/40 shrink-0" />
          <input
            id="command-palette-input"
            ref={inputRef}
            type="text"
            placeholder="Search events, trigger actions, or execute code scripts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-white outline-none placeholder-white/30 text-sm font-sans"
          />
          <button 
            id="command-palette-close"
            onClick={onClose}
            className="p-1 rounded bg-white/5 text-white/40 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List Content */}
        <div className="max-h-[350px] overflow-y-auto p-3 space-y-4">
          
          {/* Actions Section */}
          {matchedActions.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-widest px-3 mb-2">Core Operating Functions</p>
              {matchedActions.map((act) => (
                <button
                  id={`command-action-${act.id}`}
                  key={act.id}
                  onClick={act.action}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 flex items-center justify-between transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0">
                      {act.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white font-sans">{act.title}</p>
                      <p className="text-[10px] text-white/40 mt-0.5 font-sans">{act.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded uppercase font-bold group-hover:text-white transition-all">
                    {act.shortcut}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Events Section */}
          {matchedEvents.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-mono text-blue-400 uppercase font-bold tracking-widest px-3 mb-2">Discovered Commitments</p>
              {matchedEvents.map((evt) => (
                <button
                  id={`command-event-${evt.id}`}
                  key={evt.id}
                  onClick={() => { onSelectEvent(evt); onClose(); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/5 flex items-center justify-between transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <Compass className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-white font-sans truncate">{evt.title}</p>
                      <p className="text-[10px] text-white/40 mt-0.5 font-sans truncate">{evt.description}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded font-bold uppercase shrink-0 flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Select
                  </span>
                </button>
              ))}
            </div>
          )}

          {matchedActions.length === 0 && matchedEvents.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm text-white/30 font-sans">No matches found for "{query}"</p>
              <p className="text-xs text-white/20 mt-1 font-mono">Try searching "emergency", "voice", or event keyword</p>
            </div>
          )}
        </div>

        {/* Palette Footer Help Info */}
        <div className="p-3 border-t border-white/5 bg-white/[0.01] flex justify-between text-[10px] font-mono text-white/30 font-bold uppercase px-4">
          <span>↑↓ Navigate</span>
          <span>ESC to Dismiss</span>
        </div>
      </motion.div>
    </div>
  );
};
