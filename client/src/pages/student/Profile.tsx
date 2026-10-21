import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { useToast } from '../../contexts/ToastContext.js';
import { User, Mail, BookOpen, Calendar, Save, Loader2, ShieldCheck } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const STANDARD_DEPARTMENTS = [
    'Computer Science & Engineering',
    'Information Technology',
    'Artificial Intelligence and Data Science',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'MBA',
  ];

  const [selectedDept, setSelectedDept] = useState('Computer Science & Engineering');
  const [customDept, setCustomDept] = useState('');
  const [graduationYear, setGraduationYear] = useState<number>(2025);
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCollegeName(user.collegeName || '');
      setRollNumber(user.rollNumber || '');
      if (user.department) {
        let normalized = user.department;
        if (normalized === 'Civil') normalized = 'Civil Engineering';
        if (normalized === 'Electronics & Communication') normalized = 'Electronics & Communication Engineering';
        if (normalized === 'Electrical & Electronics' || normalized === 'Electrical and Electronics') {
          normalized = 'Electrical & Electronics Engineering';
        }

        if (STANDARD_DEPARTMENTS.includes(normalized)) {
          setSelectedDept(normalized);
          setCustomDept('');
        } else {
          setSelectedDept('Other');
          setCustomDept(user.department);
        }
      } else {
        setSelectedDept('Computer Science & Engineering');
        setCustomDept('');
      }
      setGraduationYear(user.graduationYear || 2025);
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const resolvedDepartment = selectedDept === 'Other' ? customDept.trim() : selectedDept.trim();
    if (selectedDept === 'Other' && !resolvedDepartment) {
      toastError('Please specify your department name.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        name,
        collegeName,
        rollNumber,
        department: resolvedDepartment,
        graduationYear: Number(graduationYear),
        bio,
      });
    } catch (err: any) {
      // toast handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Student Profile & Settings
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage your personal details, academic department, and platform visibility.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              Role: {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address (Read-Only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                College / University Name
              </label>
              <input
                type="text"
                value={collegeName}
                onChange={e => setCollegeName(e.target.value)}
                placeholder="e.g. National Institute of Technology"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Roll Number / Student USN
              </label>
              <input
                type="text"
                value={rollNumber}
                onChange={e => setRollNumber(e.target.value)}
                placeholder="e.g. 21CS042"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Department / Branch
              </label>
              <select
                value={selectedDept}
                onChange={e => setSelectedDept(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STANDARD_DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
                <option value="Other">Other Department</option>
              </select>

              {selectedDept === 'Other' && (
                <div className="mt-2.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
                    Specify Your Department Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customDept}
                    onChange={e => setCustomDept(e.target.value)}
                    placeholder="e.g. Chemical Engineering, Biotechnology, MCA, Aerospace..."
                    className="w-full p-3 bg-blue-50/50 border border-blue-300 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Graduation Year
              </label>
              <input
                type="number"
                min={2020}
                max={2030}
                value={graduationYear}
                onChange={e => setGraduationYear(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Bio / Placement Preparation Focus
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell others what areas you're preparing for (e.g. SDE roles, fintech, backend systems)..."
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-60 transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
