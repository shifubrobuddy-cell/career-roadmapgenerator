import React from 'react';
import { 
  Sparkles, 
  Compass, 
  Bookmark, 
  Clock, 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  PlayCircle, 
  Target, 
  TrendingUp,
  Award,
  Layers,
  ExternalLink
} from 'lucide-react';
import { CareerTrack, Milestone, StudentProfile } from '../types';

interface DashboardTabProps {
  activeCareer: CareerTrack;
  milestones: Milestone[];
  completedMilestoneIds: number[];
  inProgressMilestoneIds: number[];
  currentStudent: StudentProfile;
  onNavigateTab: (tab: string) => void;
  onToggleCompleteMilestone: (id: number) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  activeCareer,
  milestones,
  completedMilestoneIds,
  inProgressMilestoneIds,
  currentStudent,
  onNavigateTab,
  onToggleCompleteMilestone,
}) => {
  const careerMilestones = milestones.filter(m => m.careerId === activeCareer.id);
  const totalCount = careerMilestones.length || 1;
  const completedInCareer = careerMilestones.filter(m => completedMilestoneIds.includes(m.id)).length;
  const inProgressInCareer = careerMilestones.filter(m => inProgressMilestoneIds.includes(m.id)).length;
  const remainingInCareer = Math.max(0, totalCount - completedInCareer - inProgressInCareer);
  
  const progressPercent = Math.round((completedInCareer / totalCount) * 100);

  // Next milestone to tackle
  const nextMilestone = careerMilestones.find(
    m => !completedMilestoneIds.includes(m.id)
  ) || careerMilestones[0];

  // SVG Circular chart parameters
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="space-y-6 pb-16">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1626] via-[#0f1d2c] to-[#0d1626] border border-slate-800/90 p-6 md:p-8 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-20 w-60 h-60 rounded-full bg-teal-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SKILL PROGRESS & ANALYTICS HUB</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-300">Welcome back, {currentStudent.username}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Personalized Engineering Dashboard
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
              Track your skill masteries, analyze roadmap velocity across high-demand tech tracks, and continue your tailored milestone progression.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('diagnostic')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 transition duration-200"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>+ Diagnostic Assessment</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Tracked Paths */}
        <div className="rounded-xl bg-[#0f1422]/90 border border-slate-800 p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              TRACKED PATHS
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-white">1</span>
            <span className="text-xs text-slate-400 font-medium">/ 5 Career Tracks</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Active learning curricula</span>
          </div>
        </div>

        {/* Metric 2: Skills Mastered */}
        <div className="rounded-xl bg-[#0f1422]/90 border border-slate-800 p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              SKILLS MASTERED
            </span>
            <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-teal-400">{completedInCareer}</span>
            <span className="text-xs text-slate-400 font-medium">of {totalCount} Total</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-teal-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Verified skill credits</span>
          </div>
        </div>

        {/* Metric 3: In Progress */}
        <div className="rounded-xl bg-[#0f1422]/90 border border-slate-800 p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              IN PROGRESS
            </span>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-amber-400">{inProgressInCareer}</span>
            <span className="text-xs text-slate-400 font-medium">Active Topics</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>Currently studying</span>
          </div>
        </div>

        {/* Metric 4: Study Streak */}
        <div className="rounded-xl bg-[#0f1422]/90 border border-slate-800 p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              STUDY STREAK
            </span>
            <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-orange-400">{currentStudent.studyStreakDays}</span>
            <span className="text-xs text-slate-300 font-medium">Days Active 🔥</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>Consistent daily momentum</span>
          </div>
        </div>

      </div>

      {/* Split Main Area: Left (Primary Track & Next Milestone) + Right (Mastery Distribution Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Primary Career Track Progress & Recommended Next Step */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800 p-6 md:p-7 shadow-xl space-y-6">
            
            {/* Top header of left card */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold tracking-wider uppercase text-emerald-400">
                  PRIMARY CAREER TRACK
                </span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
                Fundamentals Tier
              </span>
            </div>

            {/* Career Title & Description */}
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {activeCareer.name}
              </h2>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                {activeCareer.description}
              </p>
            </div>

            {/* Track Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Track Progress</span>
                <span className="font-mono font-extrabold text-emerald-400 text-sm">{progressPercent}%</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-sm transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                <span>{completedInCareer} Mastered</span>
                <span>{inProgressInCareer} In Progress</span>
                <span>{remainingInCareer} Remaining</span>
              </div>
            </div>

            {/* Next Recommended Milestone Sub-card */}
            {nextMilestone && (
              <div className="rounded-xl bg-[#0b0f1a] border border-emerald-500/30 p-5 space-y-3.5 relative overflow-hidden shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="uppercase tracking-wider">NEXT RECOMMENDED MILESTONE</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-mono font-bold">
                    ~{nextMilestone.estimatedHours}h estimated
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    Step {nextMilestone.stepOrder}: {nextMilestone.title}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    {nextMilestone.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => onNavigateTab('roadmap')}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <PlayCircle className="w-4 h-4" />
                    <span>Open Study Lab & Roadmap</span>
                  </button>

                  <button
                    onClick={() => onToggleCompleteMilestone(nextMilestone.id)}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Mark Mastered</span>
                  </button>

                  {nextMilestone.resourceLink && (
                    <a
                      href={nextMilestone.resourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 border border-slate-800 transition"
                    >
                      <span>Doc Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Mastery Distribution Donut Chart */}
        <div className="lg:col-span-5">
          <div className="h-full rounded-2xl bg-[#0f1422]/90 border border-slate-800 p-6 md:p-7 shadow-xl flex flex-col justify-between space-y-6">
            
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Mastery Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Curriculum breakdown for {activeCareer.name}
              </p>
            </div>

            {/* Circular Donut Graphic */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-52 h-52 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Background Track */}
                  <circle
                    cx="104"
                    cy="104"
                    r={radius}
                    stroke="#1e293b"
                    strokeWidth="16"
                    fill="transparent"
                  />
                  {/* Progress Glow Arc */}
                  <circle
                    cx="104"
                    cy="104"
                    r={radius}
                    stroke="#10b981"
                    strokeWidth="16"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                    style={{
                      filter: 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.4))',
                    }}
                  />
                </svg>

                {/* Donut Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
                    {progressPercent}%
                  </span>
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 mt-0.5">
                    MASTERED
                  </span>
                </div>
              </div>

              {/* Legend Metrics */}
              <div className="w-full max-w-xs mt-6 grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-lg font-extrabold text-emerald-400">{completedInCareer}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Done</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-lg font-extrabold text-amber-400">{inProgressInCareer}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Active</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="text-lg font-extrabold text-slate-400">{remainingInCareer}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Left</div>
                </div>
              </div>
            </div>

            {/* Academic Evaluation Clearance Badge */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>BCA Laboratory Viva Clearance</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono font-bold text-[11px]">
                {currentStudent.verifiedByFaculty ? 'VERIFIED' : 'PENDING'}
              </span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
