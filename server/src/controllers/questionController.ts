import { Response } from 'express';
import mongoose from 'mongoose';
import { Question, IQuestion } from '../models/Question.js';
import { Company } from '../models/Company.js';
import { Answer } from '../models/Answer.js';
import { Bookmark } from '../models/Bookmark.js';
import { Report } from '../models/Report.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/auditLogger.js';
import { generateQuestionsDocx } from '../utils/docxExporter.js';

export const getQuestions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      search,
      company,
      drive,
      recruitmentYear,
      interviewRound,
      category,
      difficulty,
      programmingLanguage,
      author,
      sort = 'newest',
      page = '1',
      limit = '10',
      status,
    } = req.query;

    const filter: any = {};

    // By default, only show active questions unless user is admin requesting specific status
    if (req.user?.role === 'admin' && status) {
      if (status !== 'all') {
        filter.status = status;
      }
    } else {
      filter.status = 'active';
    }

    if (company && typeof company === 'string') {
      if (mongoose.Types.ObjectId.isValid(company)) {
        filter.company = company;
      } else {
        const foundCompany = await Company.findOne({ slug: company });
        if (foundCompany) {
          filter.company = foundCompany._id;
        }
      }
    }

    if (drive && typeof drive === 'string' && mongoose.Types.ObjectId.isValid(drive)) {
      filter.drive = drive;
    }

    if (recruitmentYear) {
      filter.recruitmentYear = parseInt(recruitmentYear as string, 10);
    }

    if (interviewRound && typeof interviewRound === 'string') {
      filter.interviewRound = interviewRound;
    }

    if (category && typeof category === 'string') {
      filter.category = category;
    }

    if (difficulty && typeof difficulty === 'string') {
      filter.difficulty = difficulty;
    }

    if (author && typeof author === 'string' && mongoose.Types.ObjectId.isValid(author)) {
      filter.author = author;
    }

    if (programmingLanguage && typeof programmingLanguage === 'string') {
      filter['initialSolution.language'] = { $regex: new RegExp(`^${programmingLanguage}$`, 'i') };
    }

    // Text search or regex
    if (search && typeof search === 'string' && search.trim()) {
      const term = search.trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
        { subjectTopic: { $regex: term, $options: 'i' } },
        { jobRole: { $regex: term, $options: 'i' } },
        { tags: { $in: [new RegExp(term, 'i')] } },
      ];
    }

    // Sorting
    let sortOptions: any = { createdAt: -1 };
    if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'views') {
      sortOptions = { viewCount: -1, createdAt: -1 };
    } else if (sort === 'helpful') {
      sortOptions = { helpfulVotesCount: -1, createdAt: -1 };
    } else if (sort === 'updated') {
      sortOptions = { updatedAt: -1 };
    } else if (sort === 'answers') {
      sortOptions = { answersCount: -1, createdAt: -1 };
    }

    const currentPage = Math.max(parseInt(page as string, 10), 1);
    const pageLimit = Math.min(Math.max(parseInt(limit as string, 10), 1), 50);
    const skip = (currentPage - 1) * pageLimit;

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .populate('company', 'name slug logoUrl industry')
        .populate('drive', 'driveTitle recruitmentYear')
        .populate('author', 'name department')
        .sort(sortOptions)
        .skip(skip)
        .limit(pageLimit)
        .lean(),
      Question.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: questions,
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
      message: error.message || 'Failed to fetch questions.',
    });
  }
};

export const getQuestionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid question ID format.' });
      return;
    }

    // Increment view count atomically
    const question = await Question.findByIdAndUpdate(
      id,
      { $inc: { viewCount: 1 } },
      { new: true }
    )
      .populate('company', 'name slug logoUrl website industry')
      .populate('drive', 'driveTitle recruitmentYear jobRoles rounds')
      .populate('author', 'name department graduationYear role');

    if (!question) {
      res.status(404).json({ success: false, message: 'Question not found.' });
      return;
    }

    // Non-admin cannot view hidden/under_review questions unless they are the author
    if (
      question.status !== 'active' &&
      req.user?.role !== 'admin' &&
      req.user?._id.toString() !== question.author._id.toString()
    ) {
      res.status(403).json({
        success: false,
        message: 'This question is currently under moderation review.',
      });
      return;
    }

    // Check if current user has bookmarked this question
    let isBookmarked = false;
    if (req.user) {
      const bookmark = await Bookmark.findOne({
        user: req.user._id,
        question: question._id,
      });
      isBookmarked = !!bookmark;
    }

    // Find related questions (same company or same category, excluding this question)
    const relatedQuestions = await Question.find({
      _id: { $ne: question._id },
      status: 'active',
      $or: [{ company: question.company._id }, { category: question.category }],
    })
      .select('title category difficulty interviewRound recruitmentYear answersCount viewCount company')
      .populate('company', 'name slug logoUrl')
      .limit(4)
      .lean();

    res.json({
      success: true,
      data: {
        ...question.toObject(),
        isBookmarked,
        relatedQuestions,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch question details.',
    });
  }
};

