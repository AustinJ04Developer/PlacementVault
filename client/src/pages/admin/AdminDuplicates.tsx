import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CopyCheck, AlertCircle, ArrowRight, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { adminService } from '../../services/adminService.js';
import { DuplicatePair } from '../../types/index.js';
import { useToast } from '../../contexts/ToastContext.js';

export const AdminDuplicates: React.FC = () => {
  const [pairs, setPairs] = useState<DuplicatePair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { error: toastError } = useToast();

  useEffect(() => {
    loadDuplicates();
  }, []);

  const loadDuplicates = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getDuplicates();
      setPairs(data);
    } catch (err: any) {
      toastError(err.message || 'Failed to analyze duplicate questions.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <CopyCheck className="w-6 h-6 text-amber-500" />
          <span>Algorithmic Duplicate Question Identifier</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Deterministic lexical token comparison & similarity analysis to identify duplicate placement submissions
        </p>
      </div>

      {isLoading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Computing Jaccard token matrices...</p>
        </div>
      ) : pairs.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No High-Similarity Duplicates Detected</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All submitted placement questions exhibit distinct lexical titles within their respective recruitment companies.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-500">
            Detected <strong>{pairs.length}</strong> possible duplicate question pair(s):
          </p>

          {pairs.map((p, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                  {p.similarity}% Similarity Match
                </span>
                <span className="text-slate-500 text-[11px] font-medium">{p.reason}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                {/* Question A */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700">Question Candidate A</span>
                    <span className="text-slate-500">{p.questionA.category}</span>
                  </div>
                  <Link
                    to={`/questions/${p.questionA._id}`}
                    target="_blank"
                    className="font-bold text-sm text-slate-900 hover:text-blue-600 block line-clamp-2"
                  >
                    {p.questionA.title}
                  </Link>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                    <span>Company: {(p.questionA.company as any)?.name}</span>
                    <span className="text-blue-600 font-semibold flex items-center gap-1">
                      Inspect <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Question B */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700">Question Candidate B</span>
                    <span className="text-slate-500">{p.questionB.category}</span>
                  </div>
                  <Link
                    to={`/questions/${p.questionB._id}`}
                    target="_blank"
                    className="font-bold text-sm text-slate-900 hover:text-blue-600 block line-clamp-2"
                  >
                    {p.questionB.title}
                  </Link>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                    <span>Company: {(p.questionB.company as any)?.name}</span>
                    <span className="text-blue-600 font-semibold flex items-center gap-1">
                      Inspect <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
