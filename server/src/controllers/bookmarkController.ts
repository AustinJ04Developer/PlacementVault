import { Response } from 'express';
import { Bookmark } from '../models/Bookmark.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const getBookmarks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;

    const bookmarks = await Bookmark.find({ user: user._id })
      .populate({
        path: 'question',
        populate: [
          { path: 'company', select: 'name slug logoUrl industry' },
          { path: 'author', select: 'name department' },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out questions that may have been hard-deleted
    const validBookmarks = bookmarks
      .filter(b => b.question != null)
      .map(b => ({
        bookmarkId: b._id,
        createdAt: b.createdAt,
        question: b.question,
      }));

    res.json({
      success: true,
      data: validBookmarks,
      count: validBookmarks.length,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch bookmarks.',
    });
  }
};
