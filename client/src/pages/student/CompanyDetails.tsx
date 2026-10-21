import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Calendar,
  ExternalLink,
  HelpCircle,
  ArrowLeft,
  Loader2,
  PlusCircle,
  ThumbsUp,
  MessageSquare,
} from 'lucide-react';
import { companyService } from '../../services/companyService.js';
import { questionService } from '../../services/questionService.js';
import { Company, PlacementDrive, Question } from '../../types/index.js';

export const CompanyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [company, setCompany] = useState<Company | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const loadCompany = async () => {
      try {
        setIsLoading(true);
        const [compData, qRes] = await Promise.all([
          companyService.getCompanyById(id),
          questionService.getQuestions({ company: id, limit: 50 }),
        ]);
        setCompany(compData);
        setQuestions(qRes.data);
      } catch (err) {
        console.error('Failed to load company:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCompany();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading company records...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-3">
        <h2 className="text-2xl font-bold text-slate-900">Company Not Found</h2>
        <Link to="/companies" className="text-sm text-blue-600 font-semibold">
          &larr; Back to Companies
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Companies</span>
      </button>

      {/* Company Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-2xl text-slate-800 overflow-hidden border border-slate-200">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="w-full h-full object-cover" />
            ) : (
              company.name.charAt(0)
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {company.name}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold">
                {company.industry || 'Technology'}
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              {company.description || 'Campus recruitment drives, online screening tests, and technical interviews.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span>Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <Link
            to={`/submit-question?company=${company._id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Question</span>
          </Link>
        </div>
      </div>

      {/* Associated Placement Drives */}
      {company.drives && company.drives.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>Placement Drives ({company.drives.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {company.drives.map(drive => (
              <div
                key={drive._id}
                className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg">
                    {drive.recruitmentYear} Batch
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {drive.rounds?.length || 0} rounds
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{drive.driveTitle}</h3>
                <div className="text-xs text-slate-600 space-y-1">
                  <p><strong>Roles:</strong> {drive.jobRoles?.join(', ')}</p>
                  <p><strong>Rounds:</strong> {drive.rounds?.join(' → ')}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Questions from this Company */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <span>Questions Asked at {company.name} ({questions.length})</span>
        </h2>

        {questions.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700">No questions recorded for this company yet.</p>
            <Link
              to="/submit-question"
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              Be the first to share a question from {company.name}!
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map(q => (
              <Link
                key={q._id}
                to={`/questions/${q._id}`}
                className="block p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <span>{q.interviewRound}</span>
                    <span>• {q.recruitmentYear}</span>
                    <span>• Category: <strong>{q.category}</strong></span>
                  </div>
                  <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {q.difficulty}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {q.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                  {q.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{q.answersCount || 0} answers</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{q.helpfulVotesCount || 0} helpful</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
