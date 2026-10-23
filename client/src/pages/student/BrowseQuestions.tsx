import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  PlusCircle,
  HelpCircle,
  Building2,
  Calendar,
  Layers,
  ThumbsUp,
  MessageSquare,
  Eye,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Code,
} from 'lucide-react';
import { questionService } from '../../services/questionService.js';
import { companyService } from '../../services/companyService.js';
import { Question, Company, Category } from '../../types/index.js';

export const BrowseQuestions: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state synced with URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCompany, setSelectedCompany] = useState(searchParams.get('company') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') || '');
  const [selectedRound, setSelectedRound] = useState(searchParams.get('round') || '');
  const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || '');
  const [selectedLanguage, setSelectedLanguage] = useState(searchParams.get('language') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  const [questions, setQuestions] = useState<Question[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load dropdown choices
  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        const [compRes, catRes] = await Promise.all([
          companyService.getCompanies({ limit: 100 }),
          companyService.getCategories(),
        ]);
        setCompanies(Array.isArray(compRes?.data) ? compRes.data : []);
        setCategories(Array.isArray(catRes) ? catRes : []);
      } catch (err) {
        console.error('Failed to load companies/categories:', err);
      }
    };
    loadDropdowns();
  }, []);

  // Sync state from URL when URL changes
  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setSelectedCompany(searchParams.get('company') || '');
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedDifficulty(searchParams.get('difficulty') || '');
    setSelectedRound(searchParams.get('round') || '');
    setSelectedYear(searchParams.get('year') || '');
    setSelectedLanguage(searchParams.get('language') || '');
    setSort(searchParams.get('sort') || 'newest');
    setPage(parseInt(searchParams.get('page') || '1', 10));
  }, [searchParams]);

  // Fetch questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const res = await questionService.getQuestions({
          search: search || undefined,
          company: selectedCompany || undefined,
          category: selectedCategory || undefined,
          difficulty: selectedDifficulty || undefined,
          interviewRound: selectedRound || undefined,
          recruitmentYear: selectedYear ? parseInt(selectedYear, 10) : undefined,
          programmingLanguage: selectedLanguage || undefined,
          sort,
          page,
          limit: 10,
        });

        setQuestions(Array.isArray(res?.data) ? res.data : []);
        setMeta(res?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });
      } catch (err) {
        console.error('Failed to query questions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [search, selectedCompany, selectedCategory, selectedDifficulty, selectedRound, selectedYear, selectedLanguage, sort, page]);

  // Update URL params helper
  const updateParams = (newParams: Record<string, string | number | undefined>) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === undefined || v === '' || (k === 'page' && v === 1)) {
        updated.delete(k);
      } else {
        updated.set(k, String(v));
      }
    });
    setSearchParams(updated);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search, page: 1 });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCompany('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSelectedRound('');
    setSelectedYear('');
    setSelectedLanguage('');
    setSort('newest');
    setSearchParams({});
  };

  const hasActiveFilters =
    !!search ||
    !!selectedCompany ||
    !!selectedCategory ||
    !!selectedDifficulty ||
    !!selectedRound ||
    !!selectedYear ||
    !!selectedLanguage;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Placement Questions Archive
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Browse and search real placement questions asked in recruitment rounds.
          </p>
        </div>

        <Link
          to="/submit-question"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Share a Question</span>
        </Link>
      </div>

      {/* Search and Sort Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by keywords, title, topics, tags (e.g., Dijkstra, Normalization, Puzzle)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden p-2.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </form>

        {/* Filter Quick Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex items-center gap-2 text-slate-600">
            <span>Sort by:</span>
            <select
              value={sort}
              onChange={e => updateParams({ sort: e.target.value, page: 1 })}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="newest">Newest Submissions</option>
              <option value="oldest">Oldest Submissions</option>
              <option value="views">Most Viewed</option>
              <option value="helpful">Most Helpful Answers</option>
              <option value="answers">Most Answers</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 p-1 rounded"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Filter Sidebar + Questions List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar */}
        <div className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} space-y-6`}>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                <span>Filter Questions</span>
              </h3>
            </div>

            {/* Company Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Company
              </label>
              <select
                value={selectedCompany}
                onChange={e => updateParams({ company: e.target.value, page: 1 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Companies</option>
                {companies.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Question Category
              </label>
              <select
                value={selectedCategory}
                onChange={e => updateParams({ category: e.target.value, page: 1 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {['', 'Easy', 'Medium', 'Hard'].map(d => (
                  <button
                    key={d || 'all'}
                    type="button"
                    onClick={() => updateParams({ difficulty: d, page: 1 })}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      selectedDifficulty === d
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {d || 'Any'}
                  </button>
                ))}
              </div>
            </div>

            {/* Interview Round Filter */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Interview Round
              </label>
              <select
                value={selectedRound}
                onChange={e => updateParams({ round: e.target.value, page: 1 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Rounds</option>
                <option value="Online Assessment">Online Assessment</option>
                <option value="Technical Interview">Technical Interview</option>
                <option value="Technical Interview 1">Technical Interview 1</option>
                <option value="Technical Interview 2">Technical Interview 2</option>
                <option value="HR Interview">HR Interview</option>
                <option value="Cognitive & Coding Test">Cognitive & Coding Test</option>
                <option value="Group Discussion">Group Discussion</option>
              </select>
            </div>

            {/* Recruitment Year */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Recruitment Year
              </label>
              <select
                value={selectedYear}
                onChange={e => updateParams({ year: e.target.value, page: 1 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Years</option>
                <option value="2026">2026 Batch</option>
                <option value="2025">2025 Batch</option>
                <option value="2024">2024 Batch</option>
                <option value="2023">2023 Batch</option>
              </select>
            </div>

            {/* Programming Language */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Programming Language
              </label>
              <select
                value={selectedLanguage}
                onChange={e => updateParams({ language: e.target.value, page: 1 })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Language</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
                <option value="Python">Python</option>
                <option value="JavaScript">JavaScript</option>
                <option value="SQL">SQL</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>
        </div>

        {/* Questions Cards List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600 pb-2">
            <span>
              Showing <strong>{questions.length}</strong> of <strong>{meta.total}</strong> placement questions
            </span>
            <span>Page {meta.page} of {meta.totalPages || 1}</span>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-6 bg-slate-200 rounded w-3/4" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                </div>
              ))}
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Questions Match Your Criteria</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Try loosening your filters or search terms. If you encountered this question during a campus drive,
                be the first to share it!
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear All Filters
                </button>
                <Link
                  to="/submit-question"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                >
                  Share a Question
                </Link>
              </div>
            </div>
          ) : (
            questions.map(q => {
              let diffBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              if (q.difficulty === 'Medium') diffBadge = 'bg-amber-50 text-amber-700 border-amber-200';
              if (q.difficulty === 'Hard') diffBadge = 'bg-rose-50 text-rose-700 border-rose-200';

              return (
                <article
                  key={q._id}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all space-y-3"
                >
                  {/* Card Meta Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/companies/${q.company?._id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-900 hover:text-blue-700 font-bold text-xs transition-colors"
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-600" />
                        <span>{q.company?.name || 'Recruiting Company'}</span>
                      </Link>

                      <span className="text-xs text-slate-600 font-medium">
                        {q.interviewRound} ({q.recruitmentYear})
                      </span>

                      {q.jobRole && (
                        <span className="text-xs text-slate-600 hidden sm:inline">
                          • {q.jobRole}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {q.isReviewed && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          Reviewed
                        </span>
                      )}
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${diffBadge}`}>
                        {q.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <Link to={`/questions/${q._id}`} className="block group">
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {q.title}
                    </h2>
                  </Link>

                  {/* Description Excerpt */}
                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {q.description}
                  </p>

                  {/* Tags */}
                  {q.tags && q.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {q.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer Metrics */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
                    <div className="flex items-center gap-5">
                      <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <MessageSquare className="w-4 h-4 text-slate-600" />
                        <span>{q.answersCount || 0} answers</span>
                      </span>

                      <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <ThumbsUp className="w-4 h-4 text-slate-600" />
                        <span>{q.helpfulVotesCount || 0} helpful</span>
                      </span>

                      <span className="flex items-center gap-1.5 text-slate-600 hidden sm:inline-flex">
                        <Eye className="w-4 h-4 text-slate-600" />
                        <span>{q.viewCount || 0} views</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-600">
                        Category: <strong className="text-slate-700">{q.category}</strong>
                      </span>
                      <Link
                        to={`/questions/${q._id}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 ml-2"
                      >
                        View Details &rarr;
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })
          )}

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => updateParams({ page: page - 1 })}
                className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => updateParams({ page: p })}
                  className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                    page === p
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={page >= meta.totalPages}
                onClick={() => updateParams({ page: page + 1 })}
                className="p-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
