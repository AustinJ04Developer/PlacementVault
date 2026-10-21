import { Response } from 'express';
import { User, IUser } from '../models/User.js';
import { Question } from '../models/Question.js';
import { Answer } from '../models/Answer.js';
import { Bookmark } from '../models/Bookmark.js';
import { generateToken } from '../utils/token.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ENV } from '../config/env.js';

export const register = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, department, collegeName, rollNumber, graduationYear } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
      return;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      role: 'student',
      department: department || '',
      collegeName: collegeName || '',
      rollNumber: rollNumber || '',
      graduationYear,
      status: 'active',
    });

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to PlacementVault.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        collegeName: user.collegeName,
        rollNumber: user.rollNumber,
        graduationYear: user.graduationYear,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed due to a server error.',
    });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact the administrator.',
      });
      return;
    }

    const token = generateToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        graduationYear: user.graduationYear,
        bio: user.bio,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed due to a server error.',
    });
  }
};

export const logout = async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as IUser;

    // Fetch live user contribution metrics
    const [questionsCount, answersCount, bookmarksCount] = await Promise.all([
      Question.countDocuments({ author: user._id, status: { $ne: 'hidden' } }),
      Answer.countDocuments({ author: user._id, status: 'active' }),
      Bookmark.countDocuments({ user: user._id }),
    ]);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        collegeName: user.collegeName,
        rollNumber: user.rollNumber,
        graduationYear: user.graduationYear,
        bio: user.bio,
        status: user.status,
        createdAt: user.createdAt,
        stats: {
          questionsCount,
          answersCount,
          bookmarksCount,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch user profile.',
    });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user as IUser;
    const { name, department, collegeName, rollNumber, graduationYear, bio } = req.body;

    if (name) user.name = name;
    if (department !== undefined) user.department = department;
    if (collegeName !== undefined) user.collegeName = collegeName;
    if (rollNumber !== undefined) user.rollNumber = rollNumber;
    if (graduationYear !== undefined) user.graduationYear = graduationYear;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        collegeName: user.collegeName,
        rollNumber: user.rollNumber,
        graduationYear: user.graduationYear,
        bio: user.bio,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile.',
    });
  }
};
