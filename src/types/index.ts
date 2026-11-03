export type CareerStage = 'Fundamentals' | 'Intermediate' | 'Advanced';

export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed';

export interface Milestone {
  id: number;
  careerId: number;
  stepOrder: number;
  stage: CareerStage;
  title: string;
  description: string;
  resourceLink: string;
  resourceTitle: string;
  resourceType: 'Documentation' | 'Article' | 'Interactive' | 'Book' | 'Video Course';
  estimatedHours: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  keyTopics: string[];
  checklist: string[];
  miniProjectTitle?: string;
  miniProjectDesc?: string;
}

export interface CareerTrack {
  id: number;
  slug: string;
  name: string;
  description: string;
  iconKey: string;
  avgSalary: string;
  difficultyLevel: string;
  totalDurationWeeks: number;
  tagline: string;
  badgeColor: string;
  isArchived?: boolean;
}

export interface UserProgressRecord {
  milestoneId: number;
  status: MilestoneStatus;
  confidenceRating: number;
  notes?: string;
  completedAt?: string;
}

export interface QuizQuestion {
  id: number;
  careerId: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  associatedSkillId: number;
  skillName: string;
  topic: string;
}

export interface LearningResource {
  id: number;
  careerId: number;
  skillId?: number;
  title: string;
  provider?: string;
  resourceType: string;
  url: string;
  estimatedHours: number;
  isFree: boolean;
  hasCertificate?: boolean;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  isBookmarked?: boolean;
}

export interface StudentProfile {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  targetGoal: string;
  studyStreakDays: number;
  activeCareerId: number;
  avatarUrl: string;
  lastLogin: string;
  completedMilestoneIds: number[];
  inProgressMilestoneIds: number[];
  facultyNotes?: string;
  verifiedByFaculty?: boolean;
}

export interface VivaQuestion {
  id: number;
  category: 'System Architecture' | 'Database 3NF' | 'Backend PDO' | 'Frontend React' | 'Security & OWASP';
  question: string;
  suggestedAnswer: string;
  examinerFollowUp: string;
  codeSnippet?: string;
}
