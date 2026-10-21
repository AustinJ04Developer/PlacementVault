import { Response } from 'express';
import { Company } from '../models/Company.js';
import { PlacementDrive } from '../models/PlacementDrive.js';
import { Question } from '../models/Question.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/auditLogger.js';

export const getCompanies = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, activeOnly, limit, page } = req.query;
    const filter: any = {};

    if (activeOnly !== 'false') {
      filter.isActive = true;
    }

    if (search && typeof search === 'string' && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { industry: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const queryLimit = limit ? Math.min(parseInt(limit as string, 10), 100) : 50;
    const queryPage = page ? Math.max(parseInt(page as string, 10), 1) : 1;
    const skip = (queryPage - 1) * queryLimit;

    const [companies, total] = await Promise.all([
      Company.find(filter)
        .sort({ totalQuestionsCount: -1, name: 1 })
        .skip(skip)
        .limit(queryLimit)
        .lean(),
      Company.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: companies,
      meta: {
        total,
        page: queryPage,
        limit: queryLimit,
        totalPages: Math.ceil(total / queryLimit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch companies.',
    });
  }
};

export const getCompanyById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);
    if (!company) {
      res.status(404).json({
        success: false,
        message: 'Company not found.',
      });
      return;
    }

    const [drives, questionsCount] = await Promise.all([
      PlacementDrive.find({ company: company._id, isActive: true }).sort({ recruitmentYear: -1 }),
      Question.countDocuments({ company: company._id, status: 'active' }),
    ]);

    res.json({
      success: true,
      data: {
        ...company.toObject(),
        drives,
        totalQuestionsCount: questionsCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch company details.',
    });
  }
};

export const createCompany = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, description, website, industry, logoUrl, isActive } = req.body;

    const existing = await Company.findOne({ name: { $regex: `^${name.trim()}$`, $options: 'i' } });
    if (existing) {
      res.status(409).json({
        success: false,
        message: 'A company with this name already exists.',
      });
      return;
    }

    const company = await Company.create({
      name: name.trim(),
      description,
      website,
      industry,
      logoUrl,
      isActive: isActive !== undefined ? isActive : true,
    });

    await logAuditEvent(req, 'CREATE_COMPANY', 'Company', company._id.toString(), { name: company.name });

    res.status(201).json({
      success: true,
      message: 'Company created successfully.',
      data: company,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create company.',
    });
  }
};

export const updateCompany = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const company = await Company.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    if (!company) {
      res.status(404).json({
        success: false,
        message: 'Company not found.',
      });
      return;
    }

    await logAuditEvent(req, 'UPDATE_COMPANY', 'Company', company._id.toString(), updateData);

    res.json({
      success: true,
      message: 'Company updated successfully.',
      data: company,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update company.',
    });
  }
};

export const deleteCompany = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);
    if (!company) {
      res.status(404).json({
        success: false,
        message: 'Company not found.',
      });
      return;
    }

    // Soft toggle or check if questions exist
    const questionsCount = await Question.countDocuments({ company: company._id });
    if (questionsCount > 0) {
      // Toggle inactive instead of breaking question references
      company.isActive = false;
      await company.save();
      await logAuditEvent(req, 'DEACTIVATE_COMPANY', 'Company', company._id.toString(), {
        reason: 'Deactivated due to existing question records',
      });

      res.json({
        success: true,
        message: 'Company deactivated successfully. Existing questions have been preserved.',
        data: company,
      });
      return;
    }

    await Company.findByIdAndDelete(id);
    await logAuditEvent(req, 'DELETE_COMPANY', 'Company', id as string);

    res.json({
      success: true,
      message: 'Company deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete company.',
    });
  }
};
