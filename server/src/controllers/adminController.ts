import { Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { PlacementDrive } from '../models/PlacementDrive.js';
import { Question } from '../models/Question.js';
import { Answer } from '../models/Answer.js';
import { Report } from '../models/Report.js';
import { AuditLog } from '../models/AuditLog.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/auditLogger.js';
import { jsonToCsv } from '../utils/csvExporter.js';
import {
  generateQuestionsDocx,
  generateStudentsDocx,
  generateCompaniesDocx,
} from '../utils/docxExporter.js';

export const getDashboardStats = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const [
      totalStudents,
      totalCompanies,
      totalDrives,
      totalQuestions,
      totalAnswers,
      pendingReportsCount,
      questionsByCategory,
      mostViewedQuestions,
      recentQuestions,
      recentAnswers,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Company.countDocuments({ isActive: true }),
      PlacementDrive.countDocuments({ isActive: true }),
      Question.countDocuments({ status: { $ne: 'hidden' } }),
      Answer.countDocuments({ status: { $ne: 'hidden' } }),
      Report.countDocuments({ status: 'pending' }),
      Question.aggregate([
        { $match: { status: 'active' } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Question.find({ status: 'active' })
        .select('title viewCount answersCount helpfulVotesCount company difficulty category')
        .populate('company', 'name')
        .sort({ viewCount: -1 })
        .limit(5)
        .lean(),
      Question.find({ status: { $ne: 'hidden' } })
        .select('title company author recruitmentYear category createdAt')
        .populate('company', 'name')
        .populate('author', 'name department')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Answer.find({ status: 'active' })
        .select('content author question helpfulCount createdAt')
        .populate('author', 'name department')
        .populate('question', 'title')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
    ]);

    // Aggregate monthly contributions for chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyAggregation = await Question.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          questions: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const timelineData = monthlyAggregation.map(item => ({
      name: `${months[item._id.month - 1]} ${item._id.year}`,
      questions: item.questions,
    }));

    res.json({
      success: true,
      data: {
        summary: {
          totalStudents,
          totalCompanies,
          totalDrives,
          totalQuestions,
          totalAnswers,
          pendingReportsCount,
        },
        questionsByCategory: questionsByCategory.map(c => ({
          category: c._id,
          count: c.count,
        })),
        mostViewedQuestions,
        recentQuestions,
        recentAnswers,
        timelineData,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dashboard statistics.',
    });
  }
};

export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, role, status, page = '1', limit = '20' } = req.query;
    const filter: any = {};

    if (role && role !== 'all') {
      filter.role = role;
    }
    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && typeof search === 'string' && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { department: { $regex: search.trim(), $options: 'i' } },
        { collegeName: { $regex: search.trim(), $options: 'i' } },
        { rollNumber: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const currentPage = Math.max(parseInt(page as string, 10), 1);
    const pageLimit = Math.min(Math.max(parseInt(limit as string, 10), 1), 50);
    const skip = (currentPage - 1) * pageLimit;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .lean(),
      User.countDocuments(filter),
    ]);

    // Attach student contribution counts
    const enrichedUsers = await Promise.all(
      users.map(async u => {
        const [questionsCount, answersCount] = await Promise.all([
          Question.countDocuments({ author: u._id }),
          Answer.countDocuments({ author: u._id }),
        ]);
        return {
          ...u,
          questionsCount,
          answersCount,
        };
      })
    );

    res.json({
      success: true,
      data: enrichedUsers,
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
      message: error.message || 'Failed to fetch users.',
    });
  }
};

export const updateUserStatus = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const admin = req.user!;

    if (!['active', 'suspended'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status value.' });
      return;
    }

    if (id === admin._id.toString()) {
      res.status(400).json({ success: false, message: 'You cannot alter your own account status.' });
      return;
    }

    const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    await logAuditEvent(req, 'UPDATE_USER_STATUS', 'User', id, { newStatus: status });

    res.json({
      success: true,
      message: `User status changed to ${status}.`,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update user status.',
    });
  }
};

export const getAuditLogs = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { action, entityType, page = '1', limit = '30' } = req.query;
    const filter: any = {};

    if (action) filter.action = action;
    if (entityType) filter.entityType = entityType;

    const currentPage = Math.max(parseInt(page as string, 10), 1);
    const pageLimit = Math.min(Math.max(parseInt(limit as string, 10), 1), 50);
    const skip = (currentPage - 1) * pageLimit;

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('actor', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: logs,
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
      message: error.message || 'Failed to fetch audit logs.',
    });
  }
};

