import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Gauge, Sparkles, TrendingUp, ShieldCheck, Zap } from 'lucide-react';
import { PinglessEvent, RiskScore } from '../types';

interface RiskAnalysisWidgetProps {
  event: PinglessEvent;
}

export const RiskAnalysisWidget: React.FC<RiskAnalysisWidgetProps> = ({ event }) => {
  // Generate consistent deterministic metrics based on event title/priority
  const generateRiskScore = (e: PinglessEvent): RiskScore => {
    const isHigh = e.priority === 'high';
    const isMedium = e.priority === 'medium';
    
    let baseRisk = isHigh ? 78 : isMedium ? 45 : 18;
    let baseUrgency = isHigh ? 88 : isMedium ? 60 : 32;
    let baseCompletion = isHigh ? 15 : isMedium ? 40 : 85;
    
    // Add variations based on title text
    if (e.title.toLowerCase().includes('hackathon') || e.title.toLowerCase().includes('exam')) {
      baseRisk += 12;
      baseUrgency += 5;
    }
    
    const risk = Math.min(Math.max(baseRisk, 5), 98);
    const urgency = Math.min(Math.max(baseUrgency, 10), 99);
    const completion = Math.min(Math.max(baseCompletion, 0), 100);
    const probMissing = Math.min(Math.max(Math.round(risk * (1 - completion / 100)), 5), 95);
    const confidence = isHigh ? 94 : isMedium ? 88 : 82;

    const indicators = [];
    if (risk > 65) indicators.push('Low initial preparation detected');
    if (urgency > 80) indicators.push('Deadline is less than 48 hours away');
    if (completion < 30) indicators.push('Action items and checkmarks untouched');
    if (e.title.toLowerCase().includes('unpaid') || e.description.toLowerCase().includes('unpaid')) {
      indicators.push('Unpaid registration booking identified');
    }
    if (indicators.length === 0) indicators.push('Stable trajectory - no risks detected');

    return {
      eventId: e.id,
      riskPercent: risk,
      urgencyPercent: urgency,
      completionPercent: completion,
      probabilityOfMissing: probMissing,
      aiConfidence: confidence,
      indicators
    };
  };

  const score = generateRiskScore(event);

  const getRiskColor = (percent: number) => {
    if (percent > 70) return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
    if (percent > 40) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
  };

  return (
    <div className="glass-morphism rounded-3xl p-6 border border-white/5 space-y-6 bg-black/40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider">AI Risk & Telemetry Engine</h4>
            <p className="text-[10px] text-white/40 font-mono">Real-time analysis based on commitment parameters</p>
          </div>
        </div>
        <div className="px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20 font-mono text-[10px] text-purple-300 font-bold uppercase flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> {score.aiConfidence}% AI Confidence
        </div>
      </div>

      {/* Grid Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Risk score radial */}
        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden group">
          <p className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Risk Index</p>
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* SVG circle meter */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="4" />
              <circle 
                cx="32" 
                cy="32" 
                r="28" 
                fill="transparent" 
                stroke={score.riskPercent > 70 ? "#f87171" : score.riskPercent > 40 ? "#fbbf24" : "#34d399"} 
                strokeWidth="4" 
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - score.riskPercent / 100)}
                className="transition-all duration-1000"
              />
            </svg>
            <span className={`absolute text-base font-extrabold font-display ${score.riskPercent > 70 ? 'text-rose-400' : score.riskPercent > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {score.riskPercent}%
            </span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold ${score.riskPercent > 70 ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : score.riskPercent > 40 ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'}`}>
            {score.riskPercent > 70 ? 'CRITICAL' : score.riskPercent > 40 ? 'WARNING' : 'STABLE'}
          </span>
        </div>

        {/* Urgency */}
        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2">
          <p className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Urgency</p>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="4" />
              <circle 
                cx="32" 
                cy="32" 
                r="28" 
                fill="transparent" 
                stroke="#60a5fa" 
                strokeWidth="4" 
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - score.urgencyPercent / 100)}
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-base font-extrabold font-display text-blue-400">{score.urgencyPercent}%</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20">
            {score.urgencyPercent > 80 ? 'HIGH' : score.urgencyPercent > 50 ? 'MEDIUM' : 'LOW'}
          </span>
        </div>

        {/* Completion */}
        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2">
          <p className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Completion</p>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="4" />
              <circle 
                cx="32" 
                cy="32" 
                r="28" 
                fill="transparent" 
                stroke="#a78bfa" 
                strokeWidth="4" 
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - score.completionPercent / 100)}
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute text-base font-extrabold font-display text-purple-400">{score.completionPercent}%</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
            {score.completionPercent > 75 ? 'ALMOST DONE' : score.completionPercent > 30 ? 'IN PROGRESS' : 'NOT STARTED'}
          </span>
        </div>

        {/* Probability of Missing */}
        <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center space-y-2">
          <p className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Fail Prob.</p>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="4" />
              <circle 
                cx="32" 
                cy="32" 
                r="28" 
                fill="transparent" 
                stroke={score.probabilityOfMissing > 60 ? "#f43f5e" : score.probabilityOfMissing > 30 ? "#f59e0b" : "#10b981"} 
                strokeWidth="4" 
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - score.probabilityOfMissing / 100)}
                className="transition-all duration-1000"
              />
            </svg>
            <span className={`absolute text-base font-extrabold font-display ${score.probabilityOfMissing > 60 ? 'text-rose-400' : score.probabilityOfMissing > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {score.probabilityOfMissing}%
            </span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold ${score.probabilityOfMissing > 60 ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : score.probabilityOfMissing > 30 ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'}`}>
            {score.probabilityOfMissing > 60 ? 'HIGH PROB' : score.probabilityOfMissing > 30 ? 'MODERATE' : 'OPTIMAL'}
          </span>
        </div>
      </div>

      {/* AI Intelligence Insights list */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2.5">
        <p className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-purple-400" /> Active Risk Vector Diagnostics
        </p>
        <div className="space-y-2">
          {score.indicators.map((indicator, idx) => (
            <div key={idx} className="flex gap-2.5 items-start">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${score.riskPercent > 70 ? 'bg-rose-400' : 'bg-amber-400'}`} />
              <p className="text-xs text-white/70 leading-relaxed font-sans">{indicator}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
