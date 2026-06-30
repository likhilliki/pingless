import React from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Brain, CheckSquare, Flame, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { InsightsData } from '../types';

interface FocusHeatmapProps {
  eventsCount: number;
}

export const FocusHeatmap: React.FC<FocusHeatmapProps> = ({ eventsCount }) => {
  // Generate beautiful simulated analytical data
  const data: InsightsData = {
    stressScore: eventsCount > 4 ? 74 : eventsCount > 2 ? 48 : 22,
    weeklyTrend: [
      { day: 'Mon', value: 45 },
      { day: 'Tue', value: 85 }, // High because Tuesday meetings overlap
      { day: 'Wed', value: 60 },
      { day: 'Thu', value: 30 },
      { day: 'Fri', value: 78 }, // High because Friday releases
      { day: 'Sat', value: 20 },
      { day: 'Sun', value: 15 },
    ],
    avgPrepDays: 2.8,
    unpaidCount: eventsCount > 3 ? 1 : 0,
    clashingCount: eventsCount > 5 ? 2 : 0,
    successRate: 88,
  };

  // Generate 24 columns for a custom "stress calendar grid" resembling GitHub contributions
  const stressGrid = Array.from({ length: 48 }, (_, i) => {
    // Make weekends low, mid-week higher
    const day = Math.floor(i / 7);
    const dayIndex = i % 7;
    let level: 'none' | 'low' | 'medium' | 'high' = 'none';
    
    const value = Math.sin(i * 0.4) * 50 + 50;
    if (value > 75) level = 'high';
    else if (value > 45) level = 'medium';
    else if (value > 15) level = 'low';

    return { id: i, level, dayIndex };
  });

  const getLevelColor = (level: 'none' | 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high': return 'bg-rose-500/80 shadow-[0_0_8px_rgba(239,68,68,0.3)]';
      case 'medium': return 'bg-amber-500/60';
      case 'low': return 'bg-purple-500/30';
      default: return 'bg-white/[0.02] border border-white/5';
    }
  };

  return (
    <div className="glass-morphism rounded-3xl p-6 border border-white/5 space-y-6 bg-black/40 text-left">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Brain className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider">Focus Engine & Stress Metrics</h4>
            <p className="text-[10px] text-white/40 font-mono">Cognitive load tracking and chronological insights</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[10px] px-2.5 py-1 rounded font-bold uppercase">
          <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          Stress: {data.stressScore}%
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly stress trend chart */}
        <div className="lg:col-span-7 bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-[230px]">
          <div>
            <p className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Cognitive Load Waves</p>
            <h5 className="text-lg font-bold text-white font-display mt-0.5">Stress Velocity Timeline</h5>
          </div>
          
          <div className="h-[120px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.weeklyTrend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" fontSize={10} fontFamily="monospace" />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} fontFamily="monospace" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d0d12', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: '10px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#stressGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Chronological Stress Grid (GitHub Style) */}
        <div className="lg:col-span-5 bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-mono text-white/40 uppercase font-bold tracking-wider">Temporal Density Grid</p>
            <h5 className="text-lg font-bold text-white font-display mt-0.5">Commitment Heatmap</h5>
          </div>

          <div className="grid grid-flow-col grid-rows-7 gap-1 mt-4 justify-center">
            {stressGrid.map((cell) => (
              <div 
                key={cell.id} 
                className={`w-3.5 h-3.5 rounded-[3px] transition-all duration-300 ${getLevelColor(cell.level)}`}
                title={`Day ${Math.floor(cell.id / 7) + 1} load level: ${cell.level}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-white/30 uppercase font-bold mt-4 pt-2 border-t border-white/5">
            <span>Low Stress</span>
            <div className="flex gap-1.5 items-center">
              <span className="w-2.5 h-2.5 rounded-[2px] bg-white/[0.02] border border-white/5" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-purple-500/30" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-amber-500/60" />
              <span className="w-2.5 h-2.5 rounded-[2px] bg-rose-500/80" />
            </div>
            <span>High Stress</span>
          </div>
        </div>
      </div>

      {/* AI Behavioral Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1">
          <p className="text-[10px] font-mono text-white/40 uppercase font-bold">Preparation Speed</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-white">{data.avgPrepDays} days</span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Optimal</span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed font-sans">Average preparation loop starts 2.8 days before major submission windows.</p>
        </div>

        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1">
          <p className="text-[10px] font-mono text-white/40 uppercase font-bold">Critical Overlap</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-white">{data.clashingCount} items</span>
            <span className={`text-[10px] font-mono font-bold uppercase ${data.clashingCount > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
              {data.clashingCount > 0 ? 'Warning' : 'None'}
            </span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed font-sans">Meetings tend to overlap every Tuesday afternoon. Optimize focused blocks.</p>
        </div>

        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-1">
          <p className="text-[10px] font-mono text-white/40 uppercase font-bold">Event Attendance</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-white">{data.successRate}%</span>
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Velocity</span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed font-sans">You attend 88% of webinars. Inactive confirmations are archived by AI.</p>
        </div>
      </div>
    </div>
  );
};
