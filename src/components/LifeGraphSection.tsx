import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, GitMerge, GitPullRequest, Layers, Sparkles, Check, Play, RefreshCw, AlertCircle, Trash, Plus } from 'lucide-react';
import { PinglessEvent, LifeGraphNode, LifeGraphEdge } from '../types';

interface LifeGraphSectionProps {
  events: PinglessEvent[];
  selectedEvent: PinglessEvent | null;
  onSelectEvent: (e: PinglessEvent) => void;
}

export const LifeGraphSection: React.FC<LifeGraphSectionProps> = ({
  events,
  selectedEvent,
  onSelectEvent,
}) => {
  const [nodes, setNodes] = useState<LifeGraphNode[]>([]);
  const [edges, setEdges] = useState<LifeGraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<LifeGraphNode | null>(null);

  // Generate a premium, deterministic dependency graph for the selected event or active events
  useEffect(() => {
    if (events.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const currentEvent = selectedEvent || events[0];

    // Generate step nodes
    const isHackathon = currentEvent.title.toLowerCase().includes('hackathon');
    const isWebinar = currentEvent.platform === 'zoom' || currentEvent.title.toLowerCase().includes('webinar') || currentEvent.title.toLowerCase().includes('workshop');

    let graphNodes: LifeGraphNode[] = [];
    let graphEdges: LifeGraphEdge[] = [];

    if (isHackathon) {
      // 5-Node Sequence for Hackathon
      graphNodes = [
        { id: '1', label: 'Email Confirmation', type: 'registration', status: 'completed', eventId: currentEvent.id, x: 80, y: 150 },
        { id: '2', label: 'Team RSVP Deadline', type: 'dependency', status: 'ongoing', eventId: currentEvent.id, x: 230, y: 100 },
        { id: '3', label: 'GitHub Repository Creation', type: 'dependency', status: 'pending', eventId: currentEvent.id, x: 230, y: 200 },
        { id: '4', label: 'Pre-event Travel & Transit', type: 'travel', status: 'pending', eventId: currentEvent.id, x: 380, y: 150 },
        { id: '5', label: currentEvent.title, type: 'main', status: 'pending', eventId: currentEvent.id, x: 530, y: 150 }
      ];

      graphEdges = [
        { id: 'e1', from: '1', to: '2', type: 'sequence' },
        { id: 'e2', from: '1', to: '3', type: 'sequence' },
        { id: 'e3', from: '2', to: '4', type: 'sequence' },
        { id: 'e4', from: '3', to: '4', type: 'sequence' },
        { id: 'e5', from: '4', to: '5', type: 'sequence' }
      ];
    } else if (isWebinar) {
      // 4-Node Sequence for Webinars/Meetings
      graphNodes = [
        { id: '1', label: 'Webinar Confirmation', type: 'registration', status: 'completed', eventId: currentEvent.id, x: 80, y: 150 },
        { id: '2', label: 'Pre-Read Materials', type: 'prep', status: 'ongoing', eventId: currentEvent.id, x: 230, y: 150 },
        { id: '3', label: 'Calendar Link Sync', type: 'dependency', status: 'completed', eventId: currentEvent.id, x: 380, y: 150 },
        { id: '4', label: currentEvent.title, type: 'main', status: 'pending', eventId: currentEvent.id, x: 530, y: 150 }
      ];

      graphEdges = [
        { id: 'e1', from: '1', to: '2', type: 'sequence' },
        { id: 'e2', from: '2', to: '3', type: 'sequence' },
        { id: 'e3', from: '3', to: '4', type: 'sequence' }
      ];
    } else {
      // Default 4-Node Sequence
      graphNodes = [
        { id: '1', label: 'Registration Ticket', type: 'registration', status: 'completed', eventId: currentEvent.id, x: 80, y: 150 },
        { id: '2', label: 'Prerequisite Tasks', type: 'prep', status: 'ongoing', eventId: currentEvent.id, x: 230, y: 100 },
        { id: '3', label: 'Transit Details Buffer', type: 'travel', status: 'pending', eventId: currentEvent.id, x: 380, y: 150 },
        { id: '4', label: currentEvent.title, type: 'main', status: 'pending', eventId: currentEvent.id, x: 530, y: 150 }
      ];

      graphEdges = [
        { id: 'e1', from: '1', to: '2', type: 'sequence' },
        { id: 'e2', from: '2', to: '3', type: 'sequence' },
        { id: 'e3', from: '3', to: '4', type: 'sequence' }
      ];
    }

    setNodes(graphNodes);
    setEdges(graphEdges);
    setSelectedNode(graphNodes[0]);
  }, [events, selectedEvent]);

  const toggleNodeStatus = (nodeId: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        const nextStatus = n.status === 'completed' ? 'ongoing' : n.status === 'ongoing' ? 'pending' : 'completed';
        const updated = { ...n, status: nextStatus as 'completed' | 'ongoing' | 'pending' };
        if (selectedNode && selectedNode.id === nodeId) {
          setSelectedNode(updated);
        }
        return updated;
      }
      return n;
    }));
  };

  const getNodeColor = (status: 'completed' | 'ongoing' | 'pending', type: string) => {
    if (type === 'main') return { bg: 'bg-purple-500/20', border: 'border-purple-400', text: 'text-purple-300', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]' };
    if (status === 'completed') return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]' };
    if (status === 'ongoing') return { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.1)] animate-pulse' };
    return { bg: 'bg-white/[0.02]', border: 'border-white/10', text: 'text-white/50', glow: '' };
  };

  const getLineGlow = (fromNode: LifeGraphNode, toNode: LifeGraphNode) => {
    if (fromNode.status === 'completed' && toNode.status === 'completed') {
      return 'stroke-emerald-500/50';
    }
    if (fromNode.status === 'completed' || fromNode.status === 'ongoing') {
      return 'stroke-purple-500/40';
    }
    return 'stroke-white/10';
  };

  return (
    <div className="glass-morphism rounded-3xl p-6 border border-white/5 flex flex-col min-h-[500px] relative overflow-hidden bg-black/30">
      
      {/* Background Dots */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <GitMerge className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white font-display uppercase tracking-wider">AI Life Graph Diagram</h4>
            <p className="text-[10px] text-white/40 font-mono">Dynamic node dependency relationship structure</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-white/50 bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-xl font-mono">
          <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          {events.length > 0 ? (selectedEvent?.title || events[0].title) : 'No active graph'}
        </div>
      </div>

      {/* Node Graph Area */}
      <div className="flex-1 min-h-[300px] relative mt-6 flex items-center justify-center z-10 overflow-x-auto overflow-y-hidden select-none">
        <div className="relative w-[650px] h-[300px] shrink-0">
          
          {/* SVG Connector Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {edges.map((edge) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              // Bezier curve calculations for organic flow
              const startX = fromNode.x;
              const startY = fromNode.y;
              const endX = toNode.x;
              const endY = toNode.y;
              const controlX1 = startX + (endX - startX) / 2;
              const controlY1 = startY;
              const controlX2 = startX + (endX - startX) / 2;
              const controlY2 = endY;

              const pathD = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
              
              return (
                <g key={edge.id}>
                  <path 
                    d={pathD} 
                    fill="none" 
                    className={`stroke-2 transition-all duration-500 ${getLineGlow(fromNode, toNode)}`}
                  />
                  {/* Glowing moving particles */}
                  {fromNode.status === 'completed' && toNode.status === 'ongoing' && (
                    <circle r="4" fill="#a855f7" className="animate-[ping_2s_infinite]">
                      <animateMotion dur="3s" repeatCount="indefinite" path={pathD} />
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive HTML Nodes */}
          {nodes.map((node) => {
            const colors = getNodeColor(node.status, node.type);
            const isSelected = selectedNode?.id === node.id;
            
            return (
              <button
                key={node.id}
                onClick={() => setSelectedNode(node)}
                style={{ 
                  left: `${node.x - 70}px`, 
                  top: `${node.y - 30}px`,
                  position: 'absolute'
                }}
                className={`w-[140px] h-[60px] rounded-2xl border p-2 flex flex-col justify-center items-center text-center transition-all ${colors.bg} ${colors.border} ${colors.glow} ${isSelected ? 'ring-2 ring-purple-500/50 scale-105' : 'hover:scale-[1.02]'} cursor-pointer select-none`}
              >
                <p className={`text-[10px] font-bold font-display uppercase tracking-wider truncate w-full ${colors.text}`}>
                  {node.label}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[8px] font-mono uppercase text-white/40">
                  {node.status === 'completed' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  {node.status === 'ongoing' && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                  {node.status === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-white/20" />}
                  {node.status}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Node Control Pane */}
      <AnimatePresence mode="wait">
        {selectedNode && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-t border-white/5 pt-4 mt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center z-10"
          >
            <div className="md:col-span-8 flex gap-3 items-center text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-purple-400">Node Properties</p>
                <h5 className="text-sm font-bold text-white font-display mt-0.5">{selectedNode.label}</h5>
                <p className="text-xs text-white/50 leading-relaxed font-sans">
                  {selectedNode.type === 'registration' && 'Discovered from secure Gmail parse. Validates attendance entry.'}
                  {selectedNode.type === 'prep' && 'AI suggested task queue designed to complete before execution.'}
                  {selectedNode.type === 'travel' && 'Transit coordinates detected. Risk analysis suggests travel scheduling buffers.'}
                  {selectedNode.type === 'main' && 'The target deadline event commitment node.'}
                  {selectedNode.type === 'dependency' && 'Dependency checkpoint generated to avoid final risk overload.'}
                </p>
              </div>
            </div>

            <div className="md:col-span-4 flex justify-end gap-2.5 w-full">
              <button 
                id={`lifegraph-toggle-status-${selectedNode.id}`}
                onClick={() => toggleNodeStatus(selectedNode.id)}
                className="flex-1 md:flex-none px-4 py-2.5 bg-white/[0.02] hover:bg-white/5 border border-white/10 rounded-xl text-xs uppercase tracking-wider font-mono font-bold text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Mark {selectedNode.status === 'completed' ? 'Ongoing' : 'Completed'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
