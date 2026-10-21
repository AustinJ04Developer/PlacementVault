import mongoose, { Document, Schema } from 'mongoose';

export interface IAnswer extends Document {
  question: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  codeSnippet?: string;
  programmingLanguage?: string;
  helpfulCount: number;
  isReviewed: boolean;
  status: 'active' | 'hidden';
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    question: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: [true, 'Question reference is required'],
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author reference is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Answer content is required'],
      trim: true,
      minlength: 5,
    },
    codeSnippet: {
      type: String,
      default: '',
    },
    programmingLanguage: {
      type: String,
      default: '',
    },
    helpfulCount: {
      type: Number,
      default: 0,
      index: true,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'hidden'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

AnswerSchema.index({ question: 1, helpfulCount: -1 });

export const Answer = mongoose.model<IAnswer>('Answer', AnswerSchema);
