import { Response } from 'express';
import { PlacementDrive } from '../models/PlacementDrive.js';
import { Question } from '../models/Question.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/auditLogger.js';

export const getDrives = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { companyId, recruitmentYear, activeOnly } = req.query;
    const filter: any = {};

    if (activeOnly !== 'false') {
      filter.isActive = true;
    }

    if (companyId) {
      filter.company = companyId;
    }

    if (recruitmentYear) {
      filter.recruitmentYear = parseInt(recruitmentYear as string, 10);
    }

    const drives = await PlacementDrive.find(filter)
      .populate('company', 'name slug logoUrl industry')
      .sort({ recruitmentYear: -1, createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: drives,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch placement drives.',
    });
  }
};

export const getDriveById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const drive = await PlacementDrive.findById(id).populate('company');
    if (!drive) {
      res.status(404).json({
        success: false,
        message: 'Placement drive not found.',
      });
      return;
    }

    const questions = await Question.find({ drive: drive._id, status: 'active' })
      .select('title category difficulty interviewRound recruitmentYear answersCount viewCount createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        ...drive.toObject(),
        questions,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch drive details.',
    });
  }
};

export const createDrive = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const drive = await PlacementDrive.create(req.body);
    await logAuditEvent(req, 'CREATE_DRIVE', 'PlacementDrive', drive._id.toString(), {
      driveTitle: drive.driveTitle,
      company: drive.company,
    });

    const populated = await drive.populate('company', 'name slug');

    res.status(201).json({
      success: true,
      message: 'Placement drive created successfully.',
      data: populated,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create placement drive.',
    });
  }
};

export const updateDrive = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const drive = await PlacementDrive.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('company', 'name slug');

    if (!drive) {
      res.status(404).json({
        success: false,
        message: 'Placement drive not found.',
      });
      return;
    }

    await logAuditEvent(req, 'UPDATE_DRIVE', 'PlacementDrive', drive._id.toString(), req.body);

    res.json({
      success: true,
      message: 'Placement drive updated successfully.',
      data: drive,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update placement drive.',
    });
  }
};

export const deleteDrive = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const drive = await PlacementDrive.findById(id);

    if (!drive) {
      res.status(404).json({
        success: false,
        message: 'Placement drive not found.',
      });
      return;
    }

    const linkedQuestions = await Question.countDocuments({ drive: drive._id });
    if (linkedQuestions > 0) {
      drive.isActive = false;
      await drive.save();
      await logAuditEvent(req, 'DEACTIVATE_DRIVE', 'PlacementDrive', drive._id.toString(), {
        reason: 'Deactivated due to linked questions',
      });

      res.json({
        success: true,
        message: 'Placement drive deactivated to preserve linked question records.',
        data: drive,
      });
      return;
    }

    await PlacementDrive.findByIdAndDelete(id);
    await logAuditEvent(req, 'DELETE_DRIVE', 'PlacementDrive', id as string);

    res.json({
      success: true,
      message: 'Placement drive deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete placement drive.',
    });
  }
};
