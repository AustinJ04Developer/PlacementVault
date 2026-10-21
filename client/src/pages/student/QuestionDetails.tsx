import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Layers,
  User,
  ThumbsUp,
  Bookmark,
  Share2,
  Flag,
  MessageSquare,
  Code,
  Copy,
  Check,
  Send,
  Trash2,
  Edit,
  ArrowLeft,
  Loader2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { questionService } from '../../services/questionService.js';
import { answerService } from '../../services/answerService.js';
import { Question, Answer, Comment as CommentType } from '../../types/index.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { useToast } from '../../contexts/ToastContext.js';

export const QuestionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New Answer Form State
  const [answerContent, setAnswerContent] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [programmingLanguage, setProgrammingLanguage] = useState('Java');
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // New Comment Form State
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Report Modal State
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('incorrect_answer');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  // Copy code feedback state
  const [copiedSnippetIndex, setCopiedSnippetIndex] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadQuestionData = async () => {
      try {
        setIsLoading(true);
        const [qData, ansData, commentsData] = await Promise.all([
          questionService.getQuestionById(id),
          answerService.getAnswersForQuestion(id),
          answerService.getComments(id),
        ]);

        setQuestion(qData);
        setIsBookmarked(!!qData.isBookmarked);
        setAnswers(ansData);
        setComments(commentsData);
      } catch (err: any) {
        toastError(err.message || 'Failed to load question details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestionData();
  }, [id]);

  const handleToggleBookmark = async () => {
    if (!isAuthenticated) {
      toastError('Please sign in to save questions to your bookmarks.');
      navigate('/login');
      return;
    }

    if (!question) return;

    try {
      const res = await questionService.toggleBookmark(question._id);
      setIsBookmarked(res.bookmarked);
      success(res.message);
    } catch (err: any) {
      toastError(err.message || 'Failed to update bookmark.');
    }
  };

  const handleVoteAnswer = async (answerId: string) => {
    if (!isAuthenticated) {
      toastError('Please sign in to mark answers as helpful.');
      navigate('/login');
      return;
    }

    try {
      const res = await answerService.toggleVote(answerId);
      setAnswers(prev =>
        prev.map(a =>
          a._id === answerId ? { ...a, hasVoted: res.hasVoted, helpfulCount: res.helpfulCount } : a
        )
      );
      success(res.message);
    } catch (err: any) {
      toastError(err.message || 'Failed to vote on answer.');
    }
  };

  const handleAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toastError('Please log in to submit answers.');
      navigate('/login');
      return;
    }

    if (!id || !answerContent.trim()) return;

    setIsSubmittingAnswer(true);
    try {
      const res = await answerService.createAnswer(id, {
        content: answerContent.trim(),
        codeSnippet: codeSnippet.trim() || undefined,
        programmingLanguage: codeSnippet.trim() ? programmingLanguage : undefined,
      });

      setAnswers(prev => [res.data, ...prev]);
      setAnswerContent('');
      setCodeSnippet('');
      success('Your answer has been submitted and shared with fellow students!');
    } catch (err: any) {
      toastError(err.message || 'Failed to post answer.');
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm('Are you sure you want to delete this answer?')) return;

    try {
      await answerService.deleteAnswer(answerId);
      setAnswers(prev => prev.filter(a => a._id !== answerId));
      success('Answer deleted.');
    } catch (err: any) {
      toastError(err.message || 'Failed to delete answer.');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toastError('Please sign in to join the discussion.');
      navigate('/login');
      return;
    }

    if (!id || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const res = await answerService.createComment(id, {
        targetType: 'question',
        targetId: id,
        content: newComment.trim(),
      });

      setComments(prev => [...prev, res.data]);
      setNewComment('');
      success('Comment posted.');
    } catch (err: any) {
      toastError(err.message || 'Failed to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await answerService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
      success('Comment deleted.');
    } catch (err: any) {
      toastError(err.message || 'Failed to delete comment.');
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toastError('Please sign in to submit content reports.');
      navigate('/login');
      return;
    }

    if (!id) return;

    setIsSubmittingReport(true);
    try {
      await questionService.reportQuestion(id, {
        reason: reportReason,
        details: reportDetails.trim(),
      });
      setReportModalOpen(false);
      setReportDetails('');
      success('Thank you. Your report has been submitted to placement moderators for review.');
    } catch (err: any) {
      toastError(err.message || 'Failed to submit report.');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleCopyCode = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetIndex(identifier);
    setTimeout(() => setCopiedSnippetIndex(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading placement question details...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Question Not Found</h2>
        <p className="text-sm text-slate-600">This question may have been removed or moderated.</p>
        <Link to="/questions" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">
          Back to Questions Archive
        </Link>
      </div>
    );
  }

  let diffBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (question.difficulty === 'Medium') diffBadge = 'bg-amber-50 text-amber-700 border-amber-200';
  if (question.difficulty === 'Hard') diffBadge = 'bg-rose-50 text-rose-700 border-rose-200';

  const isAuthor = user && question.author && (user.id === question.author._id || user._id === question.author._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button and Actions Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Archive</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Bookmark Button */}
          <button
            onClick={handleToggleBookmark}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              isBookmarked
                ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-blue-600 text-blue-600' : 'text-slate-500'}`} />
            <span>{isBookmarked ? 'Saved in Bookmarks' : 'Bookmark Question'}</span>
          </button>

          {/* Export to Word Doc */}
          <a
            href={`/api/v1/questions/${question._id}/export-docx`}
            download
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm"
            title="Download this question formatted as a Microsoft Word document (.docx)"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Export Docx</span>
          </a>

          {/* Report Button */}
          <button
            onClick={() => setReportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:text-rose-600 hover:border-rose-200 transition-colors"
            title="Report inaccurate or inappropriate content"
          >
            <Flag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report</span>
          </button>

          {/* Edit Button if Author or Admin */}
          {(isAuthor || isAdmin) && (
            <Link
              to={`/questions/${question._id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Grid: Question Body (Col 1-2) + Sidebar (Col 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Question Card */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            {/* Metadata Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Link
                to={`/companies/${question.company?._id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{question.company?.name}</span>
              </Link>

              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                {question.interviewRound} ({question.recruitmentYear})
              </span>

              {question.jobRole && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                  {question.jobRole}
                </span>
              )}

              <span className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border ${diffBadge}`}>
                {question.difficulty}
              </span>

              {question.isReviewed && (
                <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold uppercase tracking-wider">
                  Verified Review
                </span>
              )}
            </div>

            {/* Question Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              {question.title}
            </h1>

            {/* Submitter & Date info */}
            <div className="flex items-center gap-3 text-xs text-slate-600 pb-4 border-b border-slate-100">
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                {question.author?.name ? question.author.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <span className="font-semibold text-slate-800">
                  Shared by {question.author?.name || 'Student Contributor'}
                </span>
                {question.author?.department && (
                  <span className="text-slate-600 ml-1.5">
                    ({question.author.department})
                  </span>
                )}
                <span className="text-slate-600 ml-2">
                  • {new Date(question.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                </span>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="prose prose-slate max-w-none text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {question.description}
            </div>

            {/* Experience Notes if available */}
            {question.experienceNotes && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs sm:text-sm space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-950">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Candidate Drive Experience & Advice:</span>
                </p>
                <p className="leading-relaxed text-amber-900 whitespace-pre-wrap">
                  {question.experienceNotes}
                </p>
              </div>
            )}

            {/* Tags */}
            {question.tags && question.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                {question.tags.map(t => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Solutions & Answers Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>Community Answers & Explanations ({answers.length})</span>
                </h2>
                <p className="text-xs text-slate-600">Peer solutions and code algorithms posted by students</p>
              </div>
            </div>

            {/* Answers List */}
            {answers.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2">
                <HelpCircle className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No Answers Submitted Yet</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Be the first to provide a tested solution, code snippet, or explanation for this placement question!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {answers.map((ans, idx) => (
                  <div
                    key={ans._id}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                          {ans.author?.name ? ans.author.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900">{ans.author?.name}</span>
                          {ans.author?.department && (
                            <span className="text-slate-600 ml-1">({ans.author.department})</span>
                          )}
                          <span className="text-slate-600 ml-2">
                            • {new Date(ans.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {ans.isReviewed && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Reviewed Solution
                          </span>
                        )}

                        {/* Author/Admin delete */}
                        {user && (user.id === ans.author?._id || user._id === ans.author?._id || isAdmin) && (
                          <button
                            onClick={() => handleDeleteAnswer(ans._id)}
                            className="text-slate-600 hover:text-rose-600 p-1"
                            title="Delete Answer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Answer text */}
                    <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {ans.content}
                    </div>

                    {/* Code Snippet Box */}
                    {ans.codeSnippet && ans.codeSnippet.trim() && (
                      <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 text-xs">
                        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400 font-mono">
                          <span className="font-bold text-amber-400">
                            {ans.programmingLanguage || 'Code'}
                          </span>
                          <button
                            onClick={() => handleCopyCode(ans.codeSnippet!, `ans-${idx}`)}
                            className="flex items-center gap-1 text-[11px] hover:text-white transition-colors"
                          >
                            {copiedSnippetIndex === `ans-${idx}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                        <pre className="p-4 overflow-x-auto font-mono text-xs leading-relaxed text-slate-200">
                          <code>{ans.codeSnippet}</code>
                        </pre>
                      </div>
                    )}

                    {/* Helpful Vote Button */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleVoteAnswer(ans._id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                          ans.hasVoted
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${ans.hasVoted ? 'fill-blue-600 text-blue-600' : 'text-slate-500'}`} />
                        <span>Helpful ({ans.helpfulCount || 0})</span>
                      </button>

                      <span className="text-[11px] text-slate-600">
                        {ans.helpfulCount > 0 ? `${ans.helpfulCount} students marked this helpful` : 'Was this helpful?'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Answer Submission Form */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-600" />
                <span>Submit Your Solution or Explanation</span>
              </h3>
              <p className="text-xs text-slate-600">
                Help fellow students prepare by detailing the optimal approach, time/space complexity, or edge cases.
              </p>

              <form onSubmit={handleAnswerSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Explanation & Approach <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={answerContent}
                    onChange={e => setAnswerContent(e.target.value)}
                    placeholder="Explain step-by-step how to solve this question, algorithmic intuition, time complexity O(N), etc..."
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Programming Language (Optional)
                    </label>
                    <select
                      value={programmingLanguage}
                      onChange={e => setProgrammingLanguage(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Java">Java</option>
                      <option value="C++">C++</option>
                      <option value="Python">Python</option>
                      <option value="JavaScript">JavaScript</option>
                      <option value="TypeScript">TypeScript</option>
                      <option value="SQL">SQL</option>
                      <option value="C">C</option>
                      <option value="Plain Text">Plain Text / Pseudocode</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Code Snippet (Optional)
                  </label>
                  <textarea
                    rows={6}
                    value={codeSnippet}
                    onChange={e => setCodeSnippet(e.target.value)}
                    placeholder="// Paste clean, working solution code here..."
                    className="w-full p-3 font-mono text-xs bg-slate-950 text-slate-100 rounded-xl border border-slate-800 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingAnswer}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
                >
                  {isSubmittingAnswer ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Post Answer</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* Comments and Discussion Thread */}
          <section className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-700" />
              <span>Questions & Discussion ({comments.length})</span>
            </h3>

            {/* Comments List */}
            <div className="space-y-3">
              {comments.map(c => (
                <div key={c._id} className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{c.author?.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                      {user && (user.id === c.author?._id || user._id === c.author?._id || isAdmin) && (
                        <button
                          onClick={() => handleDeleteComment(c._id)}
                          className="text-slate-600 hover:text-rose-600"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>

            {/* Post Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2 pt-2">
              <input
                type="text"
                required
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Ask a quick question or clarification about this recruitment round..."
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={isSubmittingComment}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
              >
                Comment
              </button>
            </form>
          </section>
        </div>

        {/* Right Sidebar: Placement Drive Details & Related Questions */}
        <aside className="space-y-6">
          {/* Company & Drive Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Recruitment Drive Info</h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 overflow-hidden border border-slate-200">
                {question.company?.logoUrl ? (
                  <img src={question.company.logoUrl} alt={question.company.name} className="w-full h-full object-cover" />
                ) : (
                  question.company?.name.charAt(0)
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{question.company?.name}</h3>
                <p className="text-xs text-slate-600">{question.company?.industry || 'Technology'}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-600">Recruitment Year:</span>
                <span className="font-bold">{question.recruitmentYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Interview Round:</span>
                <span className="font-bold">{question.interviewRound}</span>
              </div>
              {question.jobRole && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Job Role:</span>
                  <span className="font-bold">{question.jobRole}</span>
                </div>
              )}
              {question.subjectTopic && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Topic:</span>
                  <span className="font-bold">{question.subjectTopic}</span>
                </div>
              )}
            </div>

            {question.company?.website && (
              <a
                href={question.company.website}
                target="_blank"
                rel="noreferrer"
                className="block text-center py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-blue-600 hover:bg-slate-50 transition-colors"
              >
                Visit Company Career Site &rarr;
              </a>
            )}
          </div>

          {/* Related Placement Questions */}
          {question.relatedQuestions && question.relatedQuestions.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">Related Questions</h4>
              <div className="space-y-3">
                {question.relatedQuestions.map(rq => (
                  <Link
                    key={rq._id}
                    to={`/questions/${rq._id}`}
                    className="block p-3 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
                  >
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {rq.title}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2">
                      <span>{rq.interviewRound}</span>
                      <span className="font-semibold text-slate-700">{rq.difficulty}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-600" />
                <span>Report Content to Placement Cell</span>
              </h3>
              <button onClick={() => setReportModalOpen(false)} className="text-slate-600 hover:text-slate-700">
                &times;
              </button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Reason for Report
                </label>
                <select
                  value={reportReason}
                  onChange={e => setReportReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="incorrect_answer">Incorrect answer or faulty solution</option>
                  <option value="duplicate_question">Duplicate of an existing question</option>
                  <option value="inappropriate_content">Inappropriate or abusive language</option>
                  <option value="confidential_material">Potentially confidential company NDA material</option>
                  <option value="spam">Spam or irrelevant advertising</option>
                  <option value="other">Other issue</option>
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Additional Details
                </label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={e => setReportDetails(e.target.value)}
                  placeholder="Provide context for moderators to review this report..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-500/20"
                >
                  {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
