import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
  reporter: mongoose.Types.ObjectId;
  targetType: 'question' | 'answer' | 'comment';
  targetId: mongoose.Types.ObjectId;
  questionRef?: mongoose.Types.ObjectId;
  reason: 'incorrect_answer' | 'duplicate_question' | 'inappropriate_content' | 'spam' | 'confidential_material' | 'other';
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedBy?: mongoose.Types.ObjectId;
  resolutionAction?: 'none' | 'hidden' | 'deleted' | 'dismissed';
  resolutionNotes?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['question', 'answer', 'comment'],
      required: true,
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    questionRef: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
    },
    reason: {
      type: String,
      enum: [
        'incorrect_answer',
        'duplicate_question',
        'inappropriate_content',
        'spam',
        'confidential_material',
        'other',
      ],
      required: true,
      index: true,
    },
    details: {
      type: String,
      trim: true,
      default: '',
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    resolutionAction: {
      type: String,
      enum: ['none', 'hidden', 'deleted', 'dismissed'],
      default: 'none',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index to prevent duplicate open reports on same target by same user
ReportSchema.index({ reporter: 1, targetId: 1, status: 1 });

export const Report = mongoose.model<IReport>('Report', ReportSchema);
