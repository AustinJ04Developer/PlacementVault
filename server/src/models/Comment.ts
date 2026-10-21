import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  targetType: 'question' | 'answer';
  targetId: mongoose.Types.ObjectId;
  question: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  status: 'active' | 'hidden';
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    targetType: {
      type: String,
      enum: ['question', 'answer'],
      required: true,
      index: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    question: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: 2,
      maxlength: 1000,
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

CommentSchema.index({ targetId: 1, createdAt: 1 });

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
