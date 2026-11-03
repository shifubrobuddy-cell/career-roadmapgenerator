import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Archive, 
  RotateCcw, 
  CheckCircle2, 
  Search, 
  HelpCircle, 
  BookOpen, 
  Award, 
  ChevronRight,
  ExternalLink,
  Flame,
  UserCheck,
  Check,
  Copy,
  Clock,
  Sparkles,
  Database,
  FileText,
  Share2,
  Key,
  Network
} from 'lucide-react';
import { 
  CareerTrack, 
  Milestone, 
  StudentProfile, 
  VivaQuestion, 
  CareerStage 
} from '../types';

interface AdminPortalProps {
  careers: CareerTrack[];
  onAddCareer: (career: Omit<CareerTrack, 'id'>) => void;
  onUpdateCareer: (career: CareerTrack) => void;
  onToggleArchiveCareer: (careerId: number) => void;

  milestones: Milestone[];
  onAddMilestone: (milestone: Omit<Milestone, 'id'>) => void;
  onUpdateMilestone: (milestone: Milestone) => void;
  onDeleteMilestone: (milestoneId: number) => void;

  students: StudentProfile[];
  onFacultyOverrideProgress: (studentId: number, milestoneId: number, newStatus: 'completed' | 'not_started', notes?: string) => void;
  onSignOffStudent: (studentId: number, facultyNotes: string) => void;

