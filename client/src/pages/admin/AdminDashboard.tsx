import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building,
  Calendar,
  HelpCircle,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  Download,
  Loader2,
  CheckCircle,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';
import { adminService } from '../../services/adminService.js';
import { DashboardStats } from '../../types/index.js';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await adminService.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Compiling database metrics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
        <p className="text-sm text-slate-600">Failed to load administrator statistics.</p>
      </div>
    );
  }

  const { summary } = stats;

  return (
    <div className="space-y-8">
      {/* Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-500" />
            <span>Placement Officer Dashboard</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time repository telemetry, user management, and moderation control
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/reports"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              summary.pendingReportsCount > 0
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{summary.pendingReportsCount} Reports Pending</span>
          </Link>
          <a
            href={adminService.getExportUrl('questions')}
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Registered Students</span>
          <p className="text-2xl font-black text-slate-900">{summary.totalStudents}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Active Companies</span>
          <p className="text-2xl font-black text-slate-900">{summary.totalCompanies}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Placement Drives</span>
          <p className="text-2xl font-black text-slate-900">{summary.totalDrives}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total Questions</span>
          <p className="text-2xl font-black text-slate-900">{summary.totalQuestions}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Total Answers</span>
          <p className="text-2xl font-black text-slate-900">{summary.totalAnswers}</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Pending Flags</span>
          <p className={`text-2xl font-black ${summary.pendingReportsCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
            {summary.pendingReportsCount}
          </p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Questions Timeline Area Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Questions Submitted Over Time</span>
            </h3>
            <span className="text-xs text-slate-500">Live Aggregate Data</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.timelineData}>
                <defs>
                  <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="questions" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorQuestions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Questions by Category Breakdown</span>
            </h3>
            <span className="text-xs text-slate-500">Top Categories</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.questionsByCategory.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Submissions Table & Most Viewed Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Recent Student Question Submissions</h3>
            <Link to="/admin/questions" className="text-xs font-bold text-blue-600 hover:text-blue-700">
              Manage All &rarr;
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {stats.recentQuestions.map(q => (
              <div key={q._id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <Link to={`/questions/${q._id}`} className="font-bold text-slate-900 hover:text-blue-600 truncate block">
                    {q.title}
                  </Link>
                  <p className="text-slate-500 text-[11px] truncate">
                    {q.company?.name} • Category: {q.category} • Contributor: {q.author?.name || 'Student'}
                  </p>
                </div>
                <span className="text-slate-400 text-[11px] flex-shrink-0">
                  {new Date(q.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900">Most Viewed Placement Questions</h3>
          </div>

          <div className="space-y-3">
            {stats.mostViewedQuestions.map(q => (
              <Link
                key={q._id}
                to={`/questions/${q._id}`}
                className="block p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="font-bold text-slate-600">{q.company?.name}</span>
                  <span className="font-black text-blue-600">{q.viewCount} views</span>
                </div>
                <p className="font-bold text-xs text-slate-900 line-clamp-1">{q.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
