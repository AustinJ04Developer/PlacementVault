import React, { useState, useEffect } from 'react';
import {
  Calendar,
  PlusCircle,
  Building,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import { companyService } from '../../services/companyService.js';
import { PlacementDrive, Company } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const AdminDrives: React.FC = () => {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { success, error: toastError } = useToast();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState<PlacementDrive | null>(null);
  const [companyId, setCompanyId] = useState('');
  const [recruitmentYear, setRecruitmentYear] = useState(2025);
  const [driveTitle, setDriveTitle] = useState('');
  const [jobRolesStr, setJobRolesStr] = useState('Software Engineer');
  const [roundsStr, setRoundsStr] = useState('Online Assessment, Technical Round, HR Round');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDrives();
  }, []);

  const loadDrives = async () => {
    try {
      setIsLoading(true);
      const [drivesData, compRes] = await Promise.all([
        companyService.getDrives({}),
        companyService.getCompanies({ limit: 100 }),
      ]);
      setDrives(drivesData);
      setCompanies(compRes.data);
      if (compRes.data.length > 0) {
        setCompanyId(compRes.data[0]._id);
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to load drives.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (drive?: PlacementDrive) => {
    if (drive) {
      setEditingDrive(drive);
      setCompanyId(typeof drive.company === 'object' ? (drive.company as any)._id : drive.company);
      setRecruitmentYear(drive.recruitmentYear);
      setDriveTitle(drive.driveTitle);
      setJobRolesStr((drive.jobRoles || []).join(', '));
      setRoundsStr((drive.rounds || []).join(', '));
      setDescription(drive.description || '');
    } else {
      setEditingDrive(null);
      setDriveTitle('');
      setJobRolesStr('Software Engineer');
      setRoundsStr('Online Assessment, Technical Interview, HR Round');
      setDescription('');
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveTitle.trim() || !companyId) return;

    const jobRoles = jobRolesStr.split(',').map(r => r.trim()).filter(Boolean);
    const rounds = roundsStr.split(',').map(r => r.trim()).filter(Boolean);

    setIsSubmitting(true);
    try {
      if (editingDrive) {
        await companyService.updateDrive(editingDrive._id, {
          company: companyId,
          recruitmentYear: Number(recruitmentYear),
          driveTitle: driveTitle.trim(),
          jobRoles,
          rounds,
          description: description.trim(),
        });
        success('Placement drive updated.');
      } else {
        await companyService.createDrive({
          company: companyId,
          recruitmentYear: Number(recruitmentYear),
          driveTitle: driveTitle.trim(),
          jobRoles,
          rounds,
          description: description.trim(),
        });
        success('Placement drive created successfully.');
      }
      setModalOpen(false);
      loadDrives();
    } catch (err: any) {
      toastError(err.message || 'Failed to save drive.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (drive: PlacementDrive) => {
    if (!confirm(`Are you sure you want to deactivate or remove ${drive.driveTitle}?`)) return;

    try {
      const res = await companyService.deleteDrive(drive._id);
      success(res.message);
      loadDrives();
    } catch (err: any) {
      toastError(err.message || 'Failed to delete drive.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <span>Placement Drive Records</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize recruitment drive campaigns by batch year and company
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Drive</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          </div>
        ) : drives.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No placement drives recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-5 py-3.5">Drive Title & Year</th>
                  <th className="px-4 py-3.5">Company</th>
                  <th className="px-4 py-3.5">Recruiting Roles</th>
                  <th className="px-4 py-3.5">Rounds</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {drives.map(d => (
                  <tr key={d._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{d.driveTitle}</div>
                      <span className="text-[11px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        {d.recruitmentYear} Batch
                      </span>
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-slate-700">
                      {typeof d.company === 'object' ? (d.company as any)?.name : 'Company'}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {(d.jobRoles || []).join(', ')}
                    </td>

                    <td className="px-4 py-3.5 text-slate-600">
                      {(d.rounds || []).join(' → ')}
                    </td>

                    <td className="px-5 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(d)}
                        className="p-1.5 text-slate-600 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                        title="Edit Drive"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(d)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                        title="Delete Drive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              {editingDrive ? 'Edit Placement Drive' : 'Create Placement Drive'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Company <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={companyId}
                    onChange={e => setCompanyId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {companies.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Recruitment Year <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={2020}
                    max={2030}
                    value={recruitmentYear}
                    onChange={e => setRecruitmentYear(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Drive Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={driveTitle}
                  onChange={e => setDriveTitle(e.target.value)}
                  placeholder="e.g. Campus Recruitment 2025 - Member of Technical Staff"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Job Roles (Comma separated)
                </label>
                <input
                  type="text"
                  value={jobRolesStr}
                  onChange={e => setJobRolesStr(e.target.value)}
                  placeholder="Software Engineer, Data Analyst, Cloud DevOps"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Interview Rounds Sequence (Comma separated)
                </label>
                <input
                  type="text"
                  value={roundsStr}
                  onChange={e => setRoundsStr(e.target.value)}
                  placeholder="Online Assessment, Technical Interview 1, Technical Interview 2, HR Round"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Drive Notes / Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Information regarding eligibility criteria, rounds format, etc..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl"
                >
                  {isSubmitting ? 'Saving...' : 'Save Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
