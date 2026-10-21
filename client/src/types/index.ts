export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  collegeName?: string;
  rollNumber?: string;
  department?: string;
  graduationYear?: number;
  status: 'active' | 'suspended';
  bio?: string;
  createdAt: string;
  stats?: {
    questionsCount: number;
    answersCount: number;
    bookmarksCount: number;
  };
}

export interface Company {
  _id: string;
  name: string;
  slug: string;
  description: string;
  website?: string;
  industry?: string;
  logoUrl?: string;
  isActive: boolean;
  totalQuestionsCount: number;
  drives?: PlacementDrive[];
  createdAt: string;
  updatedAt: string;
}

export interface PlacementDrive {
  _id: string;
  company: Company | string;
  recruitmentYear: number;
  driveTitle: string;
  jobRoles: string[];
  rounds: string[];
  driveDate?: string;
  description?: string;
  notes?: string;
  isActive: boolean;
  questions?: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  topics: string[];
  order: number;
  isActive: boolean;
}

export interface Question {
  _id: string;
  title: string;
  description: string;
  company: Company;
  drive?: PlacementDrive;
  recruitmentYear: number;
  interviewRound: string;
  category: string;
  jobRole?: string;
  subjectTopic?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  author: {
    _id: string;
    name: string;
    department?: string;
    graduationYear?: number;
    role?: string;
  };
  status: 'active' | 'hidden' | 'under_review';
  isReviewed: boolean;
  viewCount: number;
  helpfulVotesCount: number;
  answersCount: number;
  commentsCount: number;
  experienceNotes?: string;
  initialSolution?: {
    code?: string;
    language?: string;
    explanation?: string;
  };
  isBookmarked?: boolean;
  relatedQuestions?: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface Answer {
  _id: string;
  question: string | Question;
  author: {
    _id: string;
    name: string;
    department?: string;
    graduationYear?: number;
    role?: string;
  };
  content: string;
  codeSnippet?: string;
  programmingLanguage?: string;
  helpfulCount: number;
  isReviewed: boolean;
  status: 'active' | 'hidden';
  hasVoted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  targetType: 'question' | 'answer';
  targetId: string;
  question: string;
  author: {
    _id: string;
    name: string;
    department?: string;
    role?: string;
  };
  content: string;
  status: 'active' | 'hidden';
  createdAt: string;
}

export interface Bookmark {
  bookmarkId: string;
  createdAt: string;
  question: Question;
}

export interface Report {
  _id: string;
  reporter: {
    _id: string;
    name: string;
    email: string;
    department?: string;
  };
  targetType: 'question' | 'answer' | 'comment';
  targetId: string;
  questionRef?: {
    _id: string;
    title: string;
  };
  reason: 'incorrect_answer' | 'duplicate_question' | 'inappropriate_content' | 'spam' | 'confidential_material' | 'other';
  details?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  resolutionAction?: 'none' | 'hidden' | 'deleted' | 'dismissed';
  resolutionNotes?: string;
  resolvedAt?: string;
  targetContent?: any;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  actor: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardStats {
  summary: {
    totalStudents: number;
    totalCompanies: number;
    totalDrives: number;
    totalQuestions: number;
    totalAnswers: number;
    pendingReportsCount: number;
  };
  questionsByCategory: Array<{ category: string; count: number }>;
  mostViewedQuestions: Question[];
  recentQuestions: Question[];
  recentAnswers: Answer[];
  timelineData: Array<{ name: string; questions: number }>;
}

export interface DuplicatePair {
  similarity: number;
  questionA: Question;
  questionB: Question;
  reason: string;
}
