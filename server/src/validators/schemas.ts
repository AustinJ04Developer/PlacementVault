import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/(?=.*[a-z])(?=.*[A-Z])|(?=.*[0-9])/, 'Password should contain letters and numbers'),
  department: z.string().optional(),
  collegeName: z.string().max(200).optional(),
  rollNumber: z.string().max(50).optional(),
  graduationYear: z.number().int().min(2000).max(2100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  department: z.string().max(100).optional(),
  collegeName: z.string().max(200).optional(),
  rollNumber: z.string().max(50).optional(),
  graduationYear: z.number().int().min(2000).max(2100).optional(),
  bio: z.string().max(500).optional(),
});

export const createQuestionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(300),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  company: z.string().min(1, 'Company is required'),
  drive: z.string().optional(),
  recruitmentYear: z.number().int().min(2000).max(2100),
  interviewRound: z.string().min(1, 'Interview round is required'),
  category: z.string().min(1, 'Category is required'),
  jobRole: z.string().optional(),
  subjectTopic: z.string().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium'),
  tags: z.array(z.string()).default([]),
  experienceNotes: z.string().optional(),
  initialSolution: z
    .object({
      code: z.string().optional(),
      language: z.string().optional(),
      explanation: z.string().optional(),
    })
    .optional(),
});

export const updateQuestionSchema = createQuestionSchema.partial();

export const createAnswerSchema = z.object({
  content: z.string().min(5, 'Answer explanation must be at least 5 characters'),
  codeSnippet: z.string().optional(),
  programmingLanguage: z.string().optional(),
});

export const updateAnswerSchema = createAnswerSchema.partial();

export const createCommentSchema = z.object({
  targetType: z.enum(['question', 'answer']),
  targetId: z.string().min(1, 'Target ID is required'),
  content: z.string().min(2, 'Comment must be at least 2 characters').max(1000),
});

export const createReportSchema = z.object({
  targetType: z.enum(['question', 'answer', 'comment']),
  targetId: z.string().min(1, 'Target ID is required'),
  questionRef: z.string().optional(),
  reason: z.enum([
    'incorrect_answer',
    'duplicate_question',
    'inappropriate_content',
    'spam',
    'confidential_material',
    'other',
  ]),
  details: z.string().max(1000).optional(),
});

export const resolveReportSchema = z.object({
  status: z.enum(['pending', 'resolved', 'dismissed']),
  resolutionAction: z.enum(['none', 'hidden', 'deleted', 'dismissed']).default('none'),
  resolutionNotes: z.string().optional(),
});

export const createCompanySchema = z.object({
  name: z.string().min(2, 'Company name is required').max(120),
  description: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  logoUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateCompanySchema = createCompanySchema.partial();

export const createDriveSchema = z.object({
  company: z.string().min(1, 'Company ID is required'),
  recruitmentYear: z.number().int().min(2000).max(2100),
  driveTitle: z.string().min(2).max(150),
  jobRoles: z.array(z.string()).default(['Software Engineer']),
  rounds: z.array(z.string()).default(['Online Assessment', 'Technical Interview', 'HR Interview']),
  driveDate: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const updateDriveSchema = createDriveSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  topics: z.array(z.string()).default([]),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});
