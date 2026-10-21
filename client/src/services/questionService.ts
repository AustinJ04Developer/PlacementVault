import api from './api.js';
import { Question, Bookmark } from '../types/index.js';

export interface QuestionFilterParams {
  search?: string;
  company?: string;
  drive?: string;
  recruitmentYear?: number;
  interviewRound?: string;
  category?: string;
  difficulty?: string;
  programmingLanguage?: string;
  author?: string;
  sort?: string;
  page?: number;
  limit?: number;
  status?: string;
}

export const questionService = {
  async getQuestions(params?: QuestionFilterParams): Promise<{
    data: Question[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const res = await api.get('/questions', { params });
    return res.data;
  },

  async getQuestionById(id: string): Promise<Question> {
    const res = await api.get(`/questions/${id}`);
    return res.data.data;
  },

  async createQuestion(data: any): Promise<{ data: Question; message: string }> {
    const res = await api.post('/questions', data);
    return res.data;
  },

  async updateQuestion(id: string, data: any): Promise<{ data: Question; message: string }> {
    const res = await api.patch(`/questions/${id}`, data);
    return res.data;
  },

  async deleteQuestion(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/questions/${id}`);
    return res.data;
  },

  async toggleBookmark(id: string): Promise<{ bookmarked: boolean; message: string }> {
    const res = await api.post(`/questions/${id}/bookmark`);
    return res.data;
  },

  async getBookmarks(): Promise<Bookmark[]> {
    const res = await api.get('/bookmarks');
    return res.data.data;
  },

  async reportQuestion(id: string, data: { reason: string; details?: string }): Promise<{ message: string }> {
    const res = await api.post(`/questions/${id}/report`, {
      targetType: 'question',
      targetId: id,
      ...data,
    });
    return res.data;
  },
};