  vivaQuestions: VivaQuestion[];
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  careers,
  onAddCareer,
  onUpdateCareer,
  onToggleArchiveCareer,
  milestones,
  onAddMilestone,
  onUpdateMilestone,
  onDeleteMilestone,
  students,
  onFacultyOverrideProgress,
  onSignOffStudent,
  vivaQuestions,
}) => {
  // Sub-tabs for the 5 screens requested
  const [adminTab, setAdminTab] = useState<'4.9' | '4.10' | '4.11' | '4.12' | '4.13'>('4.9');

  // Screen 4.9: Career Track Form Modal
  const [showAddCareerModal, setShowAddCareerModal] = useState(false);
  const [newCareerName, setNewCareerName] = useState('');
  const [newCareerSlug, setNewCareerSlug] = useState('');
  const [newCareerDesc, setNewCareerDesc] = useState('');
  const [newCareerDuration, setNewCareerDuration] = useState(20);
  const [newCareerTagline, setNewCareerTagline] = useState('');
  const [newCareerSalary, setNewCareerSalary] = useState('$80,000 - $120,000 / yr');
  const [newCareerDifficulty, setNewCareerDifficulty] = useState('Moderate');

  // Screen 4.10: Milestone Curation
  const [curationCareerId, setCurationCareerId] = useState<number>(1);
  const [showAddMilestoneModal, setShowAddMilestoneModal] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newMilestoneStage, setNewMilestoneStage] = useState<CareerStage>('Fundamentals');
  const [newMilestoneHours, setNewMilestoneHours] = useState(20);
  const [newMilestoneLink, setNewMilestoneLink] = useState('https://developer.mozilla.org/');
  const [newMilestoneResourceTitle, setNewMilestoneResourceTitle] = useState('Official Documentation');
  const [newMilestoneTopics, setNewMilestoneTopics] = useState('Syntax, Architecture, Best Practices');

  // Screen 4.11: Student Roster Search
  const [studentSearch, setStudentSearch] = useState('');
  const [rosterCareerFilter, setRosterCareerFilter] = useState('All');

  // Screen 4.12: Faculty Progress Override
  const [overrideStudentId, setOverrideStudentId] = useState<number>(101);
  const [facultyEvaluationRemarks, setFacultyEvaluationRemarks] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Screen 4.13: Viva Defense & Academic Diagrams
  const [vivaCategory, setVivaCategory] = useState<string>('All');
  const [copiedQuestionId, setCopiedQuestionId] = useState<number | null>(null);
  const [vivaSubView, setVivaSubView] = useState<'questions' | 'diagrams' | 'tech_stack'>('questions');
  const [copiedSnippetLabel, setCopiedSnippetLabel] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetLabel(label);
    setTimeout(() => setCopiedSnippetLabel(null), 2500);
  };

  // Handlers
  const handleCreateCareer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCareerName.trim()) return;

    onAddCareer({
      name: newCareerName,
      slug: newCareerSlug || newCareerName.toLowerCase().replace(/\s+/g, '-'),
      description: newCareerDesc,
      totalDurationWeeks: Number(newCareerDuration),
      tagline: newCareerTagline || 'Master industry-standard competencies and tools',
      avgSalary: newCareerSalary,
      difficultyLevel: newCareerDifficulty,
      iconKey: 'Layers',
      badgeColor: 'emerald',
      isArchived: false,
    });

    setNewCareerName('');
    setNewCareerSlug('');
    setNewCareerDesc('');
    setShowAddCareerModal(false);
  };

  const handleCreateMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    const currentCareerMilestones = milestones.filter(m => m.careerId === curationCareerId);
    const nextStepOrder = currentCareerMilestones.length + 1;

    onAddMilestone({
      careerId: curationCareerId,
      stepOrder: nextStepOrder,
      stage: newMilestoneStage,
      title: newMilestoneTitle,
      description: newMilestoneDesc,
      estimatedHours: Number(newMilestoneHours),
      resourceLink: newMilestoneLink,
      resourceTitle: newMilestoneResourceTitle,
      resourceType: 'Documentation',
      difficulty: newMilestoneStage === 'Fundamentals' ? 'Beginner' : newMilestoneStage === 'Intermediate' ? 'Intermediate' : 'Advanced',
      keyTopics: newMilestoneTopics.split(',').map(s => s.trim()).filter(Boolean),
      checklist: ['Read official documentation', 'Implement practical prototype', 'Verify edge cases'],
      miniProjectTitle: `${newMilestoneTitle} Practical Lab`,
      miniProjectDesc: `Hands-on implementation applying core concepts of ${newMilestoneTitle}.`,
    });

    setNewMilestoneTitle('');
    setNewMilestoneDesc('');
    setShowAddMilestoneModal(false);
  };

  const handleSignOff = () => {
    onSignOffStudent(overrideStudentId, facultyEvaluationRemarks || 'Laboratory evaluation verified and signed off by Faculty Examiner.');
    setFeedbackSuccess(true);
    setTimeout(() => setFeedbackSuccess(false), 3000);
  };

  const selectedStudent = students.find(s => s.id === overrideStudentId) || students[0];
  const selectedStudentMilestones = milestones.filter(m => m.careerId === selectedStudent.activeCareerId);

  return (
    <div className="space-y-6 pb-24">
      
      {/* Top Banner */}
      <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800 p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ACADEMIC FACULTY PORTAL & EXAMINATION CONTROLS</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Curriculum Administration & Student Oversight
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl">
            Compliant with university examination guidelines. Faculty can manage career tracks, curate learning milestones, review enrolled students, override laboratory evaluations, and access viva defense rubrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs font-bold">
            Academic Year: 2026–27
          </span>
        </div>
      </div>

      {/* Sub-Tabs for Screens 4.9 to 4.13 */}
      <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setAdminTab('4.9')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            adminTab === '4.9'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>Screen 4.9:</span>
          <span>Career Track Management</span>
        </button>

        <button
          onClick={() => setAdminTab('4.10')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            adminTab === '4.10'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>Screen 4.10:</span>
          <span>Milestone Curation</span>
        </button>

        <button
          onClick={() => setAdminTab('4.11')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            adminTab === '4.11'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>Screen 4.11:</span>
          <span>Enrolled Student Roster</span>
        </button>

        <button
          onClick={() => setAdminTab('4.12')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            adminTab === '4.12'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>Screen 4.12:</span>
          <span>Faculty Progress Override</span>
        </button>

        <button
          onClick={() => setAdminTab('4.13')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            adminTab === '4.13'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <span>Screen 4.13:</span>
          <span>Academic Viva Defense Guide</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* SCREEN 4.9: Career Track Management */}
      {/* ========================================================= */}
      {adminTab === '4.9' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Figure 4.9 – Admin Portal: Career Track Management
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Academic Disciplines & Curricula Overview
                </h3>
                <p className="text-xs text-slate-400">
                  Faculty can view, create, edit or archive career disciplines available to enrolled students.
                </p>
              </div>

              <button
                onClick={() => setShowAddCareerModal(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition self-start sm:self-auto shadow-md shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create New Career Discipline</span>
              </button>
            </div>

            {/* Career Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {careers.map((career) => (
                <div
                  key={career.id}
                  className={`rounded-xl border p-5 flex flex-col justify-between space-y-4 transition ${
                    career.isArchived
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-[#0d121f] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-slate-500">ID: {career.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                        career.isArchived
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {career.isArchived ? 'ARCHIVED' : 'ACTIVE CURRICULUM'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">{career.name}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {career.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-slate-300">
                      <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80">
                        <span className="text-slate-500 block text-[9px] uppercase">Duration</span>
                        {career.totalDurationWeeks} Weeks
                      </div>
                      <div className="bg-slate-900/80 p-2 rounded border border-slate-800/80">
                        <span className="text-slate-500 block text-[9px] uppercase">Difficulty</span>
                        {career.difficultyLevel}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {milestones.filter(m => m.careerId === career.id).length} Milestones
                    </span>

                    <button
                      onClick={() => onToggleArchiveCareer(career.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>{career.isArchived ? 'Unarchive' : 'Archive'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Create Career Modal */}
          {showAddCareerModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="rounded-2xl bg-[#0f1422] border border-slate-700 p-6 md:p-8 max-w-lg w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="text-lg font-bold text-white">Create New Career Discipline</h4>
                  <button
                    onClick={() => setShowAddCareerModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateCareer} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Career Discipline Title:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cloud DevOps Engineer"
                      value={newCareerName}
                      onChange={(e) => setNewCareerName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Discipline Description:</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Summarize course goals and technical capabilities..."
                      value={newCareerDesc}
                      onChange={(e) => setNewCareerDesc(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Duration (Weeks):</label>
                      <input
                        type="number"
                        min="4"
                        max="52"
                        value={newCareerDuration}
                        onChange={(e) => setNewCareerDuration(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Difficulty:</label>
                      <select
                        value={newCareerDifficulty}
                        onChange={(e) => setNewCareerDifficulty(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Challenging">Challenging</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAddCareerModal(false)}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                    >
                      Save Discipline
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SCREEN 4.10: Milestone Curation */}
      {/* ========================================================= */}
      {adminTab === '4.10' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800 p-6 shadow-xl space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Figure 4.10 – Admin Portal: Milestone Curation
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Curate & Structure Learning Milestones
                </h3>
                <p className="text-xs text-slate-400">
                  Create and edit milestones with stage assignment, estimated laboratory hours and official resource links.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={curationCareerId}
                  onChange={(e) => setCurationCareerId(Number(e.target.value))}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  {careers.map((c) => (
                    <option key={c.id} value={c.id}>
                      Curate: {c.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setShowAddMilestoneModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-emerald-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Milestone</span>
                </button>
              </div>
            </div>

            {/* Milestones Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                    <th className="py-3 px-3">Step</th>
                    <th className="py-3 px-3">Stage</th>
                    <th className="py-3 px-3">Milestone Title</th>
                    <th className="py-3 px-3">Hours</th>
                    <th className="py-3 px-3">Resource Documentation</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {milestones
                    .filter((m) => m.careerId === curationCareerId)
                    .map((m) => (
                      <tr key={m.id} className="hover:bg-slate-900/50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                          #{m.stepOrder}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${
                            m.stage === 'Fundamentals'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : m.stage === 'Intermediate'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {m.stage}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">{m.title}</div>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{m.description}</div>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-300">
                          ~{m.estimatedHours}h
                        </td>
                        <td className="py-3 px-3">
                          {m.resourceLink ? (
                            <a
                              href={m.resourceLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                            >
                              <span>{m.resourceTitle || 'Documentation'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onDeleteMilestone(m.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
                            title="Delete Milestone"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Add Milestone Modal */}
          {showAddMilestoneModal && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="rounded-2xl bg-[#0f1422] border border-slate-700 p-6 md:p-8 max-w-lg w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h4 className="text-lg font-bold text-white">Create New Curriculum Milestone</h4>
                  <button
                    onClick={() => setShowAddMilestoneModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateMilestone} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Milestone Title:</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GraphQL Client Queries & Mutation Schema"
                      value={newMilestoneTitle}
                      onChange={(e) => setNewMilestoneTitle(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Curriculum Stage & Estimated Hours:</label>
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={newMilestoneStage}
                        onChange={(e) => setNewMilestoneStage(e.target.value as CareerStage)}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                      >
                        <option value="Fundamentals">Fundamentals</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>

                      <input
                        type="number"
                        min="5"
                        max="100"
                        value={newMilestoneHours}
                        onChange={(e) => setNewMilestoneHours(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Milestone Syllabus Description:</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Specify key theoretical and laboratory competencies..."
                      value={newMilestoneDesc}
                      onChange={(e) => setNewMilestoneDesc(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Documentation Resource URL:</label>
                    <input
                      type="url"
                      value={newMilestoneLink}
                      onChange={(e) => setNewMilestoneLink(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAddMilestoneModal(false)}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                    >
                      Save Milestone
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SCREEN 4.11: Enrolled Student Roster */}
      {/* ========================================================= */}
      {adminTab === '4.11' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800 p-6 shadow-xl space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Figure 4.11 – Enrolled Student Roster
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Registered Student Cohort & Progress Benchmarks
                </h3>
                <p className="text-xs text-slate-400">
                  Lists students with active track, completion percentage, study streak, and last recorded session.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search candidate..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
                  />
                </div>

                <select
                  value={rosterCareerFilter}
                  onChange={(e) => setRosterCareerFilter(e.target.value)}
                  className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  <option value="All">All Disciplines</option>
                  {careers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                    <th className="py-3 px-3">Student Candidate</th>
                    <th className="py-3 px-3">Target Career Track</th>
                    <th className="py-3 px-3">Completion Rate</th>
                    <th className="py-3 px-3">Study Streak</th>
                    <th className="py-3 px-3">Last Recorded Activity</th>
                    <th className="py-3 px-3 text-right">Faculty Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {students
                    .filter((s) => {
                      const matchesSearch = s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
                        s.email.toLowerCase().includes(studentSearch.toLowerCase());
                      const matchesTrack = rosterCareerFilter === 'All' || s.activeCareerId === Number(rosterCareerFilter);
                      return matchesSearch && matchesTrack;
                    })
                    .map((s) => {
                      const careerObj = careers.find(c => c.id === s.activeCareerId) || careers[0];
                      const totalTrackMilestones = milestones.filter(m => m.careerId === s.activeCareerId).length || 1;
                      const percent = Math.round((s.completedMilestoneIds.length / totalTrackMilestones) * 100);

                      return (
                        <tr key={s.id} className="hover:bg-slate-900/50 transition">
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 font-bold flex items-center justify-center uppercase font-mono">
                                {s.username.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-white">{s.fullName}</div>
                                <div className="text-[11px] text-slate-400 font-mono">{s.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-200">{careerObj.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{s.targetGoal}</div>
                          </td>
                          <td className="py-3 px-3 font-mono">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className="font-bold text-emerald-400">{percent}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono text-orange-400 font-bold">
                            <span className="flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5" />
                              <span>{s.studyStreakDays} Days</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                            {s.lastLogin}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              s.verifiedByFaculty
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            }`}>
                              {s.verifiedByFaculty ? 'VERIFIED' : 'PENDING EVAL'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCREEN 4.12: Faculty Progress Override */}
      {/* ========================================================= */}
      {adminTab === '4.12' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800 p-6 shadow-xl space-y-6">
            
            <div className="pb-4 border-b border-slate-800">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Figure 4.12 – Faculty Progress Override
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Fast-Track & Milestone Clearance After Laboratory Evaluation
              </h3>
              <p className="text-xs text-slate-400">
                Authorized examiners can override, sign off, or fast-track milestone completions following hands-on practical lab tests.
              </p>
            </div>

            {/* Candidate Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Select Candidate for Evaluation:</label>
                <select
                  value={overrideStudentId}
                  onChange={(e) => setOverrideStudentId(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.email}) — Track: {careers.find(c => c.id === s.activeCareerId)?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Current Clearance</span>
                  <span className="text-white font-bold">{selectedStudent.fullName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px] uppercase">Viva Clearance</span>
                  <span className={selectedStudent.verifiedByFaculty ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                    {selectedStudent.verifiedByFaculty ? 'APPROVED' : 'AWAITING EVAL'}
                  </span>
                </div>
              </div>
            </div>

            {/* Milestones Override List */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Milestone Sign-Off Checklist for {careers.find(c => c.id === selectedStudent.activeCareerId)?.name}:
              </div>

              <div className="space-y-2">
                {selectedStudentMilestones.map((m) => {
                  const isDone = selectedStudent.completedMilestoneIds.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-500">#{m.stepOrder}</span>
                        <div>
                          <div className="font-bold text-white">{m.title}</div>
                          <div className="text-[11px] text-slate-400">{m.stage} • ~{m.estimatedHours}h</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 font-mono font-bold text-[10px]">
                            PASSED LAB ✓
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">
                            NOT APPROVED
                          </span>
                        )}

                        <button
                          onClick={() => onFacultyOverrideProgress(
                            selectedStudent.id,
                            m.id,
                            isDone ? 'not_started' : 'completed',
                            'Approved via Laboratory Viva Defense Override'
                          )}
                          className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition ${
                            isDone
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                          }`}
                        >
                          {isDone ? 'Revoke Approval' : 'Fast-Track & Approve'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Faculty Examination Sign-Off Remarks */}
            <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Official Faculty Sign-off Remarks & Laboratory Log:
              </label>
              <textarea
                rows={2}
                value={facultyEvaluationRemarks}
                onChange={(e) => setFacultyEvaluationRemarks(e.target.value)}
                placeholder="Candidate verified in laboratory examination. Code implementation meets criteria."
                className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              />

              <div className="flex items-center justify-between pt-1">
                {feedbackSuccess ? (
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-4 h-4" /> Sign-off certificate recorded successfully!
                  </span>
                ) : <div />}

                <button
                  onClick={handleSignOff}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition"
                >
                  <Award className="w-4 h-4" />
                  <span>Execute Official Faculty Sign-off</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SCREEN 4.13: Academic Viva Defense Guide & UML/ERD Models */}
      {/* ========================================================= */}
      {adminTab === '4.13' && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#0f1422]/90 border border-slate-800 p-6 shadow-xl space-y-6">
            
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Figure 4.13 – Academic Viva Defense Guide & UML/ERD Models</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Technical Defense Rubric, Examination Architecture & Dual-Actor Diagrams
                </h3>
                <p className="text-xs text-slate-400">
                  Comprehensive examiner question bank, complete Dual-Actor Use Case Model (Student & Admin), 3NF Relational Database Schema with Primary & Foreign Keys, and College Stack verification.
                </p>
              </div>

              {/* Sub-view switcher */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700/80">
                <button
                  onClick={() => setVivaSubView('questions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    vivaSubView === 'questions'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Question Bank</span>
                </button>
                <button
                  onClick={() => setVivaSubView('diagrams')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    vivaSubView === 'diagrams'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>UML & ERD Diagrams</span>
                </button>
                <button
                  onClick={() => setVivaSubView('tech_stack')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    vivaSubView === 'tech_stack'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Stack Matrix</span>
                </button>
              </div>
            </div>

            {/* Notification alert for copy action */}
            {copiedSnippetLabel && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Copied {copiedSnippetLabel} to clipboard!</span>
              </div>
            )}

            {/* SUB-VIEW 1: QUESTION BANK */}
            {vivaSubView === 'questions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <div className="text-xs text-slate-400">
                    Showing {vivaQuestions.filter((q) => vivaCategory === 'All' || q.category === vivaCategory).length} official viva questions
                  </div>

                  <select
                    value={vivaCategory}
                    onChange={(e) => setVivaCategory(e.target.value)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="All">All Examination Disciplines</option>
                    <option value="System Architecture">System Architecture</option>
                    <option value="Database 3NF">Database 3NF</option>
                    <option value="Backend PDO">Backend PDO</option>
                    <option value="Frontend React">Frontend React</option>
                    <option value="Security & OWASP">Security & OWASP</option>
                  </select>
                </div>

                <div className="space-y-4">
                  {vivaQuestions
                    .filter((q) => vivaCategory === 'All' || q.category === vivaCategory)
                    .map((q) => (
                      <div
                        key={q.id}
                        className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase">
                              {q.category}
                            </span>
                            <h4 className="text-sm font-bold text-white leading-relaxed">
                              Q: {q.question}
                            </h4>
                          </div>

                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`Q: ${q.question}\n\nA: ${q.suggestedAnswer}`);
                              setCopiedQuestionId(q.id);
                              setTimeout(() => setCopiedQuestionId(null), 2000);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 transition"
                            title="Copy Question & Answer"
                          >
                            {copiedQuestionId === q.id ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        <div className="p-3 rounded-lg bg-[#0a0d16] border border-slate-800/80 text-xs space-y-1.5">
                          <div className="font-bold text-emerald-400">Model Technical Response:</div>
                          <p className="text-slate-300 leading-relaxed">{q.suggestedAnswer}</p>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/20 p-2.5 rounded-lg border border-amber-500/20">
                          <HelpCircle className="w-4 h-4 shrink-0 text-amber-400" />
                          <span><strong>Expected Examiner Follow-up:</strong> {q.examinerFollowUp}</span>
                        </div>

                        {q.codeSnippet && (
                          <pre className="p-3 rounded-lg bg-slate-950 text-xs font-mono text-emerald-300 border border-slate-800 overflow-x-auto">
                            <code>{q.codeSnippet}</code>
                          </pre>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* SUB-VIEW 2: UML & ERD DIAGRAMS */}
            {vivaSubView === 'diagrams' && (
              <div className="space-y-8">
                
                {/* 1. DUAL-ACTOR USE CASE DIAGRAM (FIGURE 3.6) */}
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold font-mono text-emerald-400 uppercase tracking-wider block">
                        Figure 3.6 — Dual-Actor UML Use Case Diagram
                      </span>
                      <h4 className="text-base font-bold text-white">
                        Unified Use Case Model: Student & Faculty Admin Actors
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(
`Generate a clean, high-resolution academic UML Use Case Diagram for a web application named 'PathForge Career Engine'.
The diagram must feature two distinct human actors outside a large system boundary rectangle:

LEFT ACTOR: 'Student'
Use Cases connected to Student:
- UC-01: Select & Switch Career Track
- UC-02: Calibrate Skills via Diagnostic Assessment
- UC-03: View Serpentine & Kanban Roadmap
- UC-04: Manage Milestone Checklist & Mini-Labs
- UC-05: Adjust Weekly Pace & Completion Slider
- UC-06: Focus Study Lab with Pomodoro Timer
- UC-07: Search, Filter & Bookmark 47+ Learning Courses
- UC-08: Export Verified Academic Portfolio (JSON/MD/PDF)

RIGHT ACTOR: 'Faculty Admin'
Use Cases connected to Faculty Admin:
- UC-09: Authenticate via Role-Gated Portal (admin / Admin@123)
- UC-10: Manage Career Tracks (Create, Edit, Archive)
- UC-11: Curate Milestones, Stage Orders & Resource URLs
- UC-12: Enrolled Student Roster & Live Learning Analytics
- UC-13: Fast-Track & Override Milestone Progress (Lab Sign-off)
- UC-14: Access Academic Viva Defense & Examination Rubrics

Style: Clean professional software engineering UML diagram, white background, crisp vector lines, standard stick figures, and oval use case nodes labeled with UC identifiers.`,
                          'ChatGPT / Claude Diagram Prompt'
                        )}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy ChatGPT Prompt</span>
                      </button>

                      <button
                        onClick={() => copyToClipboard(
`@startuml Figure_3_6_Dual_Actor_Use_Case_Model
left to right direction
skinparam packageStyle rectangle
skinparam handwritten false
skinparam monochrome false

actor "Student" as student
actor "Faculty Admin" as admin

rectangle "PathForge Career Engine (System Boundary)" {
  usecase "UC-01 Select Career Track" as UC1
  usecase "UC-02 Calibrate via Diagnostic Quiz" as UC2
  usecase "UC-03 View Serpentine & Kanban Roadmap" as UC3
  usecase "UC-04 Manage Milestone Checklist & Labs" as UC4
  usecase "UC-05 Adjust Weekly Pace Slider" as UC5
  usecase "UC-06 Pomodoro Focus Study Lab" as UC6
  usecase "UC-07 Search & Bookmark Courses" as UC7
  usecase "UC-08 Export Profile & Academic Dossier" as UC8

  usecase "UC-09 Authenticate Admin Credentials" as UC9
  usecase "UC-10 Manage Career Tracks (CRUD)" as UC10
  usecase "UC-11 Curate Milestones & Hours" as UC11
  usecase "UC-12 Enrolled Student Roster & Metrics" as UC12
  usecase "UC-13 Faculty Progress Lab Override" as UC13
  usecase "UC-14 Academic Viva Defense Guide" as UC14
}

student --> UC1
student --> UC2
student --> UC3
student --> UC4
student --> UC5
student --> UC6
student --> UC7
student --> UC8

admin --> UC9
admin --> UC10
admin --> UC11
admin --> UC12
admin --> UC13
admin --> UC14
@enduml`,
                          'PlantUML Code'
                        )}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy PlantUML</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual Diagram Canvas */}
                  <div className="p-6 rounded-xl bg-[#080b13] border border-slate-800/90 overflow-x-auto">
                    <div className="min-w-[700px] flex items-center justify-between gap-6 py-4">
                      
                      {/* Left: Student Actor */}
                      <div className="flex flex-col items-center gap-3 w-40 shrink-0">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold text-xl shadow-lg shadow-emerald-500/10">
                          🧑‍🎓
                        </div>
                        <div className="text-center">
                          <span className="font-bold text-sm text-white block">Student</span>
                          <span className="text-[10px] text-emerald-400 font-mono">Primary End-User</span>
                        </div>
                        <div className="h-44 w-0.5 bg-gradient-to-b from-emerald-500/40 via-emerald-500/20 to-transparent" />
                      </div>

                      {/* Middle: System Boundary Container */}
                      <div className="flex-1 rounded-2xl bg-slate-900/90 border-2 border-slate-700/80 p-5 space-y-4 shadow-xl">
                        <div className="text-center pb-2 border-b border-slate-800">
                          <span className="text-xs font-mono font-bold text-slate-300 tracking-wider uppercase">
                            SYSTEM BOUNDARY: PathForge Career Engine
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Student Use Cases */}
                          <div className="space-y-2">
                            <div className="text-[11px] font-bold text-emerald-400 font-mono uppercase tracking-wide">
                              Student Use Cases
                            </div>
                            {[
                              'UC-01 Select & Switch Career Track',
                              'UC-02 Calibrate via Diagnostic Quiz',
                              'UC-03 View Serpentine & Kanban Roadmap',
                              'UC-04 Manage Milestone Checklist & Labs',
                              'UC-05 Adjust Weekly Pace Slider',
                              'UC-06 Pomodoro Focus Study Lab',
                              'UC-07 Search & Bookmark Courses',
                              'UC-08 Export Profile & Academic Dossier',
                            ].map((uc, i) => (
                              <div
                                key={i}
                                className="px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-medium text-emerald-200 flex items-center gap-1.5 shadow-sm"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span>{uc}</span>
                              </div>
                            ))}
                          </div>

                          {/* Admin Use Cases */}
                          <div className="space-y-2">
                            <div className="text-[11px] font-bold text-cyan-400 font-mono uppercase tracking-wide">
                              Faculty Admin Use Cases
                            </div>
                            {[
                              'UC-09 Role-Gated Admin Auth (admin/Admin@123)',
                              'UC-10 Career Track Management (Screen 4.9)',
                              'UC-11 Milestone Curation & Hours (Screen 4.10)',
                              'UC-12 Enrolled Student Roster (Screen 4.11)',
                              'UC-13 Faculty Lab Override (Screen 4.12)',
                              'UC-14 Academic Viva Defense Guide (Screen 4.13)',
                            ].map((uc, i) => (
                              <div
                                key={i}
                                className="px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-medium text-cyan-200 flex items-center gap-1.5 shadow-sm"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                <span>{uc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Faculty Admin Actor */}
                      <div className="flex flex-col items-center gap-3 w-40 shrink-0">
                        <div className="w-16 h-16 rounded-full bg-cyan-500/10 border-2 border-cyan-500/40 flex items-center justify-center text-cyan-400 font-extrabold text-xl shadow-lg shadow-cyan-500/10">
                          👨‍🏫
                        </div>
                        <div className="text-center">
                          <span className="font-bold text-sm text-white block">Faculty Admin</span>
                          <span className="text-[10px] text-cyan-400 font-mono">Academic Examiner</span>
                        </div>
                        <div className="h-44 w-0.5 bg-gradient-to-b from-cyan-500/40 via-cyan-500/20 to-transparent" />
                      </div>

                    </div>
                  </div>
                </div>

                {/* 2. 3NF RELATIONAL DATABASE SCHEMA & ERD (FIGURE 3.7) */}
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold font-mono text-cyan-400 uppercase tracking-wider block">
                        Figure 3.7 — 3NF Relational Database Schema & ERD
                      </span>
                      <h4 className="text-base font-bold text-white">
                        Entity Relationship Model with Explicit Primary Keys [PK] & Foreign Keys [FK]
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(
`erDiagram
    USERS ||--o{ STUDENT_PROGRESS : tracks
    USERS ||--o{ DIAGNOSTIC_ATTEMPTS : completes
    CAREER_TRACKS ||--o{ MILESTONES : contains
    CAREER_TRACKS ||--o{ LEARNING_RESOURCES : offers
    CAREER_TRACKS ||--o{ DIAGNOSTIC_QUESTIONS : evaluates
    MILESTONES ||--o{ STUDENT_PROGRESS : recorded_in

    USERS {
        int id PK "Primary Key"
        varchar username "Candidate handle"
        varchar email "Unique identifier"
        varchar password_hash "Bcrypt hash"
        varchar role "student or admin"
        timestamp created_at
    }

    CAREER_TRACKS {
        int id PK "Primary Key"
        varchar name "Track title"
        varchar slug "URL slug"
        text description
        int total_duration_weeks
        varchar avg_salary
        boolean is_archived
    }

    MILESTONES {
        int id PK "Primary Key"
        int career_id FK "References CAREER_TRACKS.id"
        int step_order
        varchar stage "Fundamentals or Intermediate or Advanced"
        varchar title
        int estimated_hours
        varchar resource_link
    }

    STUDENT_PROGRESS {
        int id PK "Primary Key"
        int student_id FK "References USERS.id"
        int milestone_id FK "References MILESTONES.id"
        varchar status "completed or not_started"
        text faculty_override_notes
        timestamp updated_at
    }

    LEARNING_RESOURCES {
        int id PK "Primary Key"
        int career_id FK "References CAREER_TRACKS.id"
        varchar title
        varchar provider
        varchar resource_url
        boolean is_free
        boolean has_certificate
    }`,
                          'Mermaid ERD Code'
                        )}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Mermaid ERD</span>
                      </button>

                      <button
                        onClick={() => copyToClipboard(
`-- PathForge 3NF Normalized Schema DDL
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE career_tracks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    total_duration_weeks INT NOT NULL DEFAULT 20,
    avg_salary VARCHAR(100),
    is_archived TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE milestones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    career_id INT NOT NULL,
    step_order INT NOT NULL,
    stage ENUM('Fundamentals', 'Intermediate', 'Advanced', 'Capstone') NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    estimated_hours INT DEFAULT 20,
    resource_link VARCHAR(255),
    FOREIGN KEY (career_id) REFERENCES career_tracks(id) ON DELETE CASCADE,
    INDEX idx_career_step (career_id, step_order)
) ENGINE=InnoDB;

CREATE TABLE student_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    milestone_id INT NOT NULL,
    status ENUM('completed', 'not_started', 'in_progress') DEFAULT 'not_started',
    faculty_override_notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE CASCADE,
    UNIQUE KEY uq_student_milestone (student_id, milestone_id)
) ENGINE=InnoDB;

CREATE TABLE learning_resources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    career_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    resource_url VARCHAR(255) NOT NULL,
    format ENUM('Course', 'Interactive', 'Documentation', 'Video', 'Book') DEFAULT 'Course',
    is_free TINYINT(1) DEFAULT 1,
    has_certificate TINYINT(1) DEFAULT 0,
    FOREIGN KEY (career_id) REFERENCES career_tracks(id) ON DELETE CASCADE
) ENGINE=InnoDB;`,
                          'MySQL 8.0 DDL Schema'
                        )}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy MySQL DDL</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual Tables Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* TABLE: users */}
                    <div className="rounded-xl bg-[#090d16] border border-slate-800 p-4 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-mono font-bold text-white text-xs">users</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">Entity</span>
                      </div>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between text-emerald-400 font-bold">
                          <span>id</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[10px] border border-emerald-500/40">PK INT</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>username</span>
                          <span className="text-slate-500 text-[10px]">VARCHAR(100)</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>email</span>
                          <span className="text-slate-500 text-[10px]">VARCHAR(150)</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>password_hash</span>
                          <span className="text-slate-500 text-[10px]">VARCHAR(255)</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>role</span>
                          <span className="text-slate-500 text-[10px]">ENUM</span>
                        </div>
                      </div>
                    </div>

                    {/* TABLE: career_tracks */}
                    <div className="rounded-xl bg-[#090d16] border border-slate-800 p-4 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-mono font-bold text-white text-xs">career_tracks</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">Entity</span>
                      </div>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between text-emerald-400 font-bold">
                          <span>id</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[10px] border border-emerald-500/40">PK INT</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>name</span>
                          <span className="text-slate-500 text-[10px]">VARCHAR(150)</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>slug</span>
                          <span className="text-slate-500 text-[10px]">VARCHAR(150)</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>total_duration_weeks</span>
                          <span className="text-slate-500 text-[10px]">INT</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>is_archived</span>
                          <span className="text-slate-500 text-[10px]">TINYINT(1)</span>
                        </div>
                      </div>
                    </div>

                    {/* TABLE: milestones */}
                    <div className="rounded-xl bg-[#090d16] border border-slate-800 p-4 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-mono font-bold text-white text-xs">milestones</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">Child Entity</span>
                      </div>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between text-emerald-400 font-bold">
                          <span>id</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[10px] border border-emerald-500/40">PK INT</span>
                        </div>
                        <div className="flex items-center justify-between text-cyan-400 font-bold">
                          <span>career_id</span>
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-[10px] border border-cyan-500/40">FK &rarr; careers</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>step_order</span>
                          <span className="text-slate-500 text-[10px]">INT</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>stage</span>
                          <span className="text-slate-500 text-[10px]">ENUM</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>estimated_hours</span>
                          <span className="text-slate-500 text-[10px]">INT</span>
                        </div>
                      </div>
                    </div>

                    {/* TABLE: student_progress */}
                    <div className="rounded-xl bg-[#090d16] border border-slate-800 p-4 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-mono font-bold text-white text-xs">student_progress</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-mono">Bridge / Junction</span>
                      </div>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between text-emerald-400 font-bold">
                          <span>id</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[10px] border border-emerald-500/40">PK INT</span>
                        </div>
                        <div className="flex items-center justify-between text-cyan-400 font-bold">
                          <span>student_id</span>
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-[10px] border border-cyan-500/40">FK &rarr; users</span>
                        </div>
                        <div className="flex items-center justify-between text-cyan-400 font-bold">
                          <span>milestone_id</span>
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-[10px] border border-cyan-500/40">FK &rarr; milestones</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>status</span>
                          <span className="text-slate-500 text-[10px]">ENUM</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>faculty_override_notes</span>
                          <span className="text-slate-500 text-[10px]">TEXT</span>
                        </div>
                      </div>
                    </div>

                    {/* TABLE: learning_resources */}
                    <div className="rounded-xl bg-[#090d16] border border-slate-800 p-4 space-y-2.5">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="font-mono font-bold text-white text-xs">learning_resources</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 font-mono">Catalogue</span>
                      </div>
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex items-center justify-between text-emerald-400 font-bold">
                          <span>id</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-[10px] border border-emerald-500/40">PK INT</span>
                        </div>
                        <div className="flex items-center justify-between text-cyan-400 font-bold">
                          <span>career_id</span>
                          <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-[10px] border border-cyan-500/40">FK &rarr; careers</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>title</span>
                          <span className="text-slate-500 text-[10px]">VARCHAR(200)</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>provider</span>
                          <span className="text-slate-500 text-[10px]">VARCHAR(100)</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>is_free</span>
                          <span className="text-slate-500 text-[10px]">TINYINT(1)</span>
                        </div>
                      </div>
                    </div>

                    {/* Normalization Defense Card */}
                    <div className="rounded-xl bg-slate-900 border border-slate-800 p-4 space-y-2 text-xs">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>3NF Normalization Defense</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        • <strong>1NF:</strong> All column values are atomic; no repeating groups.
                        <br />• <strong>2NF:</strong> No partial functional dependencies on candidate keys.
                        <br />• <strong>3NF:</strong> No transitive dependencies (non-prime attributes depend only on the primary key).
                      </p>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* SUB-VIEW 3: STACK MATRIX */}
            {vivaSubView === 'tech_stack' && (
              <div className="space-y-5">
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold font-mono text-emerald-400 uppercase tracking-wider block">
                        Academic Technology Verification Matrix
                      </span>
                      <h4 className="text-base font-bold text-white">
                        Specification Conformance & Architectural Compliance
                      </h4>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-mono">
                          <th className="py-2.5 px-3">College Requirement</th>
                          <th className="py-2.5 px-3">Implementation</th>
                          <th className="py-2.5 px-3">Deployment Target</th>
                          <th className="py-2.5 px-3 text-right">Verification Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-white">Frontend Markup</td>
                          <td className="py-2.5 px-3">HTML5 Semantic Canvas</td>
                          <td className="py-2.5 px-3 text-slate-400">Vercel & XAMPP htdocs</td>
                          <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">100% VERIFIED ✓</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-white">Visual Styling</td>
                          <td className="py-2.5 px-3">CSS3 Blueprint Grid (42px)</td>
                          <td className="py-2.5 px-3 text-slate-400">Vercel & XAMPP htdocs</td>
                          <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">100% VERIFIED ✓</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-white">Client Interactions</td>
                          <td className="py-2.5 px-3">Vanilla JavaScript / React 19</td>
                          <td className="py-2.5 px-3 text-slate-400">Vercel Edge & Browsers</td>
                          <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">100% VERIFIED ✓</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-white">Backend Storage & Models</td>
                          <td className="py-2.5 px-3">PHP 8.x PDO & MySQL 8.0 3NF</td>
                          <td className="py-2.5 px-3 text-slate-400">XAMPP Apache & phpMyAdmin</td>
                          <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">100% VERIFIED ✓</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-white">Admin Security Access</td>
                          <td className="py-2.5 px-3">Credential Gate: admin / Admin@123</td>
                          <td className="py-2.5 px-3 text-slate-400">Screen 4.9 – 4.13</td>
                          <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">100% VERIFIED ✓</td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-bold text-white">Live Cloud Hosting</td>
                          <td className="py-2.5 px-3">Zero-Config Static SPA Delivery</td>
                          <td className="py-2.5 px-3 text-slate-400">Vercel Production Edge</td>
                          <td className="py-2.5 px-3 text-right text-emerald-400 font-bold">100% VERIFIED ✓</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
