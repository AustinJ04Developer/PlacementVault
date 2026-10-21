import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  MessageSquare,
  Bookmark,
  PlusCircle,
  Edit,
  Trash2,
  Eye,
  ThumbsUp,
  Loader2,
  Building2,
} from 'lucide-react';
import { questionService } from '../../services/questionService.js';
import { Question } from '../../types/index.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { useToast } from '../../contexts/ToastContext.js';

export const MyContributions: React.FC = () => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMyQuestions();
  }, [user]);

  const loadMyQuestions = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await questionService.getQuestions({
        author: user.id || user._id,
        limit: 50,
      });
      setQuestions(res.data);
    } catch (err: any) {
      toastError(err.message || 'Failed to load contributions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this submitted question? This action cannot be undone.')) {
      return;
    }

    try {
      await questionService.deleteQuestion(questionId);
      setQuestions(prev => prev.filter(q => q._id !== questionId));
      success('Question deleted successfully.');
    } catch (err: any) {
      toastError(err.message || 'Failed to delete question.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading your contributions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Placement Contributions
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your shared questions and placement experiences.
          </p>
        </div>

        <Link
          to="/submit-question"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Share Another Question</span>
        </Link>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{questions.length}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase">Questions Submitted</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <ThumbsUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">
              {questions.reduce((acc, q) => acc + (q.helpfulVotesCount || 0), 0)}
            </p>
            <p className="text-xs font-semibold text-slate-500 uppercase">Helpful Votes Received</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">
              {questions.reduce((acc, q) => acc + (q.viewCount || 0), 0)}
            </p>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Question Views</p>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Submitted Questions Archive ({questions.length})</h2>

        {questions.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">You haven't contributed any questions yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Share the interview questions or coding challenges you solved during recent placement drives.
            </p>
            <Link
              to="/submit-question"
              className="inline-block mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
            >
              Share Your First Question
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map(q => (
              <div
                key={q._id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {q.company?.name || 'Company'}
                    </span>
                    <span className="text-slate-500">{q.interviewRound} ({q.recruitmentYear})</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-600">{q.difficulty}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">Category: {q.category}</span>
                  </div>

                  <Link to={`/questions/${q._id}`} className="block group">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {q.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span>{q.answersCount || 0} answers</span>
                    <span>•</span>
                    <span>{q.helpfulVotesCount || 0} helpful votes</span>
                    <span>•</span>
                    <span>{q.viewCount || 0} views</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Link
                    to={`/questions/${q._id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
                  >
                    View
                  </Link>
                  <Link
                    to={`/questions/${q._id}/edit`}
                    className="p-1.5 border border-slate-200 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Edit Question"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(q._id)}
                    className="p-1.5 border border-slate-200 text-slate-600 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
