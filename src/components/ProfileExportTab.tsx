import React, { useState } from 'react';
import { 
  User, 
  Award, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  Flame, 
  RotateCcw, 
  ShieldCheck, 
  FileText,
  Calendar,
  Layers
} from 'lucide-react';
import { CareerTrack, Milestone, StudentProfile } from '../types';

interface ProfileExportTabProps {
  currentStudent: StudentProfile;
  activeCareer: CareerTrack;
  milestones: Milestone[];
  completedMilestoneIds: number[];
  onResetProgress: () => void;
}

export const ProfileExportTab: React.FC<ProfileExportTabProps> = ({
  currentStudent,
  activeCareer,
  milestones,
  completedMilestoneIds,
  onResetProgress,
}) => {
  const [copied, setCopied] = useState(false);

  const careerMilestones = milestones.filter((m) => m.careerId === activeCareer.id);
  const completedList = careerMilestones.filter((m) => completedMilestoneIds.includes(m.id));
  const completionPercent = Math.round((completedList.length / (careerMilestones.length || 1)) * 100);

  const handleExportJSON = () => {
    const payload = {
      student: currentStudent,
      activeCareer: activeCareer.name,
      completionPercent,
      completedMilestones: completedList.map((m) => ({
        step: m.stepOrder,
        title: m.title,
        stage: m.stage,
        estimatedHours: m.estimatedHours,
      })),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PathForge_${currentStudent.username}_${activeCareer.slug}_roadmap.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = () => {
    const lines = [
      `# PathForge Learning Portfolio: ${currentStudent.fullName}`,
      `**Target Goal:** ${currentStudent.targetGoal}`,
      `**Career Track:** ${activeCareer.name} (${completionPercent}% Mastered)`,
      `**Study Streak:** ${currentStudent.studyStreakDays} Days Active`,
      '',
      '## Milestones Progression:',
      ...careerMilestones.map((m) => {
        const isDone = completedMilestoneIds.includes(m.id);
        return `- [${isDone ? 'x' : ' '}] Step ${m.stepOrder}: ${m.title} (${m.stage}, ~${m.estimatedHours}h)`;
      }),
      '',
      `*Generated via PathForge Career Engine on ${new Date().toLocaleDateString()}*`,
    ].join('\n');

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      
      {/* Student Profile Card */}
      <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800 p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-[2px] shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-[#0d121f] rounded-[14px] flex items-center justify-center text-2xl font-extrabold text-white uppercase">
              {currentStudent.username.charAt(0)}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-extrabold text-white">
                {currentStudent.fullName}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] font-bold uppercase">
                {currentStudent.role}
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-0.5">
              {currentStudent.email} • {currentStudent.targetGoal}
            </p>

            <div className="flex items-center gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1 text-orange-400 font-bold font-mono">
                <Flame className="w-3.5 h-3.5" />
                <span>{currentStudent.studyStreakDays} Days Streak</span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-mono">Last active: {currentStudent.lastLogin}</span>
            </div>
          </div>
        </div>

        {/* Quick Progress Badge */}
        <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800 self-stretch md:self-auto justify-around">
          <div className="text-center px-3">
            <div className="text-xl font-extrabold text-emerald-400 font-mono">{completionPercent}%</div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Track Done</div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-center px-3">
            <div className="text-xl font-extrabold text-teal-400 font-mono">{completedList.length}/{careerMilestones.length}</div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Credits</div>
          </div>
        </div>

      </div>

      {/* Verified Skills & Badges */}
      <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800 p-6 md:p-7 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Verified Skill Certifications</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {completedList.length} Badges Earned
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {completedList.map((m) => (
            <div
              key={m.id}
              className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white">{m.title}</div>
                <div className="text-[10px] text-emerald-400 font-mono">Step {m.stepOrder} Verified Credit</div>
              </div>
            </div>
          ))}

          {completedList.length === 0 && (
            <div className="col-span-full text-center py-6 text-xs text-slate-500">
              No milestones marked completed yet. Jump into the Interactive Roadmap to earn your first certification badge!
            </div>
          )}
        </div>
      </div>

      {/* Export Actions Panel */}
      <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800 p-6 md:p-7 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-400" />
          <span>Curriculum Export & Examination Reporting</span>
        </h3>
        <p className="text-xs text-slate-400">
          Generate compliant portfolio documents for academic viva examination, lab assessments, or personal portfolios.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          
          <button
            onClick={handleExportJSON}
            className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left space-y-2 transition group"
          >
            <Download className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-white">Download JSON Syllabus</div>
            <div className="text-[11px] text-slate-400">Raw machine-readable progress state & timestamps</div>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left space-y-2 transition group"
          >
            {copied ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <Copy className="w-5 h-5 text-teal-400 group-hover:scale-110 transition" />
            )}
            <div className="text-xs font-bold text-white">
              {copied ? 'Copied to Clipboard!' : 'Copy Markdown Checklist'}
            </div>
            <div className="text-[11px] text-slate-400">Formatted task list for GitHub README or Notion</div>
          </button>

          <button
            onClick={handlePrint}
            className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-left space-y-2 transition group"
          >
            <Printer className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition" />
            <div className="text-xs font-bold text-white">Print / Save as PDF</div>
            <div className="text-[11px] text-slate-400">Official formatted hardcopy for laboratory defense</div>
          </button>

        </div>
      </div>

      {/* Danger Zone: Reset Progress */}
      <div className="rounded-2xl bg-red-950/10 border border-red-500/20 p-5 flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold text-red-400">Reset Local Learning Progress</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Reset all completed milestone credits and restore baseline state for {currentStudent.username}.
          </div>
        </div>

        <button
          onClick={onResetProgress}
          className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-xs flex items-center gap-1.5 transition shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Progress</span>
        </button>
      </div>

    </div>
  );
};
