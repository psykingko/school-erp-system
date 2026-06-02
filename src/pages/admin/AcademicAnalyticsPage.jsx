import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Award, CheckCircle } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import OperationsStatCard from "../../components/admin/operations/OperationsStatCard";
import AcademicSummaryCard from "../../components/admin/analytics/AcademicSummaryCard";
import AnalyticsCard from "../../components/admin/analytics/AnalyticsCard";
import AnalyticsFilterBar from "../../components/admin/analytics/AnalyticsFilterBar";
import AdminDataTable from "../../components/admin/AdminDataTable";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import { getDataProvider } from "../../data";

const AcademicAnalyticsPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const allClasses = await getDataProvider().getClasses();
      setClasses(allClasses || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const demoPerformanceList = [
    {
      classId: "class-11a",
      className: "Class 11-A",
      averageScore: 89.2,
      passRate: 100,
      examStatus: "Completed",
    },
    {
      classId: "class-11b",
      className: "Class 11-B",
      averageScore: 82.4,
      passRate: 98,
      examStatus: "Completed",
    },
    {
      classId: "class-12a",
      className: "Class 12-A",
      averageScore: 91.8,
      passRate: 100,
      examStatus: "Completed",
    },
  ];

  const filteredPerformances = demoPerformanceList.filter((dp) => {
    return selectedClass === "" || dp.classId === selectedClass;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Academic Performance Analytics"
        description="Verify class grading benchmarks, trace subject pass rates, and monitor examination completion indexes."
        breadcrumbs={["Admin Portal", "Analytics", "Academics"]}
      />

      {/* Roster Strengths stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <OperationsStatCard
          title="Optimal Pass Index"
          value="98.6%"
          description="School-wide academic compliance"
          icon={GraduationCap}
        />
        <OperationsStatCard
          title="Exam Syllabus Checked"
          value="100%"
          description="Completed assessments verify rate"
          icon={GraduationCap}
          color="#0096c7"
          bg="#ade8f4"
        />
        <OperationsStatCard
          title="Classroom A+ Toppers"
          value="12 Nominees"
          description="Honored in students laurels feed"
          icon={GraduationCap}
          color="#03045e"
          bg="#e0f2fe"
        />
      </div>

      {/* Segment filters */}
      <AnalyticsFilterBar
        selectedClass={selectedClass}
        onClassChange={setSelectedClass}
        classes={classes}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Academic averages card */}
        <div className="lg:col-span-2">
          <AcademicSummaryCard
            title="School Term Performance Summary"
            passRate="98.6%"
            examCount={4}
            toppersCount={12}
            classScores={demoPerformanceList.map((dp) => ({
              name: dp.className,
              averageGrade: `${dp.averageScore}%`,
            }))}
          />
        </div>

        {/* Dynamic subject performance highlights */}
        <AnalyticsCard title="Subject Pass Index Rankings">
          <div className="space-y-4">
            {[
              { subject: "Mathematics", rate: 96, grade: "A" },
              { subject: "Physics", rate: 94, grade: "A" },
              { subject: "Chemistry", rate: 98, grade: "A+" },
              { subject: "Computer Science", rate: 100, grade: "A+" },
            ].map((sub, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                  <span className="text-gray-500 font-semibold">
                    {sub.subject}
                  </span>
                  <span className="text-[#0077b6] font-black">
                    {sub.rate}% (Avg: {sub.grade})
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#00b4d8]"
                    style={{ width: `${sub.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AnalyticsCard>
      </div>

      {/* Detailed grades ledger table */}
      <AdminSectionCard title="Section Performance Averages Ledger">
        <AdminDataTable
          headers={[
            "Class Section",
            "Average Exam Grade Score",
            "Class Pass Rate Percentage",
            "Term Assessment Completion",
            "Status Flag",
          ]}
          items={filteredPerformances}
          isEmpty={filteredPerformances.length === 0}
          renderRow={(dp) => (
            <tr
              key={dp.classId}
              className="hover:bg-[#caf0f8]/10 transition-colors text-xs text-gray-700 font-bold border-b border-[#caf0f8]/40"
            >
              <td className="py-4 px-3 text-[#03045e] font-black first:pl-2">
                {dp.className}
              </td>
              <td className="py-4 px-3 text-gray-800 font-extrabold">
                {dp.averageScore}%
              </td>
              <td className="py-4 px-3 text-emerald-600 font-extrabold">
                {dp.passRate}% Pass
              </td>
              <td className="py-4 px-3 text-gray-500 font-semibold">
                {dp.examStatus}
              </td>
              <td className="py-4 px-3 last:pr-2">
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-100">
                  Nominal Health
                </span>
              </td>
            </tr>
          )}
        />
      </AdminSectionCard>
    </motion.div>
  );
};

export default AcademicAnalyticsPage;
