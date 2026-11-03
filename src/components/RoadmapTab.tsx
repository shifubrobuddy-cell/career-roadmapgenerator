import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ExternalLink, 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  Layers, 
  Sparkles, 
  Code2, 
  BookOpen, 
  ChevronRight,
  Flame,
  CheckSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CareerTrack, Milestone, CareerStage } from '../types';

interface RoadmapTabProps {
  activeCareer: CareerTrack;
  milestones: Milestone[];
  completedMilestoneIds: number[];
  inProgressMilestoneIds: number[];
  onToggleComplete: (id: number) => void;
  onToggleInProgress: (id: number) => void;
}

export const RoadmapTab: React.FC<RoadmapTabProps> = ({
  activeCareer,
  milestones,
  completedMilestoneIds,
  inProgressMilestoneIds,
  onToggleComplete,
  onToggleInProgress,
}) => {
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'serpentine' | 'kanban'>('serpentine');
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<number | null>(null);
  const [weeklyStudyHours, setWeeklyStudyHours] = useState<number>(15);

  const careerMilestones = milestones.filter((m) => m.careerId === activeCareer.id);

  // Pomodoro Focus Timer State
  const [pomodoroSeconds, setPomodoroSeconds] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [selectedFocusMilestone, setSelectedFocusMilestone] = useState<number>(() => careerMilestones[0]?.id || 101);

  // Sync focus milestone and expanded item with active track
  useEffect(() => {
    if (careerMilestones.length > 0) {
      if (!careerMilestones.some((m) => m.id === selectedFocusMilestone)) {
        setSelectedFocusMilestone(careerMilestones[0].id);
      }
      if (expandedMilestoneId === null || !careerMilestones.some((m) => m.id === expandedMilestoneId)) {
        setExpandedMilestoneId(careerMilestones[0].id);
      }
    }
  }, [activeCareer.id, careerMilestones]);

  // Interactive Checklist Local State
  const [checklistChecks, setChecklistChecks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('pathforge_checklist_checks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleChecklistItem = (milestoneId: number, checkIndex: number) => {
    const key = `${milestoneId}_${checkIndex}`;
    const next = { ...checklistChecks, [key]: !checklistChecks[key] };
    setChecklistChecks(next);
    localStorage.setItem('pathforge_checklist_checks', JSON.stringify(next));
  };

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && pomodoroSeconds > 0) {
      interval = setInterval(() => {
        setPomodoroSeconds((prev) => prev - 1);
      }, 1000);
    } else if (pomodoroSeconds === 0) {
      setIsTimerRunning(false);
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      } catch (e) {
        // ignore
      }
      if (timerMode === 'work') {
        setTimerMode('break');
        setPomodoroSeconds(5 * 60);
      } else {
        setTimerMode('work');
        setPomodoroSeconds(25 * 60);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, pomodoroSeconds, timerMode]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredMilestones = selectedStage === 'All'
    ? careerMilestones
    : careerMilestones.filter((m) => m.stage === selectedStage);

  // Velocity calculations
  const totalHours = careerMilestones.reduce((acc, m) => acc + m.estimatedHours, 0);
  const remainingHours = careerMilestones
    .filter((m) => !completedMilestoneIds.includes(m.id))
    .reduce((acc, m) => acc + m.estimatedHours, 0);
  const weeksToCompletion = Math.ceil(remainingHours / (weeklyStudyHours || 1));

  const handleMarkCompleteWithConfetti = (id: number) => {
    onToggleComplete(id);
    if (!completedMilestoneIds.includes(id)) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7', '#06b6d4'],
        });
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Controls Header */}
      <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800 p-5 md:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
              <span>Interactive Curriculum Roadmap</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{activeCareer.name}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              {activeCareer.tagline}
            </h2>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setViewMode('serpentine')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'serpentine'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Step-by-Step Path
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'kanban'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kanban Board
            </button>
          </div>
        </div>

        {/* Filters and Pace Slider */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-3 border-t border-slate-800/80 items-center">
          
          {/* Stage pills */}
          <div className="lg:col-span-6 flex items-center gap-1.5 overflow-x-auto pb-1">
            {['All', 'Fundamentals', 'Intermediate', 'Advanced'].map((stage) => (
              <button
                key={stage}
                onClick={() => setSelectedStage(stage)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                  selectedStage === stage
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {stage === 'All' ? 'All Milestones' : stage}
              </button>
            ))}
          </div>

          {/* Velocity Pace Calculator */}
          <div className="lg:col-span-6 flex flex-wrap items-center justify-between sm:justify-end gap-3 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-medium">Study Pace:</span>
              <span className="font-mono font-bold text-white">{weeklyStudyHours} hrs/wk</span>
            </div>

            <input
              type="range"
              min="5"
              max="40"
              step="5"
              value={weeklyStudyHours}
              onChange={(e) => setWeeklyStudyHours(Number(e.target.value))}
              className="w-28 accent-emerald-500 cursor-pointer"
            />

            <div className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono font-bold text-[11px]">
              ETA: ~{weeksToCompletion} Weeks
            </div>
          </div>

        </div>
      </div>

      {/* Split View: Pomodoro Focus Study Lab + Serpentine Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Focus Lab (Sticky on desktop) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl bg-[#0f1422]/95 border border-slate-800 p-5 shadow-xl space-y-4 sticky top-24">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  POMODORO STUDY LAB
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {timerMode === 'work' ? '🧠 Deep Work' : '☕ Quick Rest'}
              </span>
            </div>

            {/* Timer Display */}
            <div className="text-center py-4 bg-[#0a0d16] rounded-xl border border-slate-800/80">
              <div className="text-5xl font-mono font-extrabold text-white tracking-wider">
                {formatTimer(pomodoroSeconds)}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                {timerMode === 'work' ? 'Sprint Interval (25m)' : 'Recovery Interval (5m)'}
              </div>

              {/* Timer Controls */}
              <div className="flex items-center justify-center gap-2.5 mt-4">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                    isTimerRunning
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isTimerRunning ? 'Pause' : 'Start Focus'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setPomodoroSeconds(timerMode === 'work' ? 25 * 60 : 5 * 60);
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Focus Milestone Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Topic Focus:
              </label>
              <select
                value={selectedFocusMilestone}
                onChange={(e) => setSelectedFocusMilestone(Number(e.target.value))}
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {careerMilestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    Step {m.stepOrder}: {m.title} (~{m.estimatedHours}h)
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Stats in Focus Box */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <div className="font-mono font-bold text-emerald-400">{remainingHours}h</div>
                <div className="text-[10px] text-slate-500 uppercase">Hours to Goal</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <div className="font-mono font-bold text-teal-400">{totalHours}h</div>
                <div className="text-[10px] text-slate-500 uppercase">Total Curricula</div>
              </div>
            </div>

          </div>
        </div>

        {/* Right Milestones Area */}
        <div className="lg:col-span-8">
          
          {viewMode === 'serpentine' ? (
            /* Serpentine Step Path View */
            <div className="space-y-4">
              {filteredMilestones.map((milestone, idx) => {
                const isCompleted = completedMilestoneIds.includes(milestone.id);
                const isInProgress = inProgressMilestoneIds.includes(milestone.id);
                const isExpanded = expandedMilestoneId === milestone.id;

                return (
                  <div
                    key={milestone.id}
                    className={`rounded-2xl border transition-all duration-200 ${
                      isCompleted
                        ? 'bg-[#0e1724]/80 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
                        : isInProgress
                        ? 'bg-[#141a29] border-amber-500/50 shadow-lg'
                        : 'bg-[#0f1422]/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="p-5 md:p-6 space-y-4">
                      
                      {/* Top Bar of Card */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleMarkCompleteWithConfetti(milestone.id)}
                            className="shrink-0 transition transform hover:scale-110 active:scale-95"
                            title={isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-500/20" />
                            ) : isInProgress ? (
                              <div className="w-6 h-6 rounded-full border-2 border-amber-400 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                              </div>
                            ) : (
                              <Circle className="w-6 h-6 text-slate-600 hover:text-slate-400" />
                            )}
                          </button>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-slate-400">
                                Step {milestone.stepOrder}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                milestone.stage === 'Fundamentals'
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                  : milestone.stage === 'Intermediate'
                                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {milestone.stage}
                              </span>
                              <span className="text-[11px] text-slate-500 font-mono">
                                ~{milestone.estimatedHours} hrs
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-white mt-1">
                              {milestone.title}
                            </h3>
                          </div>
                        </div>

                        {/* Status Badges */}
                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            onClick={() => setExpandedMilestoneId(isExpanded ? null : milestone.id)}
                            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition"
                            title="Expand Details & Checklist"
                          >
                            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-slate-400 text-xs md:text-sm leading-relaxed pl-9">
                        {milestone.description}
                      </p>

                      {/* Key Topics Badges */}
                      <div className="flex flex-wrap gap-1.5 pl-9">
                        {milestone.keyTopics.map((topic, tidx) => (
                          <span
                            key={tidx}
                            className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 text-[11px] font-medium border border-slate-800"
                          >
                            #{topic}
                          </span>
                        ))}
                      </div>

                      {/* Expanded Section: Interactive Checklist & Project */}
                      {isExpanded && (
                        <div className="pl-9 pt-4 border-t border-slate-800/80 space-y-4">
                          
                          {/* Checklist */}
                          {milestone.checklist && milestone.checklist.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Verification Checklist:</span>
                              </div>
                              <div className="space-y-1.5 bg-slate-950/50 p-3 rounded-xl border border-slate-800/70">
                                {milestone.checklist.map((item, cidx) => {
                                  const checked = !!checklistChecks[`${milestone.id}_${cidx}`];
                                  return (
                                    <label
                                      key={cidx}
                                      onClick={() => toggleChecklistItem(milestone.id, cidx)}
                                      className="flex items-center gap-2.5 text-xs cursor-pointer select-none group"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => {}}
                                        className="rounded border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer accent-emerald-500"
                                      />
                                      <span className={`${checked ? 'line-through text-slate-500' : 'text-slate-300 group-hover:text-white'}`}>
                                        {item}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Mini Project */}
                          {milestone.miniProjectTitle && (
                            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs space-y-1">
                              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                                <Code2 className="w-3.5 h-3.5" />
                                <span>Lab Practical: {milestone.miniProjectTitle}</span>
                              </div>
                              <p className="text-slate-400 text-[11px]">
                                {milestone.miniProjectDesc}
                              </p>
                            </div>
                          )}

                          {/* Resource Link & Action Buttons */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            {milestone.resourceLink && (
                              <a
                                href={milestone.resourceLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>{milestone.resourceTitle || 'View Learning Documentation'}</span>
                                <ExternalLink className="w-3 h-3 ml-0.5" />
                              </a>
                            )}

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onToggleInProgress(milestone.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                                  isInProgress
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                                }`}
                              >
                                {isInProgress ? 'In Progress ⏳' : 'Mark In Progress'}
                              </button>

                              <button
                                onClick={() => handleMarkCompleteWithConfetti(milestone.id)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                                  isCompleted
                                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md'
                                }`}
                              >
                                {isCompleted ? 'Reset to Incomplete' : 'Complete Step ✓'}
                              </button>
                            </div>
                          </div>

                        </div>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Kanban Board Mode */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Column 1: Backlog / To Do */}
              <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    <span>To Explore</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
                    {careerMilestones.filter((m) => !completedMilestoneIds.includes(m.id) && !inProgressMilestoneIds.includes(m.id)).length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {careerMilestones
                    .filter((m) => !completedMilestoneIds.includes(m.id) && !inProgressMilestoneIds.includes(m.id))
                    .map((m) => (
                      <div key={m.id} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                        <div className="text-[10px] text-slate-500 font-mono">Step {m.stepOrder} • {m.stage}</div>
                        <div className="text-xs font-bold text-white">{m.title}</div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-400">~{m.estimatedHours}h</span>
                          <button
                            onClick={() => onToggleInProgress(m.id)}
                            className="px-2 py-1 rounded bg-amber-500/15 text-amber-400 text-[10px] font-bold hover:bg-amber-500/25"
                          >
                            Start &rarr;
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Column 2: In Progress */}
              <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>In Progress</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-mono">
                    {careerMilestones.filter((m) => inProgressMilestoneIds.includes(m.id) && !completedMilestoneIds.includes(m.id)).length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {careerMilestones
                    .filter((m) => inProgressMilestoneIds.includes(m.id) && !completedMilestoneIds.includes(m.id))
                    .map((m) => (
                      <div key={m.id} className="p-3.5 rounded-xl bg-amber-950/15 border border-amber-500/40 space-y-2">
                        <div className="text-[10px] text-amber-400 font-mono">Active Lab • Step {m.stepOrder}</div>
                        <div className="text-xs font-bold text-white">{m.title}</div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-slate-400">~{m.estimatedHours}h</span>
                          <button
                            onClick={() => handleMarkCompleteWithConfetti(m.id)}
                            className="px-2.5 py-1 rounded bg-emerald-500 text-slate-950 text-[10px] font-bold hover:bg-emerald-400"
                          >
                            Mark Done ✓
                          </button>
                        </div>
                      </div>
                    ))}
                  {careerMilestones.filter((m) => inProgressMilestoneIds.includes(m.id) && !completedMilestoneIds.includes(m.id)).length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-500">
                      No active milestones right now. Pick one from 'To Explore' or start Deep Work!
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3: Mastered */}
              <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Mastered</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                    {careerMilestones.filter((m) => completedMilestoneIds.includes(m.id)).length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {careerMilestones
                    .filter((m) => completedMilestoneIds.includes(m.id))
                    .map((m) => (
                      <div key={m.id} className="p-3.5 rounded-xl bg-emerald-950/15 border border-emerald-500/30 space-y-2">
                        <div className="text-[10px] text-emerald-400 font-mono">Verified • Step {m.stepOrder}</div>
                        <div className="text-xs font-bold text-white">{m.title}</div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-emerald-400/80 font-mono">100% Mastered</span>
                          <button
                            onClick={() => onToggleComplete(m.id)}
                            className="text-[10px] text-slate-400 hover:text-slate-200"
                          >
                            Undo
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};
