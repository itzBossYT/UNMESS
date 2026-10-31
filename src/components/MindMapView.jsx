import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import UnmessLogo from './UnmessLogo';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Clock, 
  CheckSquare, 
  Square, 
  Bell, 
  Flame, 
  Zap, 
  Layers, 
  Filter, 
  Info,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MindMapView() {
  const { currentSession, toggleTaskComplete } = useApp();
  const { tasks = [], deadlines = [], reminders = [], ideas = [] } = currentSession || {};

  const [zoomLevel, setZoomLevel] = useState(1);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'tasks' | 'deadlines' | 'reminders'
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  // Compute radial layout for nodes around the center
  const nodes = useMemo(() => {
    const list = [];
    const centerX = 400;
    const centerY = 320;

    // Center Core Node
    list.push({
      id: 'center',
      type: 'core',
      x: centerX,
      y: centerY,
      label: 'Cognitive Core',
      subtitle: `${tasks.length + deadlines.length + reminders.length} Units Structured`,
      color: '#a78bfa'
    });

    const allEntities = [];
    if (filterType === 'all' || filterType === 'deadlines') {
      deadlines.forEach(dl => allEntities.push({ ...dl, entityType: 'deadline' }));
    }
    if (filterType === 'all' || filterType === 'tasks') {
      tasks.forEach(t => allEntities.push({ ...t, entityType: 'task' }));
    }
    if (filterType === 'all' || filterType === 'reminders') {
      reminders.forEach(r => allEntities.push({ ...r, entityType: 'reminder' }));
    }

    const total = allEntities.length;
    if (total === 0) return list;

    // Distribute in concentric orbits or angular sections
    allEntities.forEach((item, idx) => {
      const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
      const radius = item.entityType === 'deadline' 
        ? 180 + (idx % 2) * 40 
        : item.priority === 'P1'
        ? 210 + (idx % 2) * 30
        : 230 + (idx % 2) * 50;

      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      list.push({
        id: item.id || `node-${idx}`,
        original: item,
        type: item.entityType,
        x,
        y,
        label: item.title || item.text || 'Action Item',
        priority: item.priority,
        deadlineText: item.deadlineText,
        completed: item.completed,
        color: item.entityType === 'deadline' 
          ? '#f43f5e' 
          : item.priority === 'P1' 
          ? '#e11d48'
          : item.priority === 'P2'
          ? '#8b5cf6'
          : item.entityType === 'reminder'
          ? '#f59e0b'
          : '#10b981'
      });
    });

    return list;
  }, [tasks, deadlines, reminders, filterType]);

  const centerNode = nodes.find(n => n.id === 'center');
  const leafNodes = nodes.filter(n => n.id !== 'center');

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-24">
      {/* Top Banner */}
      <section className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl glass-panel shadow-md border border-slate-200/90 dark:border-zinc-800/80">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary/20 to-tertiary/20 border border-primary/30 flex items-center justify-center text-primary shadow-glow">
            <Network className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-headline font-bold text-slate-900 dark:text-on-surface uppercase tracking-wider">
                Cognitive Topology (Mind Map)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold uppercase">
                Interactive Graph
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-on-surface-variant font-label">
              Visual 2D relationship map connecting raw cognitive entropy into structured deliverable clusters
            </p>
          </div>
        </div>

        {/* Filters & Zoom controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900/80 p-1 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-label">
            {['all', 'tasks', 'deadlines', 'reminders'].map(f => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-3 py-1 rounded-lg capitalize transition-all font-semibold ${
                  filterType === f
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-slate-600 dark:text-on-surface-variant hover:text-slate-900 dark:hover:text-on-surface'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Zoom In / Out */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-900/80 p-1 rounded-xl border border-slate-200 dark:border-zinc-800">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.65, prev - 0.15))}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-on-surface-variant"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-1.5 text-slate-500 font-bold">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.15))}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-on-surface-variant"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="px-2 py-1 text-[11px] font-mono rounded hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-500"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Mind Map Canvas */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200/90 dark:border-zinc-800/80 shadow-2xl relative min-h-[640px] flex items-center justify-center overflow-hidden">
        {/* Ambient Grid Background */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #a78bfa 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {leafNodes.length === 0 ? (
          <div className="text-center p-12 text-slate-400 z-10 flex flex-col items-center">
            <UnmessLogo className="w-12 h-12 text-primary/30 mb-3" />
            <p className="text-sm font-bold text-slate-800 dark:text-on-surface">No nodes in the cognitive graph</p>
            <p className="text-xs text-slate-500 mt-1">Dump thoughts in the Studio or load the Demo to populate the topology.</p>
          </div>
        ) : (
          <div 
            className="transition-transform duration-300 ease-out origin-center w-full h-[640px] flex items-center justify-center relative cursor-grab active:cursor-grabbing"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <svg className="w-[800px] h-[640px] overflow-visible">
              <defs>
                <linearGradient id="link-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.2" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Connecting Bezier Curves */}
              {centerNode && leafNodes.map((leaf) => {
                const isHovered = hoveredNodeId === leaf.id;
                // Calculate curved bezier line
                const midX = (centerNode.x + leaf.x) / 2;
                const midY = (centerNode.y + leaf.y) / 2 - 20;

                return (
                  <path
                    key={`line-${leaf.id}`}
                    d={`M ${centerNode.x} ${centerNode.y} Q ${midX} ${midY} ${leaf.x} ${leaf.y}`}
                    stroke={isHovered ? leaf.color : 'url(#link-grad)'}
                    strokeWidth={isHovered ? 2.5 : 1.4}
                    strokeDasharray={leaf.completed ? '4,4' : 'none'}
                    filter={isHovered ? 'url(#glow)' : 'none'}
                    fill="none"
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Center Core Hub Node */}
              {centerNode && (
                <g className="cursor-pointer">
                  <circle
                    cx={centerNode.x}
                    cy={centerNode.y}
                    r={48}
                    fill="url(#unmess-grad-top)"
                    className="animate-glow-pulse shadow-glow"
                  />
                  <circle
                    cx={centerNode.x}
                    cy={centerNode.y}
                    r={56}
                    stroke="#a78bfa"
                    strokeWidth="1.5"
                    strokeDasharray="6,4"
                    fill="transparent"
                    className="animate-spin opacity-40 origin-center"
                    style={{ animationDuration: '24s' }}
                  />
                  <foreignObject
                    x={centerNode.x - 36}
                    y={centerNode.y - 36}
                    width={72}
                    height={72}
                    className="pointer-events-none"
                  >
                    <div className="w-full h-full flex flex-col items-center justify-center text-white">
                      <UnmessLogo className="w-7 h-7 text-white" />
                      <span className="text-[9px] font-mono font-bold mt-1 uppercase tracking-tight">Core</span>
                    </div>
                  </foreignObject>
                </g>
              )}

              {/* Leaf Nodes */}
              {leafNodes.map((node) => {
                const isHovered = hoveredNodeId === node.id;
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onClick={() => {
                      if (node.type === 'task') {
                        toggleTaskComplete(node.original.id);
                        confetti({
                          particleCount: 25,
                          spread: 45,
                          origin: { y: 0.6 }
                        });
                      }
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Outer Glow Halo on Hover */}
                    {isHovered && (
                      <circle
                        r={28}
                        fill={node.color}
                        opacity={0.2}
                        className="animate-ping"
                      />
                    )}

                    {/* Node Circle */}
                    <circle
                      r={isHovered ? 20 : 16}
                      fill={node.completed ? '#374151' : node.color}
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="transition-all duration-200 shadow-md"
                    />

                    {/* Checkmark or Icon inside node */}
                    {node.completed ? (
                      <path
                        d="M -5 0 L -1 4 L 5 -3"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        fill="none"
                      />
                    ) : (
                      <circle
                        r={4}
                        fill="#ffffff"
                        opacity={0.9}
                      />
                    )}

                    {/* Node Label Capsule */}
                    <foreignObject
                      x={-90}
                      y={isHovered ? 24 : 18}
                      width={180}
                      height={70}
                      className="pointer-events-none"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-headline font-semibold shadow-md border max-w-full truncate backdrop-blur-md transition-all ${
                            isHovered
                              ? 'bg-slate-900 text-white border-primary scale-105'
                              : 'bg-white/95 dark:bg-zinc-900/90 text-slate-800 dark:text-on-surface border-slate-200 dark:border-zinc-800'
                          } ${node.completed ? 'line-through opacity-60' : ''}`}
                        >
                          {node.label}
                        </div>
                        {node.deadlineText && (
                          <span className="text-[9px] font-mono text-rose-500 font-bold mt-0.5">
                            ⏰ {node.deadlineText}
                          </span>
                        )}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-6 flex items-center gap-4 bg-white/90 dark:bg-zinc-950/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-[11px] font-label shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-600 dark:text-on-surface-variant font-medium">Critical Deadlines</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500" />
            <span className="text-slate-600 dark:text-on-surface-variant font-medium">Action Items</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600 dark:text-on-surface-variant font-medium">Reminders</span>
          </div>
        </div>
      </div>
    </div>
  );
}

