import { Response } from 'express';
import mongoose from 'mongoose';
import { Comment } from '../models/Comment.js';
import { Question } from '../models/Question.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/auditLogger.js';

export const getComments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const questionId = req.params.questionId as string;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      res.status(400).json({ success: false, message: 'Invalid question ID format.' });
      return;
    }

    const comments = await Comment.find({
      question: questionId,
      status: 'active',
    })
      .populate('author', 'name department graduationYear role')
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      success: true,
      data: comments,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch comments.',
    });
  }
};

export const createComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { questionId } = req.params;
    const { targetType, targetId, content } = req.body;
    const user = req.user!;

    const question = await Question.findById(questionId);
    if (!question) {
      res.status(404).json({ success: false, message: 'Question not found.' });
      return;
    }

    const comment = await Comment.create({
      targetType,
      targetId: new mongoose.Types.ObjectId(targetId),
      question: question._id,
      author: user._id,
      content,
      status: 'active',
    });

    await Question.findByIdAndUpdate(question._id, { $inc: { commentsCount: 1 } });

    const populated = await comment.populate('author', 'name department graduationYear role');

    res.status(201).json({
      success: true,
      message: 'Comment posted successfully.',
      data: populated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to post comment.',
    });
  }
};

export const updateComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const user = req.user!;

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404).json({ success: false, message: 'Comment not found.' });
      return;
    }

    if (comment.author.toString() !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this comment.',
      });
      return;
    }

    comment.content = content;
    await comment.save();

    const populated = await comment.populate('author', 'name department graduationYear role');

    res.json({
      success: true,
      message: 'Comment updated successfully.',
      data: populated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update comment.',
    });
  }
};

export const deleteComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user!;

    const comment = await Comment.findById(id);
    if (!comment) {
      res.status(404).json({ success: false, message: 'Comment not found.' });
      return;
    }

    if (comment.author.toString() !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this comment.',
      });
      return;
    }

    await Promise.all([
      Question.findByIdAndUpdate(comment.question, { $inc: { commentsCount: -1 } }),
      Comment.findByIdAndDelete(id),
    ]);

    if (user.role === 'admin') {
      await logAuditEvent(req, 'DELETE_COMMENT', 'Comment', id);
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete comment.',
    });
  }
};
