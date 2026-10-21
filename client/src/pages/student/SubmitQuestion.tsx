import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Building2,
  Calendar,
  Layers,
  Code,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { questionService } from '../../services/questionService.js';
import { companyService } from '../../services/companyService.js';
import { Company, PlacementDrive, Category } from '../../types/index.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { useToast } from '../../contexts/ToastContext.js';

export const SubmitQuestion: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form Fields
  const [companyId, setCompanyId] = useState('');
  const [driveId, setDriveId] = useState('');
  const [recruitmentYear, setRecruitmentYear] = useState(new Date().getFullYear());
  const [interviewRound, setInterviewRound] = useState('Online Assessment');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Coding');
  const [jobRole, setJobRole] = useState('Software Development Engineer');
  const [subjectTopic, setSubjectTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [tagsInput, setTagsInput] = useState('');
  const [experienceNotes, setExperienceNotes] = useState('');

  // Initial Solution Fields (Optional)
  const [hasSolution, setHasSolution] = useState(true);
  const [language, setLanguage] = useState('Java');
  const [solutionCode, setSolutionCode] = useState('');
  const [solutionExplanation, setSolutionExplanation] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      toastError('Please sign in to share a placement drive question.');
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        setIsLoadingDropdowns(true);
        const [compRes, catRes] = await Promise.all([
          companyService.getCompanies({ limit: 100 }),
          companyService.getCategories(),
        ]);
        setCompanies(compRes.data);
        if (compRes.data.length > 0) {
          setCompanyId(compRes.data[0]._id);
        }
        setCategories(catRes);
      } catch (err: any) {
        toastError('Failed to load recruitment companies or categories.');
      } finally {
        setIsLoadingDropdowns(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  // Load drives when company changes
  useEffect(() => {
    if (!companyId) return;
    companyService
      .getDrives({ companyId })
      .then(d => setDrives(d))
      .catch(() => setDrives([]));
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !companyId) {
      toastError('Please fill out all required fields.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const initialSolution =
      hasSolution && (solutionCode.trim() || solutionExplanation.trim())
        ? {
            code: solutionCode.trim(),
            language,
            explanation: solutionExplanation.trim(),
          }
        : undefined;

    setIsSubmitting(true);
    try {
      const res = await questionService.createQuestion({
        title: title.trim(),
        description: description.trim(),
        company: companyId,
        drive: driveId || undefined,
        recruitmentYear: Number(recruitmentYear),
        interviewRound,
        category,
        jobRole: jobRole.trim() || undefined,
        subjectTopic: subjectTopic.trim() || undefined,
        difficulty,
        tags,
        experienceNotes: experienceNotes.trim() || undefined,
        initialSolution,
      });

      success(res.message);
      navigate(`/questions/${res.data._id}`);
    } catch (err: any) {
      toastError(err.message || 'Failed to submit question.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Share a Placement Drive Question
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Contribute real questions encountered during aptitude tests, coding rounds, or technical interviews.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Placement Drive & Company Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>1. Recruitment Drive & Company Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Hiring Company <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={companyId}
                onChange={e => setCompanyId(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {companies.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Recruitment Year <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={2020}
                max={2030}
                value={recruitmentYear}
                onChange={e => setRecruitmentYear(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Interview / Assessment Round <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={interviewRound}
                onChange={e => setInterviewRound(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Online Assessment">Online Assessment</option>
                <option value="Cognitive & Coding Test">Cognitive & Coding Test</option>
                <option value="Technical Interview 1">Technical Interview 1</option>
                <option value="Technical Interview 2">Technical Interview 2</option>
                <option value="HR & Managerial Round">HR & Managerial Round</option>
                <option value="Group Discussion">Group Discussion</option>
                <option value="System Design Round">System Design Round</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Job Role (Optional)
              </label>
              <input
                type="text"
                value={jobRole}
                onChange={e => setJobRole(e.target.value)}
                placeholder="e.g. Associate SDE, Data Analyst"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Question Statement */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>2. Question Content & Classification</span>
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Question Title / Headline <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Minimum Spanning Tree with Kruskal Algorithm or B-Tree Depth in MySQL"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Subject / Topic (Optional)
                </label>
                <input
                  type="text"
                  value={subjectTopic}
                  onChange={e => setSubjectTopic(e.target.value)}
                  placeholder="e.g. Graph BFS, ACID properties"
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Complete Question Description / Problem Statement <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={6}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Include constraints, sample inputs and outputs, edge cases discussed in the interview..."
                className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="e.g. graphs, greedy, hackerrank, sql, dbms"
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Drive Experience Notes & Tips for Future Batches
              </label>
              <textarea
                rows={3}
                value={experienceNotes}
                onChange={e => setExperienceNotes(e.target.value)}
                placeholder="e.g. The interviewer expected me to write full runnable code on paper before whiteboarding. Test cases included negative numbers..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Proposed Solution / Answer (Optional) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Code className="w-5 h-5 text-emerald-600" />
              <span>3. Proposed Solution or Explanation (Optional)</span>
            </h2>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={hasSolution}
                onChange={e => setHasSolution(e.target.checked)}
                className="rounded text-blue-600"
              />
              <span>Include my solution</span>
            </label>
          </div>

          {hasSolution && (
            <div className="space-y-4">
              <div className="w-full sm:w-1/3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Programming Language
                </label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Java">Java</option>
                  <option value="C++">C++</option>
                  <option value="Python">Python</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="SQL">SQL</option>
                  <option value="C">C</option>
                  <option value="Plain Text">Plain Text</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Code Snippet
                </label>
                <textarea
                  rows={6}
                  value={solutionCode}
                  onChange={e => setSolutionCode(e.target.value)}
                  placeholder="// Paste your solution code here..."
                  className="w-full p-3 font-mono text-xs bg-slate-950 text-slate-100 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Explanation
                </label>
                <textarea
                  rows={3}
                  value={solutionExplanation}
                  onChange={e => setSolutionExplanation(e.target.value)}
                  placeholder="Explain why this approach works, complexity analysis, key pointers..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-3 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/25 disabled:opacity-60 transition-all cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Publishing to Repository...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Publish Placement Question</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