export const exportCsv = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { entity } = req.params;

    if (req.query.format === 'docx') {
      return exportDocx(req, res);
    }

    if (entity === 'questions') {
      const questions = await Question.find()
        .populate('company', 'name')
        .populate('author', 'name email')
        .lean();

      const csvData = questions.map(q => ({
        id: q._id.toString(),
        title: q.title,
        company: (q.company as any)?.name || 'N/A',
        category: q.category,
        interviewRound: q.interviewRound,
        recruitmentYear: q.recruitmentYear,
        difficulty: q.difficulty,
        author: (q.author as any)?.name || 'N/A',
        authorEmail: (q.author as any)?.email || 'N/A',
        views: q.viewCount,
        answers: q.answersCount,
        helpfulVotes: q.helpfulVotesCount,
        status: q.status,
        createdAt: q.createdAt.toISOString(),
      }));

      const headers = [
        { key: 'id', label: 'Question ID' },
        { key: 'title', label: 'Title' },
        { key: 'company', label: 'Company' },
        { key: 'category', label: 'Category' },
        { key: 'interviewRound', label: 'Interview Round' },
        { key: 'recruitmentYear', label: 'Recruitment Year' },
        { key: 'difficulty', label: 'Difficulty' },
        { key: 'author', label: 'Contributor' },
        { key: 'authorEmail', label: 'Contributor Email' },
        { key: 'views', label: 'Views' },
        { key: 'answers', label: 'Answers Count' },
        { key: 'helpfulVotes', label: 'Helpful Votes' },
        { key: 'status', label: 'Status' },
        { key: 'createdAt', label: 'Created At' },
      ];

      const csv = jsonToCsv(headers, csvData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="placementvault-questions.csv"');
      res.send(csv);
      return;
    }

    if (entity === 'students' || entity === 'users') {
      const users = await User.find({ role: 'student' }).select('-password').lean();
      const csvData = users.map(u => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        collegeName: (u as any).collegeName || 'N/A',
        rollNumber: (u as any).rollNumber || 'N/A',
        department: u.department || 'N/A',
        graduationYear: u.graduationYear || 'N/A',
        status: u.status,
        createdAt: u.createdAt.toISOString(),
      }));

      const headers = [
        { key: 'id', label: 'User ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'collegeName', label: 'College / University' },
        { key: 'rollNumber', label: 'Roll Number / USN' },
        { key: 'department', label: 'Department' },
        { key: 'graduationYear', label: 'Graduation Year' },
        { key: 'status', label: 'Account Status' },
        { key: 'createdAt', label: 'Registered Date' },
      ];

      const csv = jsonToCsv(headers, csvData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="placementvault-students.csv"');
      res.send(csv);
      return;
    }

    if (entity === 'companies') {
      const companies = await Company.find().lean();
      const csvData = companies.map(c => ({
        id: c._id.toString(),
        name: c.name,
        industry: c.industry || 'N/A',
        website: c.website || 'N/A',
        questionsCount: c.totalQuestionsCount,
        isActive: c.isActive ? 'Active' : 'Inactive',
        createdAt: c.createdAt.toISOString(),
      }));

      const headers = [
        { key: 'id', label: 'Company ID' },
        { key: 'name', label: 'Company Name' },
        { key: 'industry', label: 'Industry' },
        { key: 'website', label: 'Website' },
        { key: 'questionsCount', label: 'Total Questions' },
        { key: 'isActive', label: 'Status' },
        { key: 'createdAt', label: 'Added Date' },
      ];

      const csv = jsonToCsv(headers, csvData);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="placementvault-companies.csv"');
      res.send(csv);
      return;
    }

    res.status(400).json({ success: false, message: 'Invalid export entity type requested.' });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate CSV export.',
    });
  }
};