export const createQuestion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const {
      title,
      description,
      company,
      drive,
      recruitmentYear,
      interviewRound,
      category,
      jobRole,
      subjectTopic,
      difficulty,
      tags,
      experienceNotes,
      initialSolution,
    } = req.body;

    // Check if company exists
    const companyDoc = await Company.findById(company);
    if (!companyDoc) {
      res.status(404).json({ success: false, message: 'Referenced company does not exist.' });
      return;
    }

    const hasInitialSolution =
      initialSolution &&
      (initialSolution.code?.trim() || initialSolution.explanation?.trim());

    const question = await Question.create({
      title,
      description,
      company: companyDoc._id,
      drive: drive || undefined,
      recruitmentYear,
      interviewRound,
      category,
      jobRole: jobRole || '',
      subjectTopic: subjectTopic || '',
      difficulty: difficulty || 'Medium',
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim().toLowerCase()).filter(Boolean) : [],
      experienceNotes: experienceNotes || '',
      initialSolution: hasInitialSolution ? initialSolution : undefined,
      author: user._id,
      status: 'active',
      answersCount: hasInitialSolution ? 1 : 0,
    });

    // If an initial solution was provided with an explanation or code snippet,
    // persist it as an Answer record so other students can upvote and discuss it!
    if (hasInitialSolution) {
      await Answer.create({
        question: question._id,
        author: user._id,
        content: initialSolution.explanation || 'Initial solution provided by the contributor.',
        codeSnippet: initialSolution.code || '',
        programmingLanguage: initialSolution.language || 'Plain Text',
        helpfulCount: 0,
        status: 'active',
      });
    }

    // Increment company question counter
    await Company.findByIdAndUpdate(companyDoc._id, { $inc: { totalQuestionsCount: 1 } });

    const populated = await question.populate([
      { path: 'company', select: 'name slug logoUrl' },
      { path: 'author', select: 'name department' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Question submitted successfully! Thank you for sharing your placement experience.',
      data: populated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit question.',
    });
  }
};

export const updateQuestion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const question = await Question.findById(id);
    if (!question) {
      res.status(404).json({ success: false, message: 'Question not found.' });
      return;
    }

    // Verify ownership or admin privilege
    if (question.author.toString() !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this question.',
      });
      return;
    }

    const allowedFields = [
      'title',
      'description',
      'interviewRound',
      'category',
      'jobRole',
      'subjectTopic',
      'difficulty',
      'tags',
      'experienceNotes',
      'recruitmentYear',
      'drive',
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        (question as any)[field] = req.body[field];
      }
    });

    if (user.role === 'admin' && req.body.status) {
      question.status = req.body.status;
    }

    await question.save();

    if (user.role === 'admin') {
      await logAuditEvent(req, 'UPDATE_QUESTION', 'Question', question._id.toString(), {
        title: question.title,
      });
    }

    const updated = await question.populate([
      { path: 'company', select: 'name slug logoUrl' },
      { path: 'author', select: 'name department' },
    ]);

    res.json({
      success: true,
      message: 'Question updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update question.',
    });
  }
};

export const deleteQuestion = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const question = await Question.findById(id);
    if (!question) {
      res.status(404).json({ success: false, message: 'Question not found.' });
      return;
    }

    // Verify ownership or admin
    if (question.author.toString() !== user._id.toString() && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this question.',
      });
      return;
    }

    // Decrement company question counter
    await Company.findByIdAndUpdate(question.company, { $inc: { totalQuestionsCount: -1 } });

    // Clean up related bookmarks and answers
    await Promise.all([
      Bookmark.deleteMany({ question: question._id }),
      Answer.deleteMany({ question: question._id }),
      Question.findByIdAndDelete(id),
    ]);

    if (user.role === 'admin') {
      await logAuditEvent(req, 'DELETE_QUESTION', 'Question', id as string, { title: question.title });
    }

    res.json({
      success: true,
      message: 'Question and associated resources deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete question.',
    });
  }
};

export const toggleBookmark = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const question = await Question.findById(id);
    if (!question) {
      res.status(404).json({ success: false, message: 'Question not found.' });
      return;
    }

    const existingBookmark = await Bookmark.findOne({
      user: user._id,
      question: question._id,
    });

    if (existingBookmark) {
      await Bookmark.findByIdAndDelete(existingBookmark._id);
      res.json({
        success: true,
        bookmarked: false,
        message: 'Removed from bookmarks.',
      });
    } else {
      await Bookmark.create({
        user: user._id,
        question: question._id,
      });
      res.json({
        success: true,
        bookmarked: true,
        message: 'Saved to bookmarks!',
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update bookmark.',
    });
  }
};

export const exportQuestionDocx = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id)
      .populate('company', 'name')
      .populate('author', 'name email department collegeName')
      .lean();

    if (!question) {
      res.status(404).json({ success: false, message: 'Question not found.' });
      return;
    }

    const buffer = await generateQuestionsDocx([question]);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    const sanitizedTitle = question.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.docx"`);
    res.send(buffer);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate Word document for this question.',
    });
  }
};
