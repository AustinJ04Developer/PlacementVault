import { Response } from 'express';
import mongoose from 'mongoose';
import { Answer } from '../models/Answer.js';
import { Question } from '../models/Question.js';
import { Vote } from '../models/Vote.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/auditLogger.js';

export const getAnswersForQuestion = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const questionId = req.params.questionId as string;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      res.status(400).json({ success: false, message: 'Invalid question ID format.' });
      return;
    }

    const answers = await Answer.find({ question: questionId, status: 'active' })
      .populate('author', 'name department graduationYear role')
      .sort({ helpfulCount: -1, createdAt: 1 })
      .lean();

    // Check voting status if authenticated
    let userVotedAnswerIds = new Set<string>();
    if (req.user) {
      const userVotes = await Vote.find({
        user: req.user._id,
        answer: { $in: answers.map(a => a._id) },
      }).select('answer');
      userVotedAnswerIds = new Set(userVotes.map(v => v.answer.toString()));
    }

    const answersWithVoteStatus = answers.map(answer => ({
      ...answer,
      hasVoted: userVotedAnswerIds.has(answer._id.toString()),
    }));

    res.json({
      success: true,
      data: answersWithVoteStatus,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch answers.',
    });
  }
};

export const createAnswer = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { questionId } = req.params;
    const { content, codeSnippet, programmingLanguage } = req.body;
    const user = req.user!;

    const question = await Question.findById(questionId);
    if (!question) {
      res.status(404).json({ success: false, message: 'Question not found.' });
      return;
    }

    const answer = await Answer.create({
      question: question._id,
      author: user._id,
      content,
      codeSnippet: codeSnippet || '',
      programmingLanguage: programmingLanguage || '',
      helpfulCount: 0,
      status: 'active',
    });

    // Increment question answersCount
    await Question.findByIdAndUpdate(question._id, { $inc: { answersCount: 1 } });

    const populated = await answer.populate('author', 'name department graduationYear role');

    res.status(201).json({
      success: true,
      message: 'Answer submitted successfully! Thank you for contributing.',
      data: {
        ...populated.toObject(),
        hasVoted: false,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit answer.',
    });
  }
};

export const updateAnswer = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const answer = await Answer.findById(id);
    if (!answer) {
      res.status(404).json({ success: false, message: 'Answer not found.' });
      return;
    }

    if (answer.author.toString() !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this answer.',
      });
      return;
    }

    const { content, codeSnippet, programmingLanguage } = req.body;
    if (content) answer.content = content;
    if (codeSnippet !== undefined) answer.codeSnippet = codeSnippet;
    if (programmingLanguage !== undefined) answer.programmingLanguage = programmingLanguage;

    await answer.save();

    const populated = await answer.populate('author', 'name department graduationYear role');

    res.json({
      success: true,
      message: 'Answer updated successfully.',
      data: populated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update answer.',
    });
  }
};

export const deleteAnswer = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = req.user!;

    const answer = await Answer.findById(id);
    if (!answer) {
      res.status(404).json({ success: false, message: 'Answer not found.' });
      return;
    }

    if (answer.author.toString() !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this answer.',
      });
      return;
    }

    // Decrement question answers count and remove votes
    await Promise.all([
      Question.findByIdAndUpdate(answer.question, { $inc: { answersCount: -1 } }),
      Vote.deleteMany({ answer: answer._id }),
      Answer.findByIdAndDelete(id),
    ]);

    if (user.role === 'admin') {
      await logAuditEvent(req, 'DELETE_ANSWER', 'Answer', id);
    }

    res.json({
      success: true,
      message: 'Answer deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete answer.',
    });
  }
};

export const toggleVote = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const answer = await Answer.findById(id);
    if (!answer) {
      res.status(404).json({ success: false, message: 'Answer not found.' });
      return;
    }

    const existingVote = await Vote.findOne({
      user: user._id,
      answer: answer._id,
    });

    if (existingVote) {
      // Remove vote
      await Vote.findByIdAndDelete(existingVote._id);
      const updatedAnswer = await Answer.findByIdAndUpdate(
        answer._id,
        { $inc: { helpfulCount: -1 } },
        { new: true }
      );
      await Question.findByIdAndUpdate(answer.question, { $inc: { helpfulVotesCount: -1 } });

      res.json({
        success: true,
        hasVoted: false,
        helpfulCount: Math.max(updatedAnswer?.helpfulCount || 0, 0),
        message: 'Vote removed.',
      });
    } else {
      // Add vote
      await Vote.create({
        user: user._id,
        answer: answer._id,
      });
      const updatedAnswer = await Answer.findByIdAndUpdate(
        answer._id,
        { $inc: { helpfulCount: 1 } },
        { new: true }
      );
      await Question.findByIdAndUpdate(answer.question, { $inc: { helpfulVotesCount: 1 } });

      res.json({
        success: true,
        hasVoted: true,
        helpfulCount: updatedAnswer?.helpfulCount || 1,
        message: 'Marked answer as helpful!',
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process vote.',
    });
  }
};