export const exportDocx = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { entity } = req.params;

    if (entity === 'questions') {
      const questions = await Question.find()
        .populate('company', 'name')
        .populate('author', 'name email department collegeName')
        .lean();

      const buffer = await generateQuestionsDocx(questions);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      res.setHeader('Content-Disposition', 'attachment; filename="placementvault-questions.docx"');
      res.send(buffer);
      return;
    }

    if (entity === 'students' || entity === 'users') {
      const users = await User.find({ role: 'student' }).select('-password').lean();
      const buffer = await generateStudentsDocx(users);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      res.setHeader('Content-Disposition', 'attachment; filename="placementvault-students.docx"');
      res.send(buffer);
      return;
    }

    if (entity === 'companies') {
      const companies = await Company.find().lean();
      const buffer = await generateCompaniesDocx(companies);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      res.setHeader('Content-Disposition', 'attachment; filename="placementvault-companies.docx"');
      res.send(buffer);
      return;
    }

    res.status(400).json({ success: false, message: 'Invalid export entity type requested.' });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate Word document export.',
    });
  }
};

export const detectDuplicates = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    // Algorithmic duplicate question detector:
    // Compares word-token set overlap (Jaccard similarity) for questions in the same company
    const questions = await Question.find({ status: { $ne: 'hidden' } })
      .select('title company category difficulty createdAt')
      .populate('company', 'name')
      .lean();

    const stopWords = new Set(['the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'is', 'are', 'what', 'how', 'why', 'write', 'program', 'algorithm']);

    const tokenize = (str: string): Set<string> => {
      const words = str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w));
      return new Set(words);
    };

    const duplicatePairs: Array<{
      similarity: number;
      questionA: any;
      questionB: any;
      reason: string;
    }> = [];

    for (let i = 0; i < questions.length; i++) {
      const qA = questions[i];
      const tokensA = tokenize(qA.title);
      if (tokensA.size === 0) continue;

      for (let j = i + 1; j < questions.length; j++) {
        const qB = questions[j];
        // Questions belong to same company or have identical category
        const sameCompany =
          qA.company && qB.company && (qA.company as any)._id?.toString() === (qB.company as any)._id?.toString();

        const tokensB = tokenize(qB.title);
        if (tokensB.size === 0) continue;

        // Calculate Jaccard similarity: intersection / union
        let intersectionCount = 0;
        tokensA.forEach(token => {
          if (tokensB.has(token)) intersectionCount++;
        });

        const unionSize = new Set([...tokensA, ...tokensB]).size;
        const jaccard = unionSize > 0 ? intersectionCount / unionSize : 0;

        // If similarity is above 0.55 or titles are nearly identical
        if (jaccard >= 0.55 || (sameCompany && jaccard >= 0.45)) {
          duplicatePairs.push({
            similarity: Math.round(jaccard * 100),
            questionA: qA,
            questionB: qB,
            reason: sameCompany
              ? `High token overlap (${Math.round(jaccard * 100)}%) within same company (${(qA.company as any).name})`
              : `High cross-company token similarity (${Math.round(jaccard * 100)}%)`,
          });
        }
      }
    }

    duplicatePairs.sort((a, b) => b.similarity - a.similarity);

    res.json({
      success: true,
      count: duplicatePairs.length,
      data: duplicatePairs.slice(0, 50),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to detect duplicates.',
    });
  }
};

export const toggleQuestionReviewed = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const question = await Question.findById(id);
    if (!question) {
      res.status(404).json({ success: false, message: 'Question not found.' });
      return;
    }

    question.isReviewed = !question.isReviewed;
    await question.save();

    await logAuditEvent(req, 'TOGGLE_QUESTION_REVIEWED', 'Question', id, {
      isReviewed: question.isReviewed,
    });

    res.json({
      success: true,
      message: `Question marked as ${question.isReviewed ? 'reviewed' : 'unreviewed'}.`,
      data: question,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update review status.',
    });
  }
};

export const toggleAnswerReviewed = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const answer = await Answer.findById(id);
    if (!answer) {
      res.status(404).json({ success: false, message: 'Answer not found.' });
      return;
    }

    answer.isReviewed = !answer.isReviewed;
    await answer.save();

    await logAuditEvent(req, 'TOGGLE_ANSWER_REVIEWED', 'Answer', id, {
      isReviewed: answer.isReviewed,
    });

    res.json({
      success: true,
      message: `Answer marked as ${answer.isReviewed ? 'reviewed' : 'unreviewed'}.`,
      data: answer,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update answer review status.',
    });
  }
};
