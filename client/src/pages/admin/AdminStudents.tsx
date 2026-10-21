import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Loader2,
  FileText,
  MessageSquare,
  Shield,
} from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { User } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const AdminStudents: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('student');
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: toastError } = useToast();

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getUsers({
        search: search || undefined,
        role: roleFilter,
        limit: 50,
      });
      setUsers(res.data);
    } catch (err: any) {
      toastError(err.message || 'Failed to load user accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    if (!confirm(`Are you sure you want to change account status of ${user.name} to ${newStatus}?`)) {
      return;
    }

    try {
      await adminService.updateUserStatus(user.id || (user as any)._id, newStatus);
      setUsers(prev =>
        prev.map(u =>
          (u.id === user.id || (u as any)._id === (user as any)._id) ? { ...u, status: newStatus } : u
        )
      );
      success(`User account has been set to ${newStatus}.`);
    } catch (err: any) {
      toastError(err.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Student Accounts Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit registered student activity, monitor contributions, and manage account statuses
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or department..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-sm"
        >
          <option value="student">Students Only</option>
          <option value="admin">Administrators Only</option>
          <option value="all">All Roles</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No accounts found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-5 py-3.5">Student Name & Email</th>
                  <th className="px-4 py-3.5">College / Roll No</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Graduation</th>
                  <th className="px-4 py-3.5">Contributions</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Account Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id || (u as any)._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      <div className="text-slate-900 font-semibold">{u.collegeName || 'N/A'}</div>
                      {u.rollNumber && (
                        <div className="text-[10px] text-slate-500 font-mono">ID: {u.rollNumber}</div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-slate-700 font-medium">
                      {u.department || 'N/A'}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {u.graduationYear || 'N/A'}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      <div>{(u as any).questionsCount || 0} questions</div>
                      <div className="text-[10px] text-slate-400">{(u as any).answersCount || 0} answers</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        u.status === 'active'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {u.status}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                            u.status === 'active'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'active' ? (
                            <>
                              <UserX className="w-3.5 h-3.5" />
                              <span>Suspend</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      )}
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
