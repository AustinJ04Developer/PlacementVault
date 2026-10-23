import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  HelpCircle,
  Search,
  CheckCircle,
  EyeOff,
  Eye,
  Trash2,
  Building2,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { questionService } from '../../services/questionService.js';
import { adminService } from '../../services/adminService.js';
import { Question } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const AdminQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    loadQuestions();
  }, [search, statusFilter]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const res = await questionService.getQuestions({
        search: search || undefined,
        status: statusFilter,
        limit: 50,
      });
      setQuestions(Array.isArray(res?.data) ? res.data : []);
    } catch (err: any) {
      toastError(err.message || 'Failed to load questions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleReviewed = async (qId: string) => {
    try {
      const res = await adminService.toggleQuestionReviewed(qId);
      setQuestions(prev =>
        prev.map(q => (q._id === qId ? { ...q, isReviewed: res.isReviewed } : q))
      );
      success(res.message);
    } catch (err: any) {
      toastError(err.message || 'Failed to toggle review status.');
    }
  };

  const handleToggleVisibility = async (qId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'hidden' : 'active';
    try {
      await questionService.updateQuestion(qId, { status: newStatus });
      setQuestions(prev =>
        prev.map(q => (q._id === qId ? { ...q, status: newStatus } : q))
      );
      success(`Question is now ${newStatus}.`);
    } catch (err: any) {
      toastError(err.message || 'Failed to update question status.');
    }
  };

  const handleDelete = async (qId: string) => {
    if (!confirm('Are you sure you want to permanently delete this question?')) return;
    try {
      await questionService.deleteQuestion(qId);
      setQuestions(prev => prev.filter(q => q._id !== qId));
      success('Question deleted.');
    } catch (err: any) {
      toastError(err.message || 'Failed to delete question.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            <span>Repository Questions Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit, verify review status, hide, or remove question submissions
          </p>
        </div>

        <Link
          to="/submit-question"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm self-start sm:self-auto"
        >
          + Add New Question
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search questions by title or author..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-sm"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="hidden">Hidden Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No questions found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-5 py-3.5">Title & Company</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Round / Year</th>
                  <th className="px-4 py-3.5">Contributor</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Review</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questions.map(q => (
                  <tr key={q._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 max-w-xs">
                      <Link
                        to={`/questions/${q._id}`}
                        className="font-bold text-slate-900 hover:text-blue-600 truncate block"
                      >
                        {q.title}
                      </Link>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        {q.company?.name || 'Company'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-medium text-slate-700">
                      {q.category}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      <div>{q.interviewRound}</div>
                      <div className="text-[10px] text-slate-400">{q.recruitmentYear}</div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {q.author?.name || 'Student'}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        q.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {q.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleReviewed(q._id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                          q.isReviewed
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {q.isReviewed ? 'Reviewed' : 'Unreviewed'}
                      </button>
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleToggleVisibility(q._id, q.status)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                        title={q.status === 'active' ? 'Hide Question' : 'Restore Question'}
                      >
                        {q.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleDelete(q._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
