import React, { useState } from 'react';
import { 
  Compass, 
  LayoutDashboard, 
  Sparkles, 
  Map, 
  BookOpen, 
  UserCheck, 
  ShieldCheck, 
  ChevronDown, 
  Flame, 
  SunMedium, 
  Moon,
  Lock,
  LogOut,
  HelpCircle,
  UserPlus
} from 'lucide-react';
import { CareerTrack, StudentProfile } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  careers: CareerTrack[];
  activeCareer: CareerTrack;
  setActiveCareerId: (id: number) => void;
  trackProgressPercent: number;
  currentStudent: StudentProfile;
  students: StudentProfile[];
  onSwitchStudent: (student: StudentProfile) => void;
  isAdminAuthenticated: boolean;
  onOpenAdminLogin: () => void;
  onAdminLogout: () => void;
  onOpenTutorial: () => void;
  onOpenUserModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  careers,
  activeCareer,
  setActiveCareerId,
  trackProgressPercent,
  currentStudent,
  students,
  onSwitchStudent,
  isAdminAuthenticated,
  onOpenAdminLogin,
  onAdminLogout,
  onOpenTutorial,
  onOpenUserModal,
}) => {
  const [careerMenuOpen, setCareerMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080A11]/90 backdrop-blur-md px-4 lg:px-7 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Career Selector */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1.5px] shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition">
              <div className="w-full h-full bg-[#0d121f] rounded-[10px] flex items-center justify-center text-emerald-400">
                <Compass className="w-5 h-5 group-hover:rotate-45 transition duration-300" />
              </div>
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                PathForge<span className="text-emerald-400">.io</span>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-500/80 -mt-0.5">
                Career Engine
              </div>
            </div>
          </div>

          {/* Active Career Dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setCareerMenuOpen(!careerMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 text-xs font-semibold text-slate-200 hover:text-white transition"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{activeCareer.name}</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold">
                {trackProgressPercent}%
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {careerMenuOpen && (
              <div 
                className="absolute left-0 mt-2 w-72 rounded-xl bg-[#0e1322] border border-slate-700/80 shadow-2xl p-2 z-50"
                onClick={() => setCareerMenuOpen(false)}
              >
                <div className="text-[10px] font-bold text-slate-400 px-2.5 py-1 uppercase tracking-wider">
                  Select Learning Track
                </div>
                {careers.map((career) => (
                  <button
                    key={career.id}
                    onClick={() => {
                      setActiveCareerId(career.id);
                      setCareerMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                      career.id === activeCareer.id
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{career.name}</div>
                      <div className="text-[10px] text-slate-400">{career.totalDurationWeeks} wks • {career.difficultyLevel}</div>
                    </div>
                    {career.id === activeCareer.id && (
                      <span className="text-[10px] font-mono text-emerald-400 font-bold">ACTIVE</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center Nav Tabs (PHP/MySQL removed, Admin only shown if authenticated) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'diagnostic'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Skill Diagnostic</span>
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'roadmap'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>Interactive Roadmap</span>
          </button>

          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'resources'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Resource Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'profile'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Profile & Export</span>
          </button>

          {/* ADMIN PORTAL TAB: ONLY VISIBLE WHEN ADMIN LOGGED IN */}
          {isAdminAuthenticated && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'admin'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Admin Portal</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-bold">
                AUTH
              </span>
            </button>
          )}
        </nav>

        {/* Right Tools & Account Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          
          {/* Quick Onboarding Tutorial Trigger */}
          <button
            onClick={onOpenTutorial}
            title="Start Interactive Tutorial"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          {/* New Account / Fresh Start Button */}
          <button
            onClick={onOpenUserModal}
            title="Create Fresh Student Profile (0%)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Profile</span>
          </button>

          {/* Streak pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-inner">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>{currentStudent.studyStreakDays}d</span>
          </div>

          {/* Admin Sign In Lock Trigger (or Admin Status) */}
          {isAdminAuthenticated ? (
            <button
              onClick={onAdminLogout}
              title="Admin Signed In (Click to Sign Out)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin (Exit)</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              title="Faculty / Admin Login (admin / Admin@123)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-slate-700 text-xs font-semibold transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Faculty</span>
            </button>
          )}

          {/* User profile dropdown button */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-sm">
                {currentStudent.username.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-slate-200 hidden sm:inline max-w-[80px] truncate">
                {currentStudent.username}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0e1322] border border-slate-700/80 shadow-2xl p-2.5 z-50 text-xs"
                onClick={() => setUserMenuOpen(false)}
              >
                <div className="px-2 py-1.5 border-b border-slate-800 pb-2 mb-2">
                  <div className="font-bold text-white text-sm">{currentStudent.fullName}</div>
                  <div className="text-[11px] text-emerald-400 font-mono">{currentStudent.email}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{currentStudent.targetGoal}</div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onOpenUserModal();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 font-bold flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Fresh Account (0%)</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenTutorial();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
                    <span>View Onboarding Tutorial</span>
                  </button>
                </div>

                <div className="border-t border-slate-800/80 mt-2 pt-2">
                  {isAdminAuthenticated ? (
                    <button
                      onClick={() => {
                        onAdminLogout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 font-medium flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out from Admin</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onOpenAdminLogin();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 font-medium flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Admin Sign In (admin / Admin@123)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mobile Nav Overflow */}
      <div className="lg:hidden flex items-center justify-around gap-1 pt-2.5 mt-2 border-t border-slate-800/80 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2.5 py-1 text-xs font-semibold rounded whitespace-nowrap ${
            activeTab === 'dashboard' ? 'text-emerald-400 bg-emerald-500/15' : 'text-slate-400'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('diagnostic')}
          className={`px-2.5 py-1 text-xs font-semibold rounded whitespace-nowrap ${
            activeTab === 'diagnostic' ? 'text-emerald-400 bg-emerald-500/15' : 'text-slate-400'
          }`}
        >
          Diagnostic
        </button>
        <button
          onClick={() => setActiveTab('roadmap')}
          className={`px-2.5 py-1 text-xs font-semibold rounded whitespace-nowrap ${
            activeTab === 'roadmap' ? 'text-emerald-400 bg-emerald-500/15' : 'text-slate-400'
          }`}
        >
          Roadmap
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-2.5 py-1 text-xs font-semibold rounded whitespace-nowrap ${
            activeTab === 'resources' ? 'text-emerald-400 bg-emerald-500/15' : 'text-slate-400'
          }`}
        >
          Resources
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-2.5 py-1 text-xs font-semibold rounded whitespace-nowrap ${
            activeTab === 'profile' ? 'text-emerald-400 bg-emerald-500/15' : 'text-slate-400'
          }`}
        >
          Profile
        </button>
        {isAdminAuthenticated && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-2.5 py-1 text-xs font-semibold rounded whitespace-nowrap ${
              activeTab === 'admin' ? 'text-emerald-400 bg-emerald-500/15' : 'text-slate-400'
            }`}
          >
            Admin Portal
          </button>
        )}
      </div>
    </header>
  );
};
