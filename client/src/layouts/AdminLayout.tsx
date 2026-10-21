import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  HelpCircle,
  AlertTriangle,
  Users,
  Building,
  Calendar,
  Layers,
  CopyCheck,
  FileText,
  Download,
  LogOut,
  ChevronRight,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { Logo } from '../components/common/Logo.js';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Overview Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Moderation Reports', path: '/admin/reports', icon: AlertTriangle },
    { label: 'Question Management', path: '/admin/questions', icon: HelpCircle },
    { label: 'Student Accounts', path: '/admin/students', icon: Users },
    { label: 'Company Records', path: '/admin/companies', icon: Building },
    { label: 'Placement Drives', path: '/admin/drives', icon: Calendar },
    { label: 'Categories & Topics', path: '/admin/categories', icon: Layers },
    { label: 'Duplicate Identifier', path: '/admin/duplicates', icon: CopyCheck },
    { label: 'Audit Trail Logs', path: '/admin/audit-logs', icon: FileText },
    { label: 'Data CSV Exports', path: '/admin/export', icon: Download },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
      {/* Top Admin Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center group">
              <Logo size="sm" variant="light" showText={true} subtitle="Campus Placement Administration" />
            </Link>
            <span className="text-amber-400 font-semibold text-xs tracking-wider uppercase px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20 hidden sm:inline-block">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Student Portal</span>
            </Link>
            <div className="h-4 w-px bg-slate-700 hidden sm:block" />
            <span className="text-xs text-slate-300 hidden sm:inline-block font-medium">
              {user?.name}
            </span>
            <button
              onClick={logout}
              className="text-xs text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-slate-800"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sticky top-24">
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-3 py-2">
              Management Modules
            </p>
            <nav className="space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-white/70" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Admin Content View */}
        <section className="flex-1 min-w-0">
          <Outlet />
        </section>
      </div>
    </div>
  );
};
