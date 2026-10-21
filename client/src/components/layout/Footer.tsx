import React from 'react';
import { ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo.js';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="inline-block">
              <Logo size="sm" showText={true} />
            </Link>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              Preserving authentic placement-drive experiences for current and future college batches.
              Learn from real technical rounds, coding tests, and campus interviews.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Moderated and maintained by campus placement ambassadors</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-900 mb-3 uppercase tracking-wider">Repository</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link to="/questions" className="hover:text-blue-600 transition-colors">All Questions</Link></li>
              <li><Link to="/questions?category=Coding" className="hover:text-blue-600 transition-colors">Coding Assessments</Link></li>
              <li><Link to="/questions?category=Aptitude" className="hover:text-blue-600 transition-colors">Aptitude Tests</Link></li>
              <li><Link to="/companies" className="hover:text-blue-600 transition-colors">Recruiting Companies</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-slate-900 mb-3 uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><Link to="/submit-question" className="hover:text-blue-600 transition-colors">Share Your Drive Experience</Link></li>
              <li><Link to="/login" className="hover:text-blue-600 transition-colors">Student Login</Link></li>
              <li><Link to="/admin" className="hover:text-blue-600 transition-colors">Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-4">
          <p>© {new Date().getFullYear()} PlacementVault. Built with conventional deterministic logic.</p>
          <p className="flex items-center gap-1">
            Dedicated to empowering student careers with transparency.
          </p>
        </div>
      </div>
    </footer>
  );
};
