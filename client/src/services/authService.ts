import api from './api.js';
import { User } from '../types/index.js';

export const authService = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    collegeName?: string;
    rollNumber?: string;
    department?: string;
    graduationYear?: number;
  }): Promise<{ user: User; token: string; message: string }> {
    const res = await api.post('/auth/register', data);
    if (res.data.token) {
      localStorage.setItem('pv_token', res.data.token);
    }
    return res.data;
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string; message: string }> {
    const res = await api.post('/auth/login', data);
    if (res.data.token) {
      localStorage.setItem('pv_token', res.data.token);
    }
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('pv_token');
    }
  },

  async getMe(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data.user;
  },

  async updateProfile(data: {
    name?: string;
    collegeName?: string;
    rollNumber?: string;
    department?: string;
    graduationYear?: number;
    bio?: string;
  }): Promise<{ user: User; message: string }> {
    const res = await api.patch('/auth/profile', data);
    return res.data;
  },
};
