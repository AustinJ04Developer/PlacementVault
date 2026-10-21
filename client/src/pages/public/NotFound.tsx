import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Home, Search } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
        <HelpCircle className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mb-3">Page Not Found</h2>
      <p className="text-base text-slate-600 mb-8 leading-relaxed">
        The placement question, company, or page you were seeking may have been relocated, removed, or never existed.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-sm transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Home Dashboard</span>
        </Link>
        <Link
          to="/questions"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all"
        >
          <Search className="w-4 h-4" />
          <span>Search Repository</span>
        </Link>
      </div>
    </div>
  );
};
