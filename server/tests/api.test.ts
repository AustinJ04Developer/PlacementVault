import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../src/app.js';
import { ENV } from '../src/config/env.js';
import { User } from '../src/models/User.js';
import { Company } from '../src/models/Company.js';
import { Question } from '../src/models/Question.js';

const app = createApp();

describe('PlacementVault API Endpoints', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(ENV.MONGODB_URI);
    }
  });

  afterAll(async () => {
    // Clean up test user created during test run
    await User.deleteMany({ email: 'test.runner.student@placementvault.edu' });
    await Company.deleteMany({ slug: 'test-runner-corp' });
    await Question.deleteMany({ title: 'Test Runner Algorithm Problem' });
    await mongoose.disconnect();
  });

  it('Health Check returns status healthy', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  describe('Authentication Flow', () => {
    let studentToken = '';
    let adminToken = '';

    it('Student can register with college details successfully', async () => {
      // Clean previous test user if any
      await User.deleteMany({ email: 'test.runner.student@placementvault.edu' });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Test Runner Student',
          email: 'test.runner.student@placementvault.edu',
          password: 'StudentPass@123',
          collegeName: 'National Institute of Technology',
          rollNumber: 'NIT-2022-CS-001',
          department: 'Computer Science & Engineering',
          graduationYear: 2026,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('student');
      expect(res.body.user.collegeName).toBe('National Institute of Technology');
      studentToken = res.body.token;
    });

    it('Student can log in successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test.runner.student@placementvault.edu',
          password: 'StudentPass@123',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('student');
    });

    it('Admin can log in successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: ENV.ADMIN_EMAIL,
          password: ENV.ADMIN_PASSWORD,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.role).toBe('admin');
      adminToken = res.body.token;
    });

    it('Student cannot access admin-only dashboard', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Admin can access admin dashboard stats', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toBeDefined();
    });
  });

  describe('Categories Taxonomy', () => {
    it('Fetches standard category list with topics', async () => {
      const res = await request(app).get('/api/v1/categories');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].topics.length).toBeGreaterThan(0);
    });
  });

  describe('Questions and Search', () => {
    let testCompanyId = '';

    beforeAll(async () => {
      const company = await Company.create({
        name: 'Test Runner Corp',
        slug: 'test-runner-corp',
        industry: 'Software',
        totalQuestionsCount: 1,
      });
      testCompanyId = company._id.toString();

      const user = await User.findOne({ email: 'test.runner.student@placementvault.edu' });

      await Question.create({
        title: 'Test Runner Algorithm Problem',
        description: 'Find longest substring without repeating characters in an array.',
        company: company._id,
        recruitmentYear: 2026,
        interviewRound: 'Online Assessment',
        category: 'Coding',
        difficulty: 'Medium',
        tags: ['string', 'sliding-window'],
        author: user!._id,
        status: 'active',
      });
    });

    it('Fetches questions list with pagination', async () => {
      const res = await request(app).get('/api/v1/questions?limit=5');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.meta.total).toBeGreaterThan(0);
    });

    it('Filters questions by category', async () => {
      const res = await request(app).get('/api/v1/questions?category=Coding');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((q: any) => {
        expect(q.category).toBe('Coding');
      });
    });

    it('Searches questions by keyword', async () => {
      const res = await request(app).get('/api/v1/questions?search=Algorithm');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('Companies and Multi-Format Exports', () => {
    it('Lists companies with total questions count', async () => {
      const res = await request(app).get('/api/v1/companies');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
