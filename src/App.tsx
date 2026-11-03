import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { RoadmapTab } from './components/RoadmapTab';
import { DiagnosticTab } from './components/DiagnosticTab';
import { ResourceHubTab } from './components/ResourceHubTab';
import { ProfileExportTab } from './components/ProfileExportTab';
import { AdminPortal } from './components/AdminPortal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { OnboardingTutorial } from './components/OnboardingTutorial';
import { UserAuthModal } from './components/UserAuthModal';
import { 
  INITIAL_CAREERS, 
  INITIAL_MILESTONES, 
  INITIAL_QUIZZES, 
  INITIAL_RESOURCES, 
  INITIAL_STUDENTS, 
  VIVA_QUESTIONS 
} from './data/mockData';
import { CareerTrack, Milestone, LearningResource, StudentProfile } from './types';

export const App: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Admin Authentication State (admin / Admin@123)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pathforge_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);

  // Onboarding Tutorial State
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  // User Profile / Sign Up Modal State
  const [showUserModal, setShowUserModal] = useState<boolean>(false);

  // Careers State (with localStorage persistence)
  const [careers, setCareers] = useState<CareerTrack[]>(() => {
    try {
      const saved = localStorage.getItem('pathforge_careers');
      return saved ? JSON.parse(saved) : INITIAL_CAREERS;
    } catch {
      return INITIAL_CAREERS;
    }
  });

  // Active Career Selection
  const [activeCareerId, setActiveCareerId] = useState<number>(1);

  // Milestones State
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    try {
      const saved = localStorage.getItem('pathforge_milestones_v5');
      return saved ? JSON.parse(saved) : INITIAL_MILESTONES;
    } catch {
      return INITIAL_MILESTONES;
    }
  });

  // Resources State
  const [resources, setResources] = useState<LearningResource[]>(() => {
    try {
      const saved = localStorage.getItem('pathforge_resources_v5');
      return saved ? JSON.parse(saved) : INITIAL_RESOURCES;
    } catch {
      return INITIAL_RESOURCES;
    }
  });

  // Students Roster State
  const [students, setStudents] = useState<StudentProfile[]>(() => {
    try {
      const saved = localStorage.getItem('pathforge_students');
      return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  // Current Active Student (defaults to 'tameem')
  const [currentStudentId, setCurrentStudentId] = useState<number>(() => {
    try {
      const savedId = localStorage.getItem('pathforge_active_student_id');
      return savedId ? Number(savedId) : 101;
    } catch {
      return 101;
    }
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('pathforge_careers', JSON.stringify(careers));
  }, [careers]);

  useEffect(() => {
    localStorage.setItem('pathforge_milestones_v5', JSON.stringify(milestones));
  }, [milestones]);

  useEffect(() => {
    localStorage.setItem('pathforge_resources_v5', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('pathforge_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('pathforge_active_student_id', String(currentStudentId));
  }, [currentStudentId]);

  useEffect(() => {
    localStorage.setItem('pathforge_admin_auth', String(isAdminAuthenticated));
  }, [isAdminAuthenticated]);

  // Derived Active Data
  const currentStudent = students.find((s) => s.id === currentStudentId) || students[0];
  const activeCareer = careers.find((c) => c.id === activeCareerId) || careers[0];

  const activeMilestones = milestones.filter((m) => m.careerId === activeCareer.id);
  const totalCount = activeMilestones.length || 1;
  const completedCount = activeMilestones.filter((m) => currentStudent.completedMilestoneIds.includes(m.id)).length;
  const trackProgressPercent = Math.round((completedCount / totalCount) * 100);

  // Admin Portal Tab Guard: If not admin, block and show login
  const handleNavigateTab = (tab: string) => {
    if (tab === 'admin' && !isAdminAuthenticated) {
      setShowAdminLoginModal(true);
      return;
    }
    setActiveTab(tab);
  };

  // Milestone Complete Toggle
  const handleToggleCompleteMilestone = (milestoneId: number) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== currentStudent.id) return student;

        const isAlreadyComplete = student.completedMilestoneIds.includes(milestoneId);
        const updatedCompleted = isAlreadyComplete
          ? student.completedMilestoneIds.filter((id) => id !== milestoneId)
          : [...student.completedMilestoneIds, milestoneId];

        const updatedInProgress = student.inProgressMilestoneIds.filter((id) => id !== milestoneId);

        return {
          ...student,
          completedMilestoneIds: updatedCompleted,
          inProgressMilestoneIds: updatedInProgress,
        };
      })
    );
  };

  // Milestone In Progress Toggle
  const handleToggleInProgressMilestone = (milestoneId: number) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== currentStudent.id) return student;

        const isAlreadyInProgress = student.inProgressMilestoneIds.includes(milestoneId);
        const updatedInProgress = isAlreadyInProgress
          ? student.inProgressMilestoneIds.filter((id) => id !== milestoneId)
          : [...student.inProgressMilestoneIds, milestoneId];

        const updatedCompleted = student.completedMilestoneIds.filter((id) => id !== milestoneId);

        return {
          ...student,
          completedMilestoneIds: updatedCompleted,
          inProgressMilestoneIds: updatedInProgress,
        };
      })
    );
  };

  // Register Fresh Student (Starts at 0% Progress!)
  const handleRegisterNewStudent = (name: string, email: string, careerId: number) => {
    const nextId = Math.max(...students.map((s) => s.id), 100) + 1;
    const cleanUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '_');

    const freshStudent: StudentProfile = {
      id: nextId,
      username: cleanUsername,
      fullName: name,
      email: email,
      role: 'student',
      targetGoal: `Master ${careers.find((c) => c.id === careerId)?.name || 'Engineering'} Curricula`,
      studyStreakDays: 1,
      activeCareerId: careerId,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      lastLogin: 'Just now (New Session)',
      completedMilestoneIds: [], // FRESH START: 0 completed!
      inProgressMilestoneIds: [], // FRESH START: 0 in progress!
      facultyNotes: 'Newly enrolled candidate. Ready for diagnostic assessment.',
      verifiedByFaculty: false,
    };

    const updatedStudents = [freshStudent, ...students];
    setStudents(updatedStudents);
    setCurrentStudentId(nextId);
    setActiveCareerId(careerId);
    setActiveTab('dashboard');

    // Trigger onboarding tutorial automatically for the new user!
    setShowTutorial(true);
  };

  // Diagnostic Placement
  const handleApplyDiagnosticPlacement = (milestoneIds: number[]) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== currentStudent.id) return student;
        const set = new Set([...student.completedMilestoneIds, ...milestoneIds]);
        return {
          ...student,
          completedMilestoneIds: Array.from(set),
        };
      })
    );
  };

  // Bookmark Toggle
  const handleToggleBookmark = (resourceId: number) => {
    setResources((prev) =>
      prev.map((r) => (r.id === resourceId ? { ...r, isBookmarked: !r.isBookmarked } : r))
    );
  };

  // Reset Student Progress
  const handleResetProgress = () => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== currentStudent.id) return student;
        return {
          ...student,
          completedMilestoneIds: [],
          inProgressMilestoneIds: [],
        };
      })
    );
  };

  // Admin Actions: Careers
  const handleAddCareer = (newCareer: Omit<CareerTrack, 'id'>) => {
    const nextId = Math.max(...careers.map((c) => c.id), 0) + 1;
    setCareers([...careers, { ...newCareer, id: nextId }]);
  };

  const handleUpdateCareer = (updatedCareer: CareerTrack) => {
    setCareers(careers.map((c) => (c.id === updatedCareer.id ? updatedCareer : c)));
  };

  const handleToggleArchiveCareer = (careerId: number) => {
    setCareers(
      careers.map((c) => (c.id === careerId ? { ...c, isArchived: !c.isArchived } : c))
    );
  };

  // Admin Actions: Milestones
  const handleAddMilestone = (newMilestone: Omit<Milestone, 'id'>) => {
    const nextId = Math.max(...milestones.map((m) => m.id), 0) + 1;
    setMilestones([...milestones, { ...newMilestone, id: nextId }]);
  };

  const handleUpdateMilestone = (updated: Milestone) => {
    setMilestones(milestones.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleDeleteMilestone = (milestoneId: number) => {
    setMilestones(milestones.filter((m) => m.id !== milestoneId));
  };

  // Admin Actions: Faculty Progress Override
  const handleFacultyOverrideProgress = (
    studentId: number,
    milestoneId: number,
    newStatus: 'completed' | 'not_started',
    notes?: string
  ) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.id !== studentId) return student;

        let completed = [...student.completedMilestoneIds];
        let inProgress = [...student.inProgressMilestoneIds];

        if (newStatus === 'completed') {
          if (!completed.includes(milestoneId)) completed.push(milestoneId);
          inProgress = inProgress.filter((id) => id !== milestoneId);
        } else {
          completed = completed.filter((id) => id !== milestoneId);
        }

        return {
          ...student,
          completedMilestoneIds: completed,
          inProgressMilestoneIds: inProgress,
          facultyNotes: notes || student.facultyNotes,
        };
      })
    );
  };

  const handleSignOffStudent = (studentId: number, facultyNotes: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, verifiedByFaculty: true, facultyNotes } : s))
    );
  };

  return (
    <div className="min-h-screen bg-[#080A11] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        careers={careers}
        activeCareer={activeCareer}
        setActiveCareerId={setActiveCareerId}
        trackProgressPercent={trackProgressPercent}
        currentStudent={currentStudent}
        students={students}
        onSwitchStudent={(s) => {
          setCurrentStudentId(s.id);
          setActiveCareerId(s.activeCareerId);
        }}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
        onAdminLogout={() => {
          setIsAdminAuthenticated(false);
          if (activeTab === 'admin') setActiveTab('dashboard');
        }}
        onOpenTutorial={() => setShowTutorial(true)}
        onOpenUserModal={() => setShowUserModal(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-7 pt-6 sm:pt-8">
        
        {activeTab === 'dashboard' && (
          <DashboardTab
            activeCareer={activeCareer}
            milestones={milestones}
            completedMilestoneIds={currentStudent.completedMilestoneIds}
            inProgressMilestoneIds={currentStudent.inProgressMilestoneIds}
            currentStudent={currentStudent}
            onNavigateTab={handleNavigateTab}
            onToggleCompleteMilestone={handleToggleCompleteMilestone}
          />
        )}

        {activeTab === 'roadmap' && (
          <RoadmapTab
            activeCareer={activeCareer}
            milestones={milestones}
            completedMilestoneIds={currentStudent.completedMilestoneIds}
            inProgressMilestoneIds={currentStudent.inProgressMilestoneIds}
            onToggleComplete={handleToggleCompleteMilestone}
            onToggleInProgress={handleToggleInProgressMilestone}
          />
        )}

        {activeTab === 'diagnostic' && (
          <DiagnosticTab
            activeCareer={activeCareer}
            quizzes={INITIAL_QUIZZES}
            onApplyDiagnosticPlacement={handleApplyDiagnosticPlacement}
            onNavigateRoadmap={() => setActiveTab('roadmap')}
          />
        )}

        {activeTab === 'resources' && (
          <ResourceHubTab
            activeCareer={activeCareer}
            careers={careers}
            resources={resources}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileExportTab
            currentStudent={currentStudent}
            activeCareer={activeCareer}
            milestones={milestones}
            completedMilestoneIds={currentStudent.completedMilestoneIds}
            onResetProgress={handleResetProgress}
          />
        )}

        {activeTab === 'admin' && isAdminAuthenticated && (
          <AdminPortal
            careers={careers}
            onAddCareer={handleAddCareer}
            onUpdateCareer={handleUpdateCareer}
            onToggleArchiveCareer={handleToggleArchiveCareer}
            milestones={milestones}
            onAddMilestone={handleAddMilestone}
            onUpdateMilestone={handleUpdateMilestone}
            onDeleteMilestone={handleDeleteMilestone}
            students={students}
            onFacultyOverrideProgress={handleFacultyOverrideProgress}
            onSignOffStudent={handleSignOffStudent}
            vivaQuestions={VIVA_QUESTIONS}
          />
        )}

      </main>

      {/* Admin Login Modal (admin / Admin@123) */}
      <AdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
        onLoginSuccess={() => {
          setIsAdminAuthenticated(true);
          setActiveTab('admin');
        }}
      />

      {/* Onboarding Tutorial Walkthrough */}
      <OnboardingTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        username={currentStudent.fullName || currentStudent.username}
      />

      {/* Student Account / Fresh Start Modal */}
      <UserAuthModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        careers={careers}
        onRegisterNewStudent={handleRegisterNewStudent}
        students={students}
        onSwitchStudent={(s) => {
          setCurrentStudentId(s.id);
          setActiveCareerId(s.activeCareerId);
        }}
        currentStudentId={currentStudentId}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#06080e] py-6 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            PathForge.io &copy; 2026 • Career Engine & Skill Analytics Benchmark
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setShowTutorial(true)}
              className="text-emerald-400 hover:underline flex items-center gap-1"
            >
              How it Works (Tutorial)
            </button>
            <span>•</span>
            {!isAdminAuthenticated ? (
              <button
                onClick={() => setShowAdminLoginModal(true)}
                className="text-slate-400 hover:text-emerald-300"
              >
                Faculty Admin Login
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsAdminAuthenticated(false);
                  if (activeTab === 'admin') setActiveTab('dashboard');
                }}
                className="text-red-400 hover:underline"
              >
                Exit Admin Mode
              </button>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
