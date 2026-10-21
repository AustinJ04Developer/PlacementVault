import api from './api.js';
import { Company, PlacementDrive, Category } from '../types/index.js';

export const companyService = {
  async getCompanies(params?: { search?: string; activeOnly?: boolean; page?: number; limit?: number }): Promise<{
    data: Company[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const res = await api.get('/companies', { params });
    return res.data;
  },

  async getCompanyById(id: string): Promise<Company> {
    const res = await api.get(`/companies/${id}`);
    return res.data.data;
  },

  async createCompany(data: Partial<Company>): Promise<{ data: Company; message: string }> {
    const res = await api.post('/companies', data);
    return res.data;
  },

  async updateCompany(id: string, data: Partial<Company>): Promise<{ data: Company; message: string }> {
    const res = await api.patch(`/companies/${id}`, data);
    return res.data;
  },

  async deleteCompany(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/companies/${id}`);
    return res.data;
  },

  async getDrives(params?: { companyId?: string; recruitmentYear?: number }): Promise<PlacementDrive[]> {
    const res = await api.get('/drives', { params });
    return res.data.data;
  },

  async getDriveById(id: string): Promise<PlacementDrive> {
    const res = await api.get(`/drives/${id}`);
    return res.data.data;
  },

  async createDrive(data: any): Promise<{ data: PlacementDrive; message: string }> {
    const res = await api.post('/drives', data);
    return res.data;
  },

  async updateDrive(id: string, data: any): Promise<{ data: PlacementDrive; message: string }> {
    const res = await api.patch(`/drives/${id}`, data);
    return res.data;
  },

  async deleteDrive(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/drives/${id}`);
    return res.data;
  },

  async getCategories(): Promise<Category[]> {
    const res = await api.get('/categories');
    return res.data.data;
  },

  async createCategory(data: Partial<Category>): Promise<{ data: Category; message: string }> {
    const res = await api.post('/categories', data);
    return res.data;
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<{ data: Category; message: string }> {
    const res = await api.patch(`/categories/${id}`, data);
    return res.data;
  },

  async deleteCategory(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },
};
