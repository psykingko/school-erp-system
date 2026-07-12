import React, { useState, useMemo } from "react";
import PerformanceStatusBadge from "./PerformanceStatusBadge";
import { Search, SlidersHorizontal, AlertCircle, FileSpreadsheet, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

export default function StudentPerformanceTable({ studentsData, onSelectStudent }) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  const [selectedStream, setSelectedStream] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [showLowAttendance, setShowLowAttendance] = useState(false);
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // Extract unique classes and streams for dynamic drop-downs
  const classOptions = useMemo(() => {
    const classes = new Set(studentsData.map(s => s.className).filter(Boolean));
    return ["ALL", ...Array.from(classes).sort()];
  }, [studentsData]);

  const streamOptions = useMemo(() => {
    const streams = new Set(studentsData.map(s => s.streamName).filter(Boolean));
    return ["ALL", ...Array.from(streams).sort()];
  }, [studentsData]);

  // Filter students based on all states
  const filteredStudents = useMemo(() => {
    return studentsData.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admissionNo.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesClass = selectedClass === "ALL" || student.className === selectedClass;
      const matchesStream = selectedStream === "ALL" || student.streamName === selectedStream;
      const matchesStatus = selectedStatus === "ALL" || student.summary.status === selectedStatus;
      
      const matchesLowAttendance = !showLowAttendance || student.summary.attendancePct < 75;
      const matchesOverdue = !showOverdueOnly || student.summary.overdueAssignments > 0;

      return matchesSearch && matchesClass && matchesStream && matchesStatus && matchesLowAttendance && matchesOverdue;
    });
  }, [studentsData, searchQuery, selectedClass, selectedStream, selectedStatus, showLowAttendance, showOverdueOnly]);

  return (
    <div className="space-y-6">
      {/* Search & Filters Panel */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder={t("perf.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-sm focus:outline-none focus:border-indigo-200 transition-colors"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest bg-gray-50/50 px-3 py-1.5 rounded-xl border border-gray-100">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </div>
            
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-xs cursor-pointer focus:outline-none focus:border-indigo-100"
            >
              <option value="ALL">{t("perf.allClasses")}</option>
              {classOptions.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>

            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-xs cursor-pointer focus:outline-none focus:border-indigo-100 w-full flex-1 min-w-0 md:max-w-[180px] truncate"
            >
              <option value="ALL">{t("perf.allStreams")}</option>
              {streamOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-100 bg-gray-50/50 text-[#03045e] font-bold text-xs cursor-pointer focus:outline-none focus:border-indigo-100"
            >
              <option value="ALL">{t("perf.allStatuses")}</option>
              <option value="Excellent">{t("status.Excellent")}</option>
              <option value="Good">{t("status.Good")}</option>
              <option value="Warning">{t("status.Warning")}</option>
              <option value="At Risk">{t("status.At Risk")}</option>
            </select>
          </div>
        </div>

        {/* Alarm Toggle Checkboxes */}
        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-gray-50">
          <label className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showLowAttendance}
              onChange={(e) => setShowLowAttendance(e.target.checked)}
              className="rounded text-rose-500 focus:ring-rose-200 border-gray-200 cursor-pointer w-4 h-4"
            />
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Critical Low Attendance (&lt;75%)
            </span>
          </label>

          <label className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showOverdueOnly}
              onChange={(e) => setShowOverdueOnly(e.target.checked)}
              className="rounded text-amber-500 focus:ring-amber-200 border-gray-200 cursor-pointer w-4 h-4"
            />
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Overdue Assignments Only
            </span>
          </label>
        </div>
      </div>

      {/* Main Grid / Table */}
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-400 font-bold">No students match the active search and filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("perf.colStudentInfo")}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{t("perf.colAttendance")}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{t("perf.colAssignments")}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{t("perf.colAvgMarks")}</th>
                  <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("perf.colStatus")}</th>
                  <th className="px-6 py-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredStudents.map((student) => {
                  const summary = student.summary;
                  const isCritical = summary.attendancePct < 75 || summary.overdueAssignments > 0;
                  
                  return (
                    <motion.tr
                      key={student.id}
                      onClick={() => onSelectStudent(student.id)}
                      className={`hover:bg-indigo-50/20 cursor-pointer transition-colors duration-200 ${
                        isCritical ? "bg-rose-50/5" : ""
                      }`}
                      whileHover={{ scale: 1.002 }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#03045e] text-sm hover:text-indigo-600 transition-colors">
                            {student.name}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                            {t("perf.adm")} {student.admissionNo} • {t("common.class")} {student.className}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-sm font-black ${
                            summary.attendancePct < 75 ? "text-rose-600" :
                            summary.attendancePct < 85 ? "text-amber-500" : "text-emerald-600"
                          }`}>
                            {summary.attendancePct}%
                          </span>
                          <div className="w-16 h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                summary.attendancePct < 75 ? "bg-rose-500" :
                                summary.attendancePct < 85 ? "bg-amber-400" : "bg-emerald-500"
                              }`}
                              style={{ width: `${summary.attendancePct}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`text-xs font-black ${
                            summary.overdueAssignments > 0 ? "text-amber-600" : "text-gray-700"
                          }`}>
                            {summary.submittedAssignments} / {summary.totalAssignments}
                          </span>
                          <span className="text-[9px] font-black uppercase tracking-wider mt-0.5 text-gray-400">
                            {summary.overdueAssignments > 0 ? (
                              <span className="text-rose-500 font-bold">{summary.overdueAssignments} {t("perf.overdue")}</span>
                            ) : t("perf.complete")}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className={`text-sm font-black ${
                            summary.averageMarksPct < 65 ? "text-rose-600" :
                            summary.averageMarksPct < 75 ? "text-amber-500" : "text-[#03045e]"
                          }`}>
                            {summary.averageMarksPct > 0 ? `${summary.averageMarksPct}%` : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <PerformanceStatusBadge status={summary.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
