import mongoose, { Document, Schema } from 'mongoose';

export interface IVote extends Document {
  user: mongoose.Types.ObjectId;
  answer: mongoose.Types.ObjectId;
  createdAt: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    answer: {
      type: Schema.Types.ObjectId,
      ref: 'Answer',
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Prevent duplicate votes by the same user on the same answer
VoteSchema.index({ user: 1, answer: 1 }, { unique: true });

export const Vote = mongoose.model<IVote>('Vote', VoteSchema);
