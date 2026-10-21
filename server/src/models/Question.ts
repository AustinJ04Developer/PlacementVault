import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  title: string;
  description: string;
  company: mongoose.Types.ObjectId;
  drive?: mongoose.Types.ObjectId;
  recruitmentYear: number;
  interviewRound: string;
  category: string;
  jobRole?: string;
  subjectTopic?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  author: mongoose.Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    title: {
      type: String,
      required: [true, 'Question title is required'],
      trim: true,
      minlength: 5,
      maxlength: 300,
    },
    description: {
      type: String,
      required: [true, 'Question description is required'],
      trim: true,
      minlength: 10,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required'],
      index: true,
    },
    drive: {
      type: Schema.Types.ObjectId,
      ref: 'PlacementDrive',
      index: true,
    },
    recruitmentYear: {
      type: Number,
      required: [true, 'Recruitment year is required'],
      min: 2000,
      max: 2100,
      index: true,
    },
    interviewRound: {
      type: String,
      required: [true, 'Interview round is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Question category is required'],
      trim: true,
      index: true,
    },
    jobRole: {
      type: String,
      trim: true,
      default: '',
    },
    subjectTopic: {
      type: String,
      trim: true,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'hidden', 'under_review'],
      default: 'active',
      index: true,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    helpfulVotesCount: {
      type: Number,
      default: 0,
    },
    answersCount: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    experienceNotes: {
      type: String,
      default: '',
    },
    initialSolution: {
      code: { type: String, default: '' },
      language: { type: String, default: '' },
      explanation: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

// Full text search index
QuestionSchema.index(
  {
    title: 'text',
    description: 'text',
    subjectTopic: 'text',
    tags: 'text',
    jobRole: 'text',
  },
  {
    weights: {
      title: 10,
      subjectTopic: 5,
      tags: 5,
      description: 2,
      jobRole: 1,
    },
    name: 'QuestionTextIndex',
  }
);

export const Question = mongoose.model<IQuestion>('Question', QuestionSchema);
