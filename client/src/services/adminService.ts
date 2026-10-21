import api from './api.js';
import { DashboardStats, User, Report, AuditLog, DuplicatePair } from '../types/index.js';

export const adminService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await api.get('/admin/dashboard');
    return res.data.data;
  },

  async getUsers(params?: { search?: string; role?: string; status?: string; page?: number; limit?: number }): Promise<{
    data: User[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<{ user: User; message: string }> {
    const res = await api.patch(`/admin/users/${userId}/status`, { status });
    return res.data;
  },

  async getReports(params?: { status?: string; targetType?: string; page?: number }): Promise<{
    data: Report[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const res = await api.get('/admin/reports', { params });
    return res.data;
  },

  async resolveReport(
    reportId: string,
    data: { status: 'resolved' | 'dismissed'; resolutionAction: string; resolutionNotes?: string }
  ): Promise<{ message: string }> {
    const res = await api.patch(`/admin/reports/${reportId}`, data);
    return res.data;
  },

  async getAuditLogs(params?: { action?: string; entityType?: string; page?: number; limit?: number }): Promise<{
    data: AuditLog[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const res = await api.get('/admin/audit-logs', { params });
    return res.data;
  },

  async getDuplicates(): Promise<DuplicatePair[]> {
    const res = await api.get('/admin/duplicates');
    return res.data.data;
  },

  async toggleQuestionReviewed(id: string): Promise<{ message: string; isReviewed: boolean }> {
    const res = await api.patch(`/admin/questions/${id}/review`);
    return res.data;
  },

  async toggleAnswerReviewed(id: string): Promise<{ message: string; isReviewed: boolean }> {
    const res = await api.patch(`/admin/answers/${id}/review`);
    return res.data;
  },

  getExportUrl(entity: 'questions' | 'students' | 'companies'): string {
    const token = localStorage.getItem('pv_token');
    return `/api/v1/admin/export/${entity}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },

  getExportDocxUrl(entity: 'questions' | 'students' | 'companies'): string {
    const token = localStorage.getItem('pv_token');
    return `/api/v1/admin/export-docx/${entity}${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },
};
