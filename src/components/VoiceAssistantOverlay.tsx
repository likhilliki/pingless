import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Volume2, Sparkles, X, RefreshCw, CheckCircle, Zap } from 'lucide-react';

interface VoiceAssistantOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantOverlay: React.FC<VoiceAssistantOverlayProps> = ({ isOpen, onClose }) => {
  const [isListening, setIsListening] = useState(false);
  const [speechText, setSpeechText] = useState('Click mic to speak naturally with Pingless AI...');
  const [aiResponse, setAiResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // SVG Sound Wave elements animating with random heights
  const [waveHeights, setWaveHeights] = useState<number[]>([15, 25, 40, 20, 35, 10, 45, 30, 15, 25, 10]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isListening) {
      interval = setInterval(() => {
        setWaveHeights(Array.from({ length: 11 }, () => Math.floor(Math.random() * 50) + 10));
      }, 100);
    } else {
      setWaveHeights([15, 20, 25, 20, 15, 10, 15, 20, 25, 20, 15]);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  if (!isOpen) return null;

  const triggerVoiceResponse = (promptText: string) => {
    setIsListening(false);
    setIsProcessing(true);
    setSpeechText(`"${promptText}"`);
    setAiResponse('');

    setTimeout(() => {
      setIsProcessing(false);
      let reply = '';
      if (promptText.toLowerCase().includes('prepare')) {
        reply = "SF AI Hackathon starts tomorrow at 9:00 AM. I calculated 48 minutes of transit buffer time and noticed your Team RSVP is incomplete. I've drafted a team assembly reminder and cataloged pre-read templates. Would you like me to queue travel reminders?";
      } else if (promptText.toLowerCase().includes('risk')) {
        reply = "Your biggest risk index is the 'ETHIndia RSVP Deadline' on July 5. The confirmation was detected in Gmail, but you haven't filled out the final team profile submission yet. Probability of missing: 78%. Recommended action: complete team submission tonight.";
      } else {
        reply = "I scanned your credentials. All registered deadlines look stable, except for your Zoom Webinar on Thursday which overlaps with a focus block. I have automatically split your tasks to avoid stress overload.";
      }
      setAiResponse(reply);
    }, 1500);
  };

  const handleMicClick = () => {
    if (isListening) {
      triggerVoiceResponse("Prepare me for tomorrow.");
    } else {
      setIsListening(true);
      setSpeechText('Listening to your voice...');
      setAiResponse('');
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      {/* Aurora visual glow */}
      <div className="absolute w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#07070b]/95 border border-white/10 rounded-[36px] overflow-hidden p-6 relative flex flex-col items-center shadow-[0_0_60px_rgba(168,85,247,0.2)]"
      >
        <button 
          id="voice-assistant-close"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-white/40 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Voice Assistant Visualizer */}
        <div className="mt-8 flex flex-col items-center text-center space-y-6 w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 font-mono text-[10px] uppercase font-bold tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            AI Audio Interface
          </div>
          
          <h4 className="text-xl font-bold text-white font-display">Pingless Voice Assistant</h4>
          <p className="text-xs text-white/50 max-w-xs font-sans leading-relaxed">
            Query your schedule, ask for risk vector audits, or prepare for upcoming commitments in real-time.
          </p>
        </div>

        {/* Dynamic Waveform Section */}
        <div className="h-[120px] flex items-center justify-center gap-1.5 w-full mt-6">
          {waveHeights.map((h, i) => (
            <motion.div 
              key={i} 
              style={{ height: `${h}px` }}
              className={`w-1.5 rounded-full transition-all duration-100 ${isListening ? 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : isProcessing ? 'bg-blue-500 animate-pulse' : 'bg-white/20'}`}
            />
          ))}
        </div>

        {/* Dynamic Transcription Box */}
        <div className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-center min-h-[70px] flex items-center justify-center">
          <p className="text-xs text-white/70 italic font-mono leading-relaxed">{speechText}</p>
        </div>

        {/* AI Response Display */}
        <AnimatePresence mode="wait">
          {isProcessing && (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-6 flex flex-col items-center gap-2"
            >
              <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
              <span className="text-[10px] font-mono uppercase font-bold text-white/40">Leveraging LLM Agent...</span>
            </motion.div>
          )}

          {aiResponse && (
            <motion.div 
              key="response"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 text-left space-y-2.5"
            >
              <p className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider flex items-center gap-1">
                <Volume2 className="w-4 h-4 text-purple-400" /> Pingless Audio Response
              </p>
              <p className="text-xs text-white/80 leading-relaxed font-sans">{aiResponse}</p>
              <div className="flex gap-2">
                <button 
                  id="voice-assistant-ok"
                  onClick={() => setAiResponse('')}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg text-[9px] uppercase tracking-wider font-mono font-bold cursor-pointer"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mic Control Button */}
        <div className="mt-8 mb-4 flex flex-col items-center gap-3">
          <button 
            id="voice-assistant-mic-trigger"
            onClick={handleMicClick}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] scale-95' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_25px_rgba(168,85,247,0.3)] active:scale-95'} cursor-pointer`}
          >
            <Mic className="w-6 h-6" />
          </button>
          
          {!isListening && !isProcessing && (
            <div className="flex gap-2 mt-2">
              <button 
                id="voice-assistant-preset-1"
                onClick={() => triggerVoiceResponse("Prepare me for tomorrow.")}
                className="px-3 py-1 bg-white/[0.02] hover:bg-white/5 border border-white/5 rounded-lg text-[9px] font-mono uppercase font-bold text-white/40 hover:text-white cursor-pointer"
              >
                "Prepare tomorrow"
              </button>
              <button 
                id="voice-assistant-preset-2"
                onClick={() => triggerVoiceResponse("What is my biggest risk?")}
                className="px-3 py-1 bg-white/[0.02] hover:bg-white/5 border border-white/5 rounded-lg text-[9px] font-mono uppercase font-bold text-white/40 hover:text-white cursor-pointer"
              >
                "Check risk"
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
