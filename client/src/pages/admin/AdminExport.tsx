import React from 'react';
import { Download, FileSpreadsheet, FileText, Building, Users, HelpCircle, CheckCircle } from 'lucide-react';
import { adminService } from '../../services/adminService.js';

export const AdminExport: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Download className="w-6 h-6 text-emerald-600" />
          <span>Data Reports & Multi-Format Exports</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate structured Microsoft Word (.docx) documents and CSV spreadsheets for offline reviews, placement office reporting, and audit archives
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Questions Export */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Placement Questions Archive</h3>
              <span className="inline-block mt-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                Full Repository & Solutions
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Export all submitted questions with titles, companies, recruitment years, rounds, categories, candidate experience notes, and solution snippets.
            </p>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            {/* Word Document Export */}
            <a
              href={adminService.getExportDocxUrl('questions')}
              download="placementvault-questions.docx"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Download Word Doc (.docx)</span>
            </a>

            {/* CSV Export */}
            <a
              href={adminService.getExportUrl('questions')}
              download="placementvault-questions.csv"
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Download SpreadSheet (.csv)</span>
            </a>
          </div>
        </div>

        {/* Students Export */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Registered Students Roster</h3>
              <span className="inline-block mt-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                College Profiles & Batch Records
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Export student directory with college/university affiliations, roll numbers, departments, graduation batches, and activity metrics.
            </p>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            {/* Word Document Export */}
            <a
              href={adminService.getExportDocxUrl('students')}
              download="placementvault-students.docx"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Download Word Doc (.docx)</span>
            </a>

            {/* CSV Export */}
            <a
              href={adminService.getExportUrl('students')}
              download="placementvault-students.csv"
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Download SpreadSheet (.csv)</span>
            </a>
          </div>
        </div>

        {/* Companies Export */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Recruiting Companies Directory</h3>
              <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Industry Partner Portfolios
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Export list of all recorded recruitment companies, official domains, active placement drive counts, and question volume statistics.
            </p>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            {/* Word Document Export */}
            <a
              href={adminService.getExportDocxUrl('companies')}
              download="placementvault-companies.docx"
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span>Download Word Doc (.docx)</span>
            </a>

            {/* CSV Export */}
            <a
              href={adminService.getExportUrl('companies')}
              download="placementvault-companies.csv"
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Download SpreadSheet (.csv)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Export Format Details Info Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-800">
            Export Standards & Compatibility Note
          </p>
          <p>
            Microsoft Word (.docx) files are formatted with formal headings, metadata parameter tables, styled code blocks, and zebra-striped student rosters. CSV files are encoded in RFC 4180 standard UTF-8 format, ready for direct analysis in Microsoft Excel, Google Sheets, or institutional databases.
          </p>
        </div>
      </div>
    </div>
  );
};
