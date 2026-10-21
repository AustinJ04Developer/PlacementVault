import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  EyeOff,
  Loader2,
  FileText,
  User,
  Shield,
} from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { Report } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: toastError } = useToast();

  // Resolution modal state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [action, setAction] = useState('hidden');
  const [status, setStatus] = useState<'resolved' | 'dismissed'>('resolved');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getReports({ status: statusFilter });
      setReports(res.data);
    } catch (err: any) {
      toastError(err.message || 'Failed to load moderation reports.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setIsSubmitting(true);
    try {
      await adminService.resolveReport(selectedReport._id, {
        status,
        resolutionAction: action,
        resolutionNotes: notes.trim(),
      });
      success(`Report resolved with action: ${action}`);
      setSelectedReport(null);
      setNotes('');
      loadReports();
    } catch (err: any) {
      toastError(err.message || 'Failed to resolve report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600" />
            <span>Moderation & Content Reports</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review reported questions, answers, and potential confidential recruitment leaks
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
          {['pending', 'resolved', 'dismissed', 'all'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                statusFilter === s ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">All Clear!</h3>
          <p className="text-xs text-slate-500">
            No moderation reports currently match the "{statusFilter}" status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(r => (
            <div
              key={r._id}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                    Reason: {r.reason.replace(/_/g, ' ')}
                  </span>
                  <span className="text-slate-500">
                    Target: <strong className="text-slate-800 uppercase">{r.targetType}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  <span>Reported on {new Date(r.createdAt).toLocaleDateString()}</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                    r.status === 'pending'
                      ? 'bg-amber-50 text-amber-800'
                      : r.status === 'resolved'
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {r.status}
                  </span>
                </div>
              </div>

              {/* Reported Content Preview */}
              {r.targetContent ? (
                <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-200/80">
                  <p className="font-bold text-slate-700">Content Snapshot Under Review:</p>
                  {r.targetContent.title && (
                    <p className="font-semibold text-slate-900 text-sm">{r.targetContent.title}</p>
                  )}
                  <p className="text-slate-700 whitespace-pre-wrap line-clamp-3">
                    {r.targetContent.description || r.targetContent.content}
                  </p>
                  {r.targetContent.author && (
                    <p className="text-[11px] text-slate-500">
                      Author: {r.targetContent.author.name} • Status: {r.targetContent.status}
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 italic">
                  Target item is no longer in active records or was removed.
                </div>
              )}

              {/* Reporter Notes */}
              {r.details && (
                <div className="text-xs text-slate-700">
                  <strong>Reporter's note:</strong> "{r.details}"
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Reporter: <strong>{r.reporter?.name}</strong> ({r.reporter?.email})
                </span>

                {r.status === 'pending' && (
                  <button
                    onClick={() => {
                      setSelectedReport(r);
                      setAction('hidden');
                      setStatus('resolved');
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                  >
                    Moderate & Resolve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resolution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Resolve Moderation Report
            </h3>

            <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="resolved">Resolved (Take Moderation Action)</option>
                  <option value="dismissed">Dismissed (Report Invalid or No Violation)</option>
                </select>
              </div>

              {status === 'resolved' && (
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Action on Target Content
                  </label>
                  <select
                    value={action}
                    onChange={e => setAction(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="hidden">Hide Content (Set status to hidden)</option>
                    <option value="deleted">Delete Content Permanently</option>
                    <option value="none">No Action on Content (Mark Reviewed)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Administrator Resolution Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Record justification for audit logging..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
                >
                  {isSubmitting ? 'Saving...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
