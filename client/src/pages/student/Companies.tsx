import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Search, ArrowRight, ExternalLink, HelpCircle, Layers } from 'lucide-react';
import { companyService } from '../../services/companyService.js';
import { Company } from '../../types/index.js';

export const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setIsLoading(true);
        const res = await companyService.getCompanies({ search: search || undefined, limit: 100 });
        setCompanies(res.data);
      } catch (err) {
        console.error('Failed to load companies:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanies();
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Campus Recruiting Companies
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Explore companies hiring from campus drives, their recruitment patterns, and past interview questions.
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter by company name or industry..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      </div>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse h-44" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Companies Found</h3>
          <p className="text-xs text-slate-500">No company matches your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map(c => (
            <Link
              key={c._id}
              to={`/companies/${c._id}`}
              className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all flex flex-col justify-between group space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-800 text-lg overflow-hidden border border-slate-200 group-hover:scale-105 transition-transform">
                    {c.logoUrl ? (
                      <img src={c.logoUrl} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      c.name.charAt(0)
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 px-2.5 py-1 bg-slate-100 rounded-lg">
                    {c.industry || 'Technology'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {c.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                  {c.description || 'Campus recruitment drives and interview assessments.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">
                  <strong className="text-slate-900 font-extrabold">{c.totalQuestionsCount || 0}</strong> Questions
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                  <span>View Archive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
