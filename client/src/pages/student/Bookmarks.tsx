import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Building2, Trash2, ArrowRight, Loader2, MessageSquare, ThumbsUp } from 'lucide-react';
import { questionService } from '../../services/questionService.js';
import { Bookmark as BookmarkType } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const Bookmarks: React.FC = () => {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setIsLoading(true);
      const data = await questionService.getBookmarks();
      setBookmarks(data);
    } catch (err: any) {
      toastError(err.message || 'Failed to load bookmarks.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveBookmark = async (e: React.MouseEvent, questionId: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await questionService.toggleBookmark(questionId);
      setBookmarks(prev => prev.filter(b => b.question?._id !== questionId));
      success('Question removed from bookmarks.');
    } catch (err: any) {
      toastError(err.message || 'Failed to remove bookmark.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading your saved questions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Bookmark className="w-7 h-7 text-blue-600 fill-blue-600" />
          <span>My Saved Bookmarks</span>
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Quickly access placement questions and solutions you marked for revision.
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Bookmarks Saved</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't bookmarked any placement questions yet. Browse the archive and click "Bookmark" on questions you want to revise.
          </p>
          <Link
            to="/questions"
            className="inline-block mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
          >
            Explore Questions Archive
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map(b => {
            const q = b.question;
            if (!q) return null;

            return (
              <div
                key={b.bookmarkId}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {q.company?.name || 'Company'}
                    </span>
                    <span className="text-slate-500">{q.interviewRound} ({q.recruitmentYear})</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-600">{q.difficulty}</span>
                  </div>

                  <Link to={`/questions/${q._id}`} className="block">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {q.title}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{q.answersCount || 0} answers</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{q.helpfulVotesCount || 0} helpful</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <Link
                    to={`/questions/${q._id}`}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg transition-colors"
                  >
                    View
                  </Link>
                  <button
                    onClick={e => handleRemoveBookmark(e, q._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                    title="Remove from bookmarks"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
