import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Award,
  Zap,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CareerTrack, QuizQuestion } from '../types';

interface DiagnosticTabProps {
  activeCareer: CareerTrack;
  quizzes: QuizQuestion[];
  onApplyDiagnosticPlacement: (milestoneIdsToComplete: number[]) => void;
  onNavigateRoadmap: () => void;
}

export const DiagnosticTab: React.FC<DiagnosticTabProps> = ({
  activeCareer,
  quizzes,
  onApplyDiagnosticPlacement,
  onNavigateRoadmap,
}) => {
  const careerQuizzes = quizzes.filter((q) => q.careerId === activeCareer.id);
  const effectiveQuizzes = careerQuizzes.length > 0 ? careerQuizzes : quizzes;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const activeQuestion = effectiveQuizzes[currentQuestionIndex];

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex,
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < effectiveQuizzes.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsSubmitted(true);
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch (e) {
        // ignore
      }
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setIsSubmitted(false);
  };

  // Score Calculation
  let correctCount = 0;
  effectiveQuizzes.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correctIndex) {
      correctCount++;
    }
  });

  const totalQuestions = effectiveQuizzes.length || 1;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);

  const handleApplyPlacement = () => {
    // Collect associated milestone IDs from correctly answered questions
    const passedMilestoneIds = effectiveQuizzes
      .filter((q, idx) => selectedAnswers[idx] === q.correctIndex)
      .map((q) => q.associatedSkillId)
      .filter(Boolean);

    if (passedMilestoneIds.length > 0) {
      onApplyDiagnosticPlacement(passedMilestoneIds);
    }
    onNavigateRoadmap();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      
      {/* Header */}
      <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800 p-6 md:p-8 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5" />
          <span>ADAPTIVE DIAGNOSTIC ASSESSMENT</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">{activeCareer.name}</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Calibrate Your Engineering Starting Point
        </h2>

        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
          Take this diagnostic assessment to identify your current knowledge baseline, bypass already mastered prerequisites, and generate a customized high-velocity roadmap.
        </p>

        {/* Progress bar inside test */}
        {!isSubmitted && (
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-1.5">
              <span>Question {currentQuestionIndex + 1} of {effectiveQuizzes.length}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / effectiveQuizzes.length) * 100)}% Answered</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / effectiveQuizzes.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Assessment Container */}
      {!isSubmitted && activeQuestion ? (
        <div className="rounded-2xl bg-[#0f1422]/95 border border-slate-800 p-6 md:p-8 shadow-xl space-y-6">
          
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono font-bold">
              Topic: {activeQuestion.topic}
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              Associated: {activeQuestion.skillName}
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed">
            {activeQuestion.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {activeQuestion.options.map((option, oidx) => {
              const isSelected = selectedAnswers[currentQuestionIndex] === oidx;
              return (
                <button
                  key={oidx}
                  onClick={() => handleSelectOption(oidx)}
                  className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-200 shadow-md shadow-emerald-950/20'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg text-xs font-bold font-mono flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + oidx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              &larr; Previous Question
            </button>

            <button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestionIndex] === undefined}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <span>{currentQuestionIndex === effectiveQuizzes.length - 1 ? 'Finish & Evaluate' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : (
        /* Results View */
        <div className="rounded-2xl bg-[#0f1422]/95 border border-slate-800 p-6 md:p-8 shadow-2xl space-y-6">
          
          <div className="text-center py-6 space-y-3">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-2">
              <Award className="w-10 h-10" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Assessment Completed!
            </h3>
            <p className="text-slate-400 text-sm max-w-lg mx-auto">
              You scored <span className="text-emerald-400 font-extrabold font-mono text-base">{scorePercent}%</span> ({correctCount} of {effectiveQuizzes.length} correct) in {activeCareer.name}.
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs font-mono">
              Placement Tier: {scorePercent >= 75 ? '⚡ Advanced' : scorePercent >= 40 ? '🚀 Intermediate' : '🌱 Fundamentals Ready'}
            </div>
          </div>

          {/* Action Recommendation */}
          <div className="p-5 rounded-xl bg-[#090d16] border border-emerald-500/30 space-y-3 text-xs">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>Tailored Action Recommendation:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Based on your responses, we verified mastery in early markup and layout topics. We recommend starting at <strong className="text-emerald-400">Step 3: JavaScript Core & DOM Manipulation</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleApplyPlacement}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-2 transition"
              >
                <span>Apply Placement & Jump into Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleRestart}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Assessment</span>
              </button>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="font-bold text-sm text-slate-300 uppercase tracking-wider text-xs">
              Detailed Questions & Explanations:
            </h4>
            <div className="space-y-3">
              {effectiveQuizzes.map((q, idx) => {
                const userAns = selectedAnswers[idx];
                const isCorrect = userAns === q.correctIndex;
                return (
                  <div
                    key={q.id}
                    className={`p-4 rounded-xl border text-xs space-y-2 ${
                      isCorrect ? 'bg-emerald-950/15 border-emerald-500/30' : 'bg-red-950/15 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Q{idx + 1}: {q.question}</span>
                      {isCorrect ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </span>
                      ) : (
                        <span className="text-red-400 font-bold flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Incorrect
                        </span>
                      )}
                    </div>
                    <div className="text-slate-400">
                      <strong>Correct Answer:</strong> {q.options[q.correctIndex]}
                    </div>
                    <div className="text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                      <span className="text-emerald-400 font-semibold">Technical Rationale:</span> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
