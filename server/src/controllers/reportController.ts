import { Response } from 'express';
import mongoose from 'mongoose';
import { Report } from '../models/Report.js';
import { Question } from '../models/Question.js';
import { Answer } from '../models/Answer.js';
import { Comment } from '../models/Comment.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/auditLogger.js';

export const createReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { targetType, targetId, questionRef, reason, details } = req.body;
    const user = req.user!;

    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      res.status(400).json({ success: false, message: 'Invalid target ID.' });
      return;
    }

    // Check if user already submitted a pending report on this item
    const existing = await Report.findOne({
      reporter: user._id,
      targetId: new mongoose.Types.ObjectId(targetId),
      status: 'pending',
    });

    if (existing) {
      res.status(400).json({
        success: false,
        message: 'You have already submitted a pending report for this item. Our moderation team is reviewing it.',
      });
      return;
    }

    const report = await Report.create({
      reporter: user._id,
      targetType,
      targetId: new mongoose.Types.ObjectId(targetId),
      questionRef: questionRef ? new mongoose.Types.ObjectId(questionRef) : undefined,
      reason,
      details: details || '',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Thank you for helping keep PlacementVault reliable.',
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit report.',
    });
  }
};

export const getReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, targetType, reason, page = '1', limit = '20' } = req.query;
    const filter: any = {};

    if (status && status !== 'all') {
      filter.status = status;
    }
    if (targetType) {
      filter.targetType = targetType;
    }
    if (reason) {
      filter.reason = reason;
    }

    const currentPage = Math.max(parseInt(page as string, 10), 1);
    const pageLimit = Math.min(Math.max(parseInt(limit as string, 10), 1), 50);
    const skip = (currentPage - 1) * pageLimit;

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .populate('reporter', 'name email department')
        .populate('resolvedBy', 'name email')
        .populate('questionRef', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .lean(),
      Report.countDocuments(filter),
    ]);

    // Enrich reports with current target content preview
    const enrichedReports = await Promise.all(
      reports.map(async r => {
        let targetContent: any = null;
        if (r.targetType === 'question') {
          targetContent = await Question.findById(r.targetId)
            .select('title description status author')
            .populate('author', 'name')
            .lean();
        } else if (r.targetType === 'answer') {
          targetContent = await Answer.findById(r.targetId)
            .select('content codeSnippet status author question')
            .populate('author', 'name')
            .lean();
        } else if (r.targetType === 'comment') {
          targetContent = await Comment.findById(r.targetId)
            .select('content status author question')
            .populate('author', 'name')
            .lean();
        }
        return {
          ...r,
          targetContent,
        };
      })
    );

    res.json({
      success: true,
      data: enrichedReports,
      meta: {
        total,
        page: currentPage,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch moderation reports.',
    });
  }
};

export const resolveReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, resolutionAction, resolutionNotes } = req.body;
    const admin = req.user!;

    const report = await Report.findById(id);
    if (!report) {
      res.status(404).json({ success: false, message: 'Report not found.' });
      return;
    }

    // Apply moderation action to target entity
    if (resolutionAction === 'hidden') {
      if (report.targetType === 'question') {
        await Question.findByIdAndUpdate(report.targetId, { status: 'hidden' });
      } else if (report.targetType === 'answer') {
        await Answer.findByIdAndUpdate(report.targetId, { status: 'hidden' });
      } else if (report.targetType === 'comment') {
        await Comment.findByIdAndUpdate(report.targetId, { status: 'hidden' });
      }
    } else if (resolutionAction === 'deleted') {
      if (report.targetType === 'question') {
        await Question.findByIdAndDelete(report.targetId);
      } else if (report.targetType === 'answer') {
        await Answer.findByIdAndDelete(report.targetId);
      } else if (report.targetType === 'comment') {
        await Comment.findByIdAndDelete(report.targetId);
      }
    }

    report.status = status;
    report.resolutionAction = resolutionAction;
    report.resolutionNotes = resolutionNotes || '';
    report.resolvedBy = admin._id;
    report.resolvedAt = new Date();
    await report.save();

    await logAuditEvent(req, 'RESOLVE_REPORT', 'Report', report._id.toString(), {
      action: resolutionAction,
      targetType: report.targetType,
      targetId: report.targetId.toString(),
      status,
    });

    res.json({
      success: true,
      message: `Report has been ${status} with action: ${resolutionAction}.`,
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to resolve report.',
    });
  }
};
