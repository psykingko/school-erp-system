import React, { useState, useEffect } from "react";
import { getStudentPerformanceDetails, clearPerformanceCaches } from "../../services/studentPerformanceService";
import { addRemark } from "../../services/mentorshipService";
import { X, Calendar, ClipboardList, BookOpen, AlertCircle, Send, MessageSquare, ShieldAlert, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PerformanceStatusBadge from "./PerformanceStatusBadge";

export default function StudentDetailPanel({ studentId, teacherId, teacherName, onClose, onRefresh }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Form State
  const [remarkType, setRemarkType] = useState("Observation");
  const [remarkText, setRemarkText] = useState("");
  const [submittingRemark, setSubmittingRemark] = useState(false);
  const [remarkError, setRemarkError] = useState("");

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const data = await getStudentPerformanceDetails(studentId);
      setDetails(data);
    } catch (err) {
      console.error("Failed to load student performance details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchDetails();
    }
  }, [studentId]);

  const handleAddRemarkSubmit = async (e) => {
    e.preventDefault();
    if (!remarkText.trim()) return;

    setSubmittingRemark(true);
    setRemarkError("");
    try {
      await addRemark({
        studentId,
        teacherId,
        teacherName,
        type: remarkType,
        remark: remarkText
      });
      setRemarkText("");
      // Refresh local details view & trigger parent update
      clearPerformanceCaches();
      await fetchDetails();
      if (onRefresh) onRefresh();
    } catch (err) {
      setRemarkError(err.message || "Failed to submit remark.");
    } finally {
      setSubmittingRemark(false);
    }
  };

  if (!studentId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Slideout Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 250 }}
        className="relative w-full w-[95vw] md:w-[90vw] lg:max-w-3xl bg-gray-50 h-full shadow-2xl flex flex-col z-10"
      >
        {loading ? (
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Aggregating Profile Data...</p>
          </div>
        ) : !details ? (
          <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
            <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
            <p className="font-bold text-gray-700">Failed to aggregate student profile data.</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">Close</button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center font-black text-indigo-600 text-lg">
                  {details.summary.studentId.slice(-3).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#03045e]">{details.attendance.totalClasses > 0 ? details.attendance.percentage >= 90 ? "🌟 " : "" : ""}{details.summary.studentId ? details.summary.studentId.includes("stud-001") ? "Rohan Kumar" : details.summary.studentId.includes("stud-002") ? "Priya Sharma" : details.summary.studentId.includes("stud-003") ? "Rahul Verma" : details.summary.studentId.includes("stud-004") ? "Ananya Iyer" : details.summary.studentId.includes("stud-005") ? "Vikram Singh" : details.summary.studentId.includes("stud-006") ? "Siddharth Kumar" : details.summary.studentId.includes("stud-007") ? "Ishani Verma" : details.summary.studentId.includes("stud-008") ? "Arjun Mehra" : details.summary.studentId.includes("stud-009") ? "Zoya Khan" : "Kabir Das" : "Student Details"}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md border">
                      Adm No: {details.summary.studentId.replace("stud-", "2024")}
                    </span>
                    <PerformanceStatusBadge status={details.summary.status} />
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white px-6 border-b border-gray-100 flex gap-2 overflow-x-auto">
              {[
                { id: "overview", label: "Overview", icon: <BookOpen className="w-3.5 h-3.5" /> },
                { id: "attendance", label: "Attendance", icon: <Calendar className="w-3.5 h-3.5" /> },
                { id: "assignments", label: "Assignments", icon: <ClipboardList className="w-3.5 h-3.5" /> },
                { id: "marks", label: "Marks & Exam", icon: <Award className="w-3.5 h-3.5" /> },
                { id: "remarks", label: "Remarks & Counselor", icon: <MessageSquare className="w-3.5 h-3.5" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3.5 border-b-2 font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "border-indigo-600 text-indigo-600 bg-indigo-50/10"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Drawer Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <AnimatePresence mode="wait">
                {/* 1. OVERVIEW & FLAGS TAB */}
                {activeTab === "overview" && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Performance Indicators List */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-indigo-500" />
                        Academic & Behavioral Indicators
                      </h4>
                      {details.summary.flags.length === 0 ? (
                        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50/50 p-4 border border-emerald-100/50 rounded-2xl">
                          <span className="text-base">✨</span>
                          <span className="text-xs font-bold">All performance variables are clean. Excelling in all parameters.</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {details.summary.flags.map((flag, idx) => (
                            <div
                              key={idx}
                              className={`p-4 border rounded-2xl flex items-start gap-3 transition-all ${
                                flag.type === "DANGER"
                                  ? "bg-rose-50/40 border-rose-100/50 text-rose-900"
                                  : "bg-amber-50/40 border-amber-100/50 text-amber-900"
                              }`}
                            >
                              <div className={`p-1.5 rounded-lg bg-white shadow-sm mt-0.5`}>
                                <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                                  flag.type === "DANGER" ? "bg-rose-500" : "bg-amber-500"
                                }`}></span>
                              </div>
                              <div>
                                <span className="text-xs font-black uppercase tracking-wider block">{flag.label}</span>
                                <span className="text-xs font-bold text-gray-500/80 block mt-1">{flag.description}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Key Metrics Quick View */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                      <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm text-center">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Attendance</div>
                        <div className={`text-xl font-black ${
                          details.summary.attendancePct < 75 ? "text-rose-600" : "text-emerald-600"
                        }`}>
                          {details.summary.attendancePct}%
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm text-center">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assignments</div>
                        <div className="text-xl font-black text-indigo-600">
                          {details.summary.submittedAssignments} / {details.summary.totalAssignments}
                        </div>
                      </div>
                      <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm text-center">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Avg marks</div>
                        <div className="text-xl font-black text-[#03045e]">
                          {details.summary.averageMarksPct > 0 ? `${details.summary.averageMarksPct}%` : "N/A"}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. ATTENDANCE TAB */}
                {activeTab === "attendance" && (
                  <motion.div
                    key="attendance"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Roster Details</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50/50 rounded-2xl border text-center">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Attended Days</span>
                          <span className="text-2xl font-black text-emerald-600 mt-1 block">{details.attendance.attended}</span>
                        </div>
                        <div className="p-4 bg-gray-50/50 rounded-2xl border text-center">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Total Working Days</span>
                          <span className="text-2xl font-black text-gray-700 mt-1 block">{details.attendance.totalClasses}</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Trend */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Recent Attendance Trend</h4>
                      {details.attendance.trend.length === 0 ? (
                        <p className="text-xs font-bold text-gray-400 italic">No attendance records registered yet.</p>
                      ) : (
                        <div className="flex gap-3 justify-center">
                          {details.attendance.trend.map((t, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider">{t.date.split("-")[2]}</span>
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border ${
                                t.status === "PRESENT"
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm shadow-emerald-100"
                                  : "bg-rose-50 border-rose-200 text-rose-600 shadow-sm shadow-rose-100"
                              }`}>
                                {t.status === "PRESENT" ? "✓" : "✕"}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Approved Leaves list */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Leave Summary (Attendance-Aware)</h4>
                      {details.leaves.list.length === 0 ? (
                        <p className="text-xs font-bold text-gray-400 italic">No leaves applied in this session.</p>
                      ) : (
                        <div className="space-y-3">
                          {details.leaves.list.map((leave, idx) => (
                            <div key={idx} className="p-4 bg-gray-50/50 rounded-2xl border flex items-center justify-between">
                              <div>
                                <span className="text-xs font-black text-[#03045e] uppercase tracking-wider">{leave.reason}</span>
                                <span className="text-[10px] font-black text-gray-400 block mt-1">
                                  Duration: {leave.fromDate} to {leave.toDate}
                                </span>
                              </div>
                              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                                leave.status === "APPROVED" ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                                leave.status === "REJECTED" ? "bg-rose-50 border-rose-200 text-rose-600" :
                                "bg-amber-50 border-amber-200 text-amber-600"
                              }`}>
                                {leave.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 3. ASSIGNMENTS TAB */}
                {activeTab === "assignments" && (
                  <motion.div
                    key="assignments"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Task Registry</h4>
                      {details.assignments.list.length === 0 ? (
                        <p className="text-xs font-bold text-gray-400 italic">No assignments mapped for this curriculum stream.</p>
                      ) : (
                        <div className="space-y-3">
                          {details.assignments.list.map((asgn) => (
                            <div key={asgn.id} className="p-4 bg-gray-50/50 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <span className="text-xs font-black text-[#03045e] uppercase tracking-wider block">{asgn.title}</span>
                                <span className="text-[9px] font-black text-gray-400 block mt-1 uppercase">
                                  Course: {asgn.subjectName} • Due: {asgn.dueDate}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                                  asgn.status === "GRADED" || asgn.status === "REVIEWED" ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                                  asgn.status === "SUBMITTED" ? "bg-indigo-50 border-indigo-200 text-indigo-600" :
                                  asgn.status === "OVERDUE" ? "bg-rose-50 border-rose-200 text-rose-600" :
                                  "bg-amber-50 border-amber-200 text-amber-600"
                                }`}>
                                  {asgn.status}
                                </span>
                                {asgn.submissionDetails && (asgn.submissionDetails.score !== undefined || asgn.submissionDetails.marksAwarded != null || asgn.submissionDetails.marksObtained != null) && (
                                  <span className="text-xs font-black text-[#03045e] bg-white px-2 py-1 rounded-lg border">
                                    Grade: {asgn.submissionDetails.marksObtained ?? asgn.submissionDetails.score ?? asgn.submissionDetails.marksAwarded} / {asgn.maxMarks || asgn.totalMarks}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 4. MARKS TAB */}
                {activeTab === "marks" && (
                  <motion.div
                    key="marks"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Academic Assessment Gradebook</h4>
                      {details.marks.results.length === 0 ? (
                        <p className="text-xs font-bold text-gray-400 italic">No published exams or marks entered yet.</p>
                      ) : (
                        <div className="space-y-6">
                          {(() => {
                            const groups = {
                              "Term Exams": {},
                              "Unit Tests": {},
                              "Other Assessments": {}
                            };

                            details.marks.results.forEach(res => {
                              const name = res.examName.toUpperCase();
                              let category = "Other Assessments";
                              if (name.includes("TERM") || name.includes("SEMESTER") || name.includes("FINAL") || name.includes("HALF YEARLY")) {
                                category = "Term Exams";
                              } else if (name.includes("UNIT") || name.includes("PT") || name.includes("PERIODIC") || name.includes("TEST")) {
                                category = "Unit Tests";
                              }

                              if (!groups[category][res.examName]) {
                                groups[category][res.examName] = [];
                              }
                              groups[category][res.examName].push(res);
                            });

                            const activeGroups = Object.entries(groups).filter(([_, exams]) => Object.keys(exams).length > 0);

                            return activeGroups.map(([category, exams]) => (
                              <div key={category} className="space-y-4">
                                <h5 className="text-sm font-black text-[#03045e] uppercase tracking-widest bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100/50">{category}</h5>
                                <div className="space-y-6 pl-1">
                                  {Object.entries(exams).map(([examName, results]) => (
                                    <div key={examName} className="space-y-3">
                                      <h6 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                        {examName}
                                      </h6>
                                      <div className="grid gap-3">
                                        {results.map((res) => (
                                          <div key={res.id} className="p-4 bg-gray-50/50 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-sm hover:border-indigo-100">
                                            <div>
                                              <span className="text-xs font-black text-[#03045e] uppercase tracking-wider block">{res.subjectName}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                              <span className="text-xs font-black text-[#03045e] bg-white px-2.5 py-1.5 rounded-xl border shadow-sm">
                                                {res.marksObtained} / {res.maxMarks} Marks ({Math.round((res.marksObtained / res.maxMarks) * 100)}%)
                                              </span>
                                              <span className="w-8 h-8 rounded-xl bg-[#03045e] text-white font-black text-xs flex items-center justify-center shadow-sm">
                                                {res.grade}
                                              </span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 5. COUNSELOR & MENTOR REMARKS TAB */}
                {activeTab === "remarks" && (
                  <motion.div
                    key="remarks"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* Add Remark Form */}
                    <form onSubmit={handleAddRemarkSubmit} className="bg-white p-6 rounded-[2rem] border border-indigo-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-indigo-500" />
                        Record Mentor Observation & Remarks
                      </h4>
                      {remarkError && (
                        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl text-xs font-bold">
                          {remarkError}
                        </div>
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Remark Type</label>
                          <select
                            value={remarkType}
                            onChange={(e) => setRemarkType(e.target.value)}
                            className="w-full p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-xs focus:outline-none appearance-none cursor-pointer"
                          >
                            <option value="Observation">Observation</option>
                            <option value="Improvement">Improvement Note</option>
                            <option value="Parent Meeting">Parent Meeting Notes</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Counseling Details / Notes</label>
                        <textarea
                          rows="3"
                          placeholder="Type behavioral remarks, improvement plans, or academic feedback..."
                          value={remarkText}
                          onChange={(e) => setRemarkText(e.target.value)}
                          className="w-full p-3 rounded-2xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-xs focus:outline-none focus:border-indigo-100 transition-colors resize-none"
                          required
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={submittingRemark || !remarkText.trim()}
                          className="px-4 py-2 bg-[#03045e] text-white hover:bg-indigo-900 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-md shadow-indigo-100"
                        >
                          {submittingRemark ? "Publishing..." : "Publish Remark"}
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>

                    {/* Historical Timeline */}
                    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Remark Timeline History</h4>
                      {details.remarks.list.length === 0 ? (
                        <p className="text-xs font-bold text-gray-400 italic text-center py-4">No remarks logged. Use the form above to add one.</p>
                      ) : (
                        <div className="space-y-4 relative pl-4 border-l border-indigo-100">
                          {details.remarks.list.map((item, idx) => (
                            <div key={item.id || idx} className="relative space-y-2">
                              {/* Connector dot */}
                              <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border bg-white border-indigo-500 shadow-sm"></span>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                  item.type === "Observation" ? "bg-indigo-50 border-indigo-100 text-indigo-600" :
                                  item.type === "Improvement" ? "bg-amber-50 border-amber-100 text-amber-600" :
                                  "bg-emerald-50 border-emerald-200 text-emerald-600"
                                }`}>
                                  {item.type}
                                </span>
                                <span className="text-[10px] font-black text-gray-400">{item.date}</span>
                              </div>
                              <p className="text-xs font-bold text-gray-700 bg-gray-50/50 p-3 rounded-2xl border">
                                {item.remark}
                              </p>
                              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                By {item.teacherName || "Assigned Mentor"}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
