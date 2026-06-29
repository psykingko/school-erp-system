import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import MainCard from "../../components/MainCard";
import { getTeacherAnalytics } from "../../services/teacherDashboardService";
import { motion } from "framer-motion";
import {
  BarChart2,
  Users,
  ClipboardCheck,
  CalendarOff,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  Award,
} from "lucide-react";

/**
 * ReportsAnalyticsPage
 *
 * Teacher-scoped institutional reporting surface.
 * Aggregates real attendance, assignments, leaves, and marks data
 * from the centralized localStorage runtime.
 */
const ReportsAnalyticsPage = () => {
  const { user } = useAuth();
  const teacherId = user?.linkedEntityId || "teach-001";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    attendanceRate: 0,
    totalStudents: 0,
    presentToday: 0,
    weeklyRate: 0,
    totalAssignments: 0,
    submittedAssignments: 0,
    gradedAssignments: 0,
    gradingCoverage: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    totalMarksEntries: 0,
    examsWithMarks: 0,
    totalExams: 0,
    subjects: [],
    assignments: [],
    leaves: [],
  });

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const analytics = await getTeacherAnalytics(teacherId);
      setStats(analytics);
    } catch (err) {
      console.error("[ReportsAnalyticsPage] Failed to load report data:", err);
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const kpiCards = [
    {
      title: "Class Attendance Rate",
      value: `${stats.attendanceRate}%`,
      sub: `${stats.presentToday} of ${stats.totalStudents} present today`,
      secondarySub: `7-day avg: ${stats.weeklyRate}%`,
      icon: Users,
      accent: "#0077b6",
      bg: "#e0f2fe",
      trend: stats.attendanceRate >= 75 ? "up" : "down",
    },
    {
      title: "Assignment Grading",
      value: `${stats.gradingCoverage}%`,
      sub: `${stats.gradedAssignments} of ${stats.submittedAssignments} reviewed`,
      secondarySub: `${stats.totalAssignments} total assignments`,
      icon: ClipboardCheck,
      accent: "#059669",
      bg: "#d1fae5",
      trend: stats.gradingCoverage >= 80 ? "up" : "down",
    },
    {
      title: "Leave Applications",
      value: stats.pendingLeaves.toString(),
      sub: `Pending approval in queue`,
      secondarySub: `${stats.approvedLeaves} approved · ${stats.rejectedLeaves} rejected`,
      icon: CalendarOff,
      accent: "#d97706",
      bg: "#fef3c7",
      trend: stats.pendingLeaves === 0 ? "up" : "down",
    },
    {
      title: "Marks Submitted",
      value: stats.totalMarksEntries.toString(),
      sub: `${stats.examsWithMarks} of ${stats.totalExams} exams covered`,
      secondarySub: `Entries across all subjects`,
      icon: Award,
      accent: "#7c3aed",
      bg: "#ede9fe",
      trend: stats.examsWithMarks > 0 ? "up" : "down",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      <TeacherModuleHeader
        titleKey="nav.reports_analytics"
        descriptionKey="Operational insights — attendance, assignments, leave approvals, and marks coverage."
        helperContentEn="This reports page aggregates real class data from the ERP runtime. All metrics are computed live from localStorage: attendance records, submission rosters, leave requests, and exam marks entries."
        helperContentHi="यह रिपोर्ट पृष्ठ ERP रनटाइम से वास्तविक कक्षा डेटा एकत्र करता है। सभी मेट्रिक्स localStorage से लाइव रूप से गणना की जाती हैं: उपस्थिति रिकॉर्ड, सबमिशन रोस्टर, छुट्टी के अनुरोध और परीक्षा अंक प्रविष्टियां।"
      />

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="space-y-8"
        >
          {/* ── KPI Cards Row ── */}
          <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {kpiCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <MainCard
                  key={idx}
                  className="p-6 border-l-4 hover:shadow-md transition-shadow"
                  style={{ borderLeftColor: card.accent }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="p-3 rounded-2xl"
                      style={{ backgroundColor: card.bg }}
                    >
                      <Icon size={20} style={{ color: card.accent }} />
                    </div>
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: card.bg, color: card.accent }}
                    >
                      {card.trend === "up" ? "✓ Good" : "⚠ Review"}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    {card.title}
                  </p>
                  <p className="text-3xl font-black text-[#03045e] mb-1">{card.value}</p>
                  <p className="text-[10px] font-bold text-gray-500">{card.sub}</p>
                  <p className="text-[9px] font-bold text-gray-400 mt-0.5">{card.secondarySub}</p>
                </MainCard>
              );
            })}
          </div>

          {/* ── Detailed Breakdowns ── */}
          <div className="grid grid-cols-1 lg:grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 items-start">

            {/* Assignments Breakdown */}
            <MainCard className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen size={17} className="text-[#0077b6]" />
                <h2 className="text-sm font-black text-[#03045e]">Recent Assignments</h2>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                Last {stats.assignments.length} of {stats.totalAssignments} total
              </p>
              {stats.assignments.length === 0 ? (
                <div className="py-8 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  No assignments created yet
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.assignments.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 bg-gray-50/60 rounded-2xl border border-gray-100 space-y-1"
                    >
                      <p className="text-xs font-black text-[#03045e] truncate">{a.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-gray-400 uppercase">{a.subjectName}</span>
                        <span className="text-[9px] font-black text-[#0077b6]">
                          {a.submissionsCount}/{a.totalStudents} submitted
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#00b4d8] rounded-full transition-all"
                          style={{
                            width: `${a.totalStudents > 0 ? Math.round((a.submissionsCount / a.totalStudents) * 100) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </MainCard>

            {/* Leave Status Breakdown */}
            <MainCard className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <CalendarOff size={17} className="text-[#d97706]" />
                <h2 className="text-sm font-black text-[#03045e]">Leave Summary</h2>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                All leave applications for your class
              </p>

              <div className="space-y-3">
                {[
                  { label: "Pending Review", value: stats.pendingLeaves, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
                  { label: "Approved", value: stats.approvedLeaves, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                  { label: "Rejected", value: stats.rejectedLeaves, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
                ].map((row) => {
                  const RowIcon = row.icon;
                  return (
                    <div
                      key={row.label}
                      className={`flex items-center justify-between p-3 rounded-2xl border ${row.bg} ${row.border}`}
                    >
                      <div className="flex items-center gap-2">
                        <RowIcon size={14} className={row.color} />
                        <span className={`text-xs font-black ${row.color}`}>{row.label}</span>
                      </div>
                      <span className={`text-xl font-black ${row.color}`}>{row.value}</span>
                    </div>
                  );
                })}
              </div>

              {stats.pendingLeaves > 0 && (
                <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest pt-2 border-t border-gray-100">
                  ⚠ {stats.pendingLeaves} application{stats.pendingLeaves > 1 ? "s" : ""} await{stats.pendingLeaves === 1 ? "s" : ""} your review
                </p>
              )}
            </MainCard>

            {/* Marks Coverage */}
            <MainCard className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText size={17} className="text-[#7c3aed]" />
                <h2 className="text-sm font-black text-[#03045e]">Marks Coverage</h2>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
                Examination marks submission status
              </p>

              {/* Coverage Arc */}
              <div className="flex flex-col items-center justify-center py-4">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ede9fe" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="none"
                      stroke="#7c3aed"
                      strokeWidth="3"
                      strokeDasharray={`${stats.totalExams > 0 ? Math.round((stats.examsWithMarks / stats.totalExams) * 100) : 0} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-[#03045e]">
                      {stats.totalExams > 0
                        ? Math.round((stats.examsWithMarks / stats.totalExams) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
                <p className="text-xs font-black text-[#03045e] mt-3">
                  {stats.examsWithMarks} / {stats.totalExams} exams covered
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                  {stats.totalMarksEntries} mark entries total
                </p>
              </div>

              {stats.examsWithMarks < stats.totalExams && stats.totalExams > 0 && (
                <div className="p-3 bg-violet-50 rounded-2xl border border-violet-100">
                  <p className="text-[9px] font-black text-violet-700 uppercase tracking-widest">
                    {stats.totalExams - stats.examsWithMarks} exam{stats.totalExams - stats.examsWithMarks > 1 ? "s" : ""} still need marks submission
                  </p>
                </div>
              )}
            </MainCard>

          </div>

          {/* Footer timestamp */}
          <div className="flex items-center justify-end gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
            <TrendingUp size={11} />
            <span>Report generated at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ReportsAnalyticsPage;
