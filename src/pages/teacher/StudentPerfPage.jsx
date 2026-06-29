import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAcademicOverview } from "../../services/studentPerformanceService";
import { getTeacherWorkload } from "../../services/teacherService";
import TeacherModuleHeader from "../../components/teacher/TeacherModuleHeader";
import PerformanceSummaryCards from "../../components/performance/PerformanceSummaryCards";
import StudentPerformanceTable from "../../components/performance/StudentPerformanceTable";
import StudentDetailPanel from "../../components/performance/StudentDetailPanel";
import { AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";

const StudentPerfPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const teacherId = user?.linkedEntityId || "teach-001";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overviewStats, setOverviewStats] = useState(null);
  const [teacherProfile, setTeacherProfile] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  const fetchPerformanceData = useCallback(async () => {
    setLoading(true);
    try {
      const [stats, workload] = await Promise.all([
        getAcademicOverview(teacherId),
        getTeacherWorkload(teacherId)
      ]);
      setOverviewStats(stats);
      setTeacherProfile(workload?.profile || null);
    } catch (err) {
      console.error("Failed to load teacher performance dashboard data:", err);
      setError("Failed to compile class performance records.");
    } finally {
      setLoading(false);
    }
  }, [teacherId]);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  return (
    <div className="space-y-8 pb-12">
      <TeacherModuleHeader
        titleKey="nav.student_perf"
        descriptionKey="studentPerf.moduleDesc"
        helperContentEn="Evaluate attendance consistencies, academic results, pending submissions, and log mentor observation reports."
        helperContentHi="कक्षा के छात्रों के शैक्षणिक प्रदर्शन, उपस्थिति दरों, लंबित असाइनमेंट की समीक्षा करें और मेंटर रिमार्क्स दर्ज करें।"
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00b4d8] mb-2"></div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t("studentPerf.aggregating", { fallback: "Aggregating Academic Data..." })}</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 p-6 rounded-2xl text-center">
          <p className="font-bold">{error}</p>
          <button 
            onClick={fetchPerformanceData} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:bg-indigo-700 transition"
          >
            {t("studentPerf.retry", { fallback: "Retry Aggregation" })}
          </button>
        </div>
      ) : (
        <>
          {/* 1. Statistics Aggregation Header Cards */}
          {overviewStats && <PerformanceSummaryCards stats={overviewStats} />}

          {/* 2. Interactive Search & Roster Grid */}
          {overviewStats && (
            <StudentPerformanceTable
              studentsData={overviewStats.studentsData || []}
              onSelectStudent={(id) => setSelectedStudentId(id)}
            />
          )}

          {/* 3. Detail Profile / Remark Form Sliding Drawer */}
          <AnimatePresence>
            {selectedStudentId && (
              <StudentDetailPanel
                studentId={selectedStudentId}
                teacherId={teacherId}
                teacherName={teacherProfile?.name || "Assigned Mentor"}
                onClose={() => setSelectedStudentId(null)}
                onRefresh={fetchPerformanceData}
              />
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default StudentPerfPage;
