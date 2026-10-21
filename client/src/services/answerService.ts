import api from './api.js';
import { Answer, Comment } from '../types/index.js';

export const answerService = {
  async getAnswersForQuestion(questionId: string): Promise<Answer[]> {
    const res = await api.get(`/questions/${questionId}/answers`);
    return res.data.data;
  },

  async createAnswer(
    questionId: string,
    data: { content: string; codeSnippet?: string; programmingLanguage?: string }
  ): Promise<{ data: Answer; message: string }> {
    const res = await api.post(`/questions/${questionId}/answers`, data);
    return res.data;
  },

  async updateAnswer(
    id: string,
    data: { content?: string; codeSnippet?: string; programmingLanguage?: string }
  ): Promise<{ data: Answer; message: string }> {
    const res = await api.patch(`/answers/${id}`, data);
    return res.data;
  },

  async deleteAnswer(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/answers/${id}`);
    return res.data;
  },

  async toggleVote(id: string): Promise<{ hasVoted: boolean; helpfulCount: number; message: string }> {
    const res = await api.post(`/answers/${id}/vote`);
    return res.data;
  },

  async getComments(questionId: string): Promise<Comment[]> {
    const res = await api.get(`/questions/${questionId}/comments`);
    return res.data.data;
  },

  async createComment(
    questionId: string,
    data: { targetType: 'question' | 'answer'; targetId: string; content: string }
  ): Promise<{ data: Comment; message: string }> {
    const res = await api.post(`/questions/${questionId}/comments`, data);
    return res.data;
  },

  async deleteComment(id: string): Promise<{ message: string }> {
    const res = await api.delete(`/comments/${id}`);
    return res.data;
  },
};
