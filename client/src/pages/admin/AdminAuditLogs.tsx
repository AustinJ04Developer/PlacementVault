import React, { useState, useEffect } from 'react';
import { FileText, Loader2, ShieldCheck, User } from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { AuditLog } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { error: toastError } = useToast();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getAuditLogs({ limit: 50 });
      setLogs(res.data);
    } catch (err: any) {
      toastError(err.message || 'Failed to load audit logs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-slate-700" />
          <span>System Audit Trail Logs</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable audit record of sensitive administrative actions and moderation events
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No audit records logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Action Executed</th>
                  <th className="px-4 py-3.5">Entity</th>
                  <th className="px-4 py-3.5">Actor</th>
                  <th className="px-5 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-slate-700">
                      {log.entityType} {log.entityId ? `(#${log.entityId.slice(-6)})` : ''}
                    </td>

                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      {log.actor?.name || 'Admin'}
                    </td>

                    <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px] max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
