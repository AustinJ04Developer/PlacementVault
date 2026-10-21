import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  HelpCircle,
  Building2,
  TrendingUp,
  FileCode,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Clock,
  ThumbsUp,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { questionService } from '../../services/questionService.js';
import { companyService } from '../../services/companyService.js';
import { Question, Company, Category } from '../../types/index.js';
import { useAuth } from '../../contexts/AuthContext.js';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [recentQuestions, setRecentQuestions] = useState<Question[]>([]);
  const [popularQuestions, setPopularQuestions] = useState<Question[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [recentRes, popularRes, compRes, catRes] = await Promise.all([
          questionService.getQuestions({ limit: 6, sort: 'newest' }),
          questionService.getQuestions({ limit: 4, sort: 'helpful' }),
          companyService.getCompanies({ limit: 8 }),
          companyService.getCategories(),
        ]);

        setRecentQuestions(recentRes.data);
        setTotalQuestionsCount(recentRes.meta.total);
        setPopularQuestions(popularRes.data);
        setCompanies(compRes.data);
        setCategories(catRes);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/questions?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/questions');
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-slate-900 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Campus Placement Knowledge Base</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
            Ace Your Campus Placements with{' '}
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
              Real Drive Questions
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Search authentic interview questions, online assessment problems, aptitude rounds, and peer-verified solutions from top recruiting firms.
          </p>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto pt-2">
            <div className="relative flex items-center shadow-2xl rounded-2xl bg-white p-2">
              <Search className="w-5 h-5 text-slate-600 ml-3 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by question title, company (e.g. TechCorp), or topic (e.g. DP, SQL, B-Tree)..."
                className="w-full px-4 py-2.5 text-slate-900 text-sm font-medium focus:outline-none placeholder-slate-600"
              />
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 flex-shrink-0"
              >
                Search
              </button>
            </div>
          </form>

          {/* Category Quick Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-xs text-slate-400 font-medium mr-1">Popular categories:</span>
            {categories.slice(0, 6).map(cat => (
              <Link
                key={cat._id}
                to={`/questions?category=${encodeURIComponent(cat.name)}`}
                className="text-xs px-3 py-1 rounded-full bg-slate-800/80 hover:bg-blue-900/60 border border-slate-700/60 text-slate-300 hover:text-white transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 -mt-10 relative z-10">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{totalQuestionsCount}</p>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Questions Shared</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{companies.length}</p>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Companies Represented</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">100%</p>
              <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Real Drive Records</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-600 font-bold uppercase tracking-wider">Got a Question?</p>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">Help future batches</p>
            </div>
            <Link
              to="/submit-question"
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 transition-all"
              title="Share a Question"
            >
              <PlusCircle className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Company Quick Shortcuts */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Top Placement Companies
              </h2>
              <p className="text-xs text-slate-600">Browse interview rounds and drive patterns by hiring company</p>
            </div>
            <Link
              to="/companies"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <span>View All Companies</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {companies.map(company => (
              <Link
                key={company._id}
                to={`/companies/${company._id}`}
                className="group p-4 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm overflow-hidden border border-slate-200">
                    {company.logoUrl ? (
                      <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
                    ) : (
                      company.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {company.name}
                    </p>
                    <p className="text-[11px] text-slate-600 truncate">{company.industry || 'Technology'}</p>
                  </div>
                </div>
                <div className="text-[11px] font-semibold text-slate-600 mt-2 pt-2 border-t border-slate-100 flex justify-between">
                  <span>Questions:</span>
                  <span className="font-bold text-slate-900">{company.totalQuestionsCount || 0}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Recently Added vs Popular Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Questions List (2 Columns on Desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Recently Added Questions</span>
                </h2>
                <p className="text-xs text-slate-600">Fresh experiences shared by current placement candidates</p>
              </div>
              <Link
                to="/questions"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Browse All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentQuestions.map(q => {
                let diffBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (q.difficulty === 'Medium') diffBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                if (q.difficulty === 'Hard') diffBadge = 'bg-rose-50 text-rose-700 border-rose-200';

                return (
                  <Link
                    key={q._id}
                    to={`/questions/${q._id}`}
                    className="block p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {q.company?.name || 'Recruiting Company'}
                        </span>
                        <span className="text-slate-600 font-medium">
                          • {q.interviewRound} ({q.recruitmentYear})
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${diffBadge}`}>
                        {q.difficulty}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1.5">
                      {q.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                      {q.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                          <span>{q.answersCount || 0} answers</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5 text-slate-600" />
                          <span>{q.helpfulVotesCount || 0} helpful</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-600">
                        Category: <strong className="text-slate-700">{q.category}</strong>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Popular / Top Helpful Questions Sidebar */}
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span>Most Helpful Questions</span>
              </h2>
              <p className="text-xs text-slate-600">Top-rated placement problems based on student votes</p>
            </div>

            <div className="space-y-3">
              {popularQuestions.map(q => (
                <Link
                  key={q._id}
                  to={`/questions/${q._id}`}
                  className="block p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {q.company?.name}
                    </span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1 text-[11px]">
                      <ThumbsUp className="w-3 h-3" />
                      +{q.helpfulVotesCount || 0}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mt-1">
                    {q.title}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    <span>{q.category}</span>
                    <span>{q.interviewRound}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Contribution Callout Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg space-y-3">
              <h4 className="font-bold text-base">Attended an interview drive recently?</h4>
              <p className="text-xs text-blue-100 leading-relaxed">
                Preserve what you were asked — coding problems, puzzles, SQL queries, or HR questions.
                Future batches depend on your authentic experience.
              </p>
              <Link
                to="/submit-question"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-800 font-bold text-xs rounded-xl hover:bg-blue-50 transition-colors shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Share a Placement Question</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
