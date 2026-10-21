import { Response } from 'express';
import { Category } from '../models/Category.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAuditEvent } from '../middleware/auditLogger.js';

export const getCategories = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 }).lean();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch categories.',
    });
  }
};

export const createCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const category = await Category.create(req.body);
    await logAuditEvent(req, 'CREATE_CATEGORY', 'Category', category._id.toString(), { name: category.name });
    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create category.',
    });
  }
};

export const updateCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }
    await logAuditEvent(req, 'UPDATE_CATEGORY', 'Category', category._id.toString(), req.body);
    res.json({
      success: true,
      message: 'Category updated successfully.',
      data: category,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update category.',
    });
  }
};

export const deleteCategory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      res.status(404).json({ success: false, message: 'Category not found.' });
      return;
    }
    await logAuditEvent(req, 'DELETE_CATEGORY', 'Category', id, { name: category.name });
    res.json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete category.',
    });
  }
};
