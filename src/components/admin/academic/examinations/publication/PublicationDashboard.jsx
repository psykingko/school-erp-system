import React, { useState, useEffect } from "react";
import {
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  ShieldAlert,
} from "lucide-react";
import AdminStatCard from "../../../AdminStatCard";
import MainCard from "../../../../MainCard";
import ResultReadinessPanel from "./ResultReadinessPanel";
import PublicationTimelineFeed from "./PublicationTimelineFeed";
import ResultAnalyticsPreview from "./ResultAnalyticsPreview";
import PublicationDiagnosticsModal from "./PublicationDiagnosticsModal";
import {
  validateSessionForPublication,
  transitionExamCycleStatus,
} from "../../../../../services/examService";

export default function PublicationDashboard({
  examCycle,
  papers,
  classes,
  subjects,
  teachers,
  students,
  results,
  onRefresh,
}) {
  const [activeSubTab, setActiveSubTab] = useState("overview");
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [diagnostics, setDiagnostics] = useState({ errors: [], warnings: [] });
  const [success, setSuccess] = useState("");

  const sessionPapers = papers.filter((p) => p.examSessionId === examCycle?.id);

  const fetchDiagnostics = async () => {
    if (!examCycle) return;
    const diag = await validateSessionForPublication(examCycle.id);
    setDiagnostics(diag);
  };

  useEffect(() => {
    fetchDiagnostics();
  }, [examCycle, papers]);

  if (!examCycle) return null;

  const isPublished = examCycle.status === "published";

  const handleOpenDiagnostics = async () => {
    await fetchDiagnostics();
    setDiagnosticsOpen(true);
  };

  const handleConfirmPublication = async () => {
    try {
      await transitionExamCycleStatus({
        sessionId: examCycle.id,
        fromStatus: "evaluation",
        toStatus: "published",
        changedBy: "admin-001",
      });
      setDiagnosticsOpen(false);
      setSuccess("Results successfully declared and published to portals!");
      onRefresh();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const subTabs = [
    { id: "overview", label: "Overview & Timeline" },
    { id: "readiness", label: "Result Readiness" },
    { id: "analytics", label: "Pre-Publication Analytics" },
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Header Block */}
      <MainCard className="p-6 bg-gradient-to-r from-[#03045e] to-[#023e8a] text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-[#ade8f4]">
            Central Declaration & Closure Console
          </span>
          <h3 className="text-base font-black tracking-tight leading-none">
            {examCycle.name} Results
          </h3>
          <p className="text-xs text-white/70 font-semibold max-w-lg leading-relaxed">
            Close the evaluation cycle, freeze teacher scorings, and declare
            central PTM scores securely.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isPublished ? (
            <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 text-emerald-300 font-black text-xs rounded-xl border border-emerald-400/30 uppercase tracking-widest shadow-sm">
              <CheckCircle size={15} />
              <span>PUBLISHED & IMMUTABLE</span>
            </span>
          ) : (
            <button
              onClick={handleOpenDiagnostics}
              className="flex items-center gap-1.5 bg-[#00b4d8] hover:bg-[#0096c7] text-white text-xs font-black px-6 py-3 rounded-2xl transition-all shadow-lg hover:-translate-y-0.5"
            >
              <Play size={13} />
              <span>PUBLISH RESULTS NOW</span>
            </button>
          )}
        </div>
      </MainCard>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle size={15} />
          <span>{success}</span>
        </div>
      )}

      {/* Internal Navigation Tabs */}
      <div className="flex gap-1.5 border-b border-[#caf0f8]/30 pb-px">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2.5 rounded-t-2xl text-[10px] font-black tracking-wider uppercase transition-colors relative ${
              activeSubTab === tab.id
                ? "bg-white border border-[#caf0f8] border-b-transparent text-[#0077b6]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-[#caf0f8]/50 shadow-sm animate-fade-in">
        {activeSubTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wider">
                  Result Status Board
                </h4>
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">
                  Stateless pre-checks and declaration metrics
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-gray-100 space-y-1.5 shadow-sm bg-slate-50/20">
                  <strong className="text-[10px] font-black text-[#03045e] uppercase tracking-wider block">
                    Diagnostic Errors
                  </strong>
                  <span className="text-2xl font-black text-[#03045e]">
                    {diagnostics.errors.length}
                  </span>
                  <span className="text-[8px] text-gray-400 font-bold uppercase block mt-1">
                    Blocks declaration when &gt; 0
                  </span>
                </div>

                <div className="p-4 rounded-2xl border border-gray-100 space-y-1.5 shadow-sm bg-slate-50/20">
                  <strong className="text-[10px] font-black text-[#03045e] uppercase tracking-wider block">
                    Pedagogical Warnings
                  </strong>
                  <span className="text-2xl font-black text-[#03045e]">
                    {diagnostics.warnings.length}
                  </span>
                  <span className="text-[8px] text-gray-400 font-bold uppercase block mt-1">
                    Override permitted on warnings
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-200/50">
              <PublicationTimelineFeed examCycle={examCycle} />
            </div>
          </div>
        )}

        {activeSubTab === "readiness" && (
          <ResultReadinessPanel
            examCycle={examCycle}
            papers={papers}
            classes={classes}
            subjects={subjects}
            students={students}
          />
        )}

        {activeSubTab === "analytics" && (
          <ResultAnalyticsPreview
            examCycle={examCycle}
            papers={papers}
            students={students}
            subjects={subjects}
          />
        )}
      </div>

      <PublicationDiagnosticsModal
        isOpen={diagnosticsOpen}
        onClose={() => setDiagnosticsOpen(false)}
        diagnostics={diagnostics}
        onConfirmPublication={handleConfirmPublication}
      />
    </div>
  );
}
