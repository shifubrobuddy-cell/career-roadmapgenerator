import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  UserPlus, 
  Compass,
  RotateCcw
} from 'lucide-react';
import { StudentProfile, CareerTrack } from '../types';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  careers: CareerTrack[];
  onRegisterNewStudent: (name: string, email: string, careerId: number) => void;
  students: StudentProfile[];
  onSwitchStudent: (student: StudentProfile) => void;
  currentStudentId: number;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  careers,
  onRegisterNewStudent,
  students,
  onSwitchStudent,
  currentStudentId,
}) => {
  const [mode, setMode] = useState<'signup' | 'switch'>('signup');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCareerId, setSelectedCareerId] = useState<number>(1);

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    onRegisterNewStudent(
      fullName.trim(),
      email.trim() || `${fullName.trim().toLowerCase().replace(/\s+/g, '')}@student.edu`,
      selectedCareerId
    );

    setFullName('');
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-[#0e1322] p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-48 w-72 -translate-x-1/2 rounded-full bg-emerald-500/15 blur-3xl" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Student Account Management</h3>
              <p className="text-[11px] text-slate-400">Fresh student profiles or switch demo personas</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mode === 'signup'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            + New Student (Fresh Start 0%)
          </button>
          <button
            onClick={() => setMode('switch')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              mode === 'switch'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Switch Existing Student
          </button>
        </div>

        {/* Mode 1: Sign up fresh student */}
        {mode === 'signup' ? (
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Fresh Slate Guarantee</span>
              </div>
              <p className="text-[11px] text-slate-400">
                You will start with 0% progress, 0 completed milestones, and a guided 4-step tutorial to help you navigate your journey.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">Your Full Name:</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Sara Connor"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">College / Personal Email (Optional):</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  placeholder="sara@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-slate-300 font-bold">Select Your Primary Career Discipline:</label>
              <select
                value={selectedCareerId}
                onChange={(e) => setSelectedCareerId(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
              >
                {careers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.totalDurationWeeks} wks • {c.difficultyLevel})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white transition font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
              >
                <span>Create Account & Start Fresh</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          /* Mode 2: Switch between existing student profiles */
          <div className="space-y-3 text-xs">
            <p className="text-slate-400 text-[11px]">
              Select an existing student profile to inspect their active roadmaps and verified credits:
            </p>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {students.map((student) => {
                const career = careers.find((c) => c.id === student.activeCareerId) || careers[0];
                const isSelected = student.id === currentStudentId;

                return (
                  <button
                    key={student.id}
                    onClick={() => {
                      onSwitchStudent(student);
                      onClose();
                    }}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 font-bold font-mono flex items-center justify-center uppercase">
                        {student.username.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-white">{student.fullName}</div>
                        <div className="text-[11px] text-slate-400">
                          {career.name} • {student.completedMilestoneIds.length} Mastered
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-[10px]">
                        ACTIVE
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
