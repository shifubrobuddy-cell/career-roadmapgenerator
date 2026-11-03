import React, { useState } from 'react';
import { 
  Sparkles, 
  Compass, 
  Map, 
  Target, 
  Clock, 
  CheckCircle2, 
  Award, 
  ArrowRight, 
  ArrowLeft, 
  X 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
}

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({
  isOpen,
  onClose,
  username,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      badge: 'Step 1 of 4: Welcome & Tracks',
      title: `Welcome to PathForge, ${username}!`,
      subtitle: 'Your modern engineering career roadmap engine.',
      icon: <Compass className="w-8 h-8 text-emerald-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            PathForge transforms overwhelming industry requirements into a structured, step-by-step curriculum tailored to your career aspiration.
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Choose From 5 High-Demand Tech Curricula</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Web Development, Data Analytics, UI/UX Design, Android App Development, or Digital Marketing. Switch tracks anytime from the top bar!
            </p>
          </div>
        </div>
      ),
    },
    {
      badge: 'Step 2 of 4: Diagnostic Calibration',
      title: 'Benchmark Before You Start',
      subtitle: 'Never waste time learning things you already know.',
      icon: <Target className="w-8 h-8 text-teal-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Take the quick <strong>Adaptive Skill Diagnostic</strong> to test your foundational skills.
          </p>
          <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-500/30 space-y-1.5">
            <div className="font-bold text-teal-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Placement Algorithm</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Scoring high on the diagnostic will automatically verify your early prerequisites and unlock intermediate stages directly!
            </p>
          </div>
        </div>
      ),
    },
    {
      badge: 'Step 3 of 4: Interactive Roadmap & Lab',
      title: 'Hands-on Learning & Focus Timer',
      subtitle: 'Checklist verifications and Pomodoro sprints.',
      icon: <Clock className="w-8 h-8 text-indigo-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Every milestone comes with estimated laboratory hours, key industry topics, official MDN/React docs, and interactive verification checklists.
          </p>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Built-in Pomodoro Study Lab</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Use the 25-minute deep work timer right alongside your checklist to maintain steady daily momentum and build your streak!
            </p>
          </div>
        </div>
      ),
    },
    {
      badge: 'Step 4 of 4: Analytics & Certifications',
      title: 'Track Your Velocity & Export',
      subtitle: 'Verify your degree credits and download reports.',
      icon: <Award className="w-8 h-8 text-amber-400" />,
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Watch your mastery percentage climb on the glowing distribution donut chart as you conquer milestones.
          </p>
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Examination-Ready Portfolio</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Download your complete syllabus in JSON, copy a GitHub-ready markdown checklist, or print a formatted PDF verification report anytime.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch (e) {
        // ignore
      }
      onClose();
    }
  };

  const active = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-[#0e1322] p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-48 w-72 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold">
            {active.badge}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
            title="Skip Tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Center Content */}
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 shrink-0">
              {active.icon}
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                {active.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                {active.subtitle}
              </p>
            </div>
          </div>

          <div className="pt-2">
            {active.content}
          </div>
        </div>

        {/* Step Indicator Dots & Navigation */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-emerald-400' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition active:scale-95"
            >
              <span>{currentStep === steps.length - 1 ? 'Start Learning!' : 'Next'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
