import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap,
  TrendingUp,
  Users,
  BookOpen,
  Award,
  FileText,
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit3,
  Printer,
  Eye,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Clock,
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import OperationsStatCard from "../../components/admin/operations/OperationsStatCard";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import { getDataProvider } from "../../data";

// ─── Grade Configuration ───────────────────────────────────────────────────
const GRADE_SCALE = [
  { grade: "A+", min: 90, max: 100, color: "#10b981", label: "Outstanding" },
  { grade: "A", min: 80, max: 89, color: "#00b4d8", label: "Excellent" },
  { grade: "B+", min: 70, max: 79, color: "#0077b6", label: "Very Good" },
  { grade: "B", min: 60, max: 69, color: "#6b7280", label: "Good" },
  { grade: "C", min: 50, max: 59, color: "#f59e0b", label: "Average" },
  { grade: "D", min: 40, max: 49, color: "#ef4444", label: "Below Average" },
  { grade: "F", min: 0, max: 39, color: "#dc2626", label: "Fail" },
];

const getGradeFromMarks = (marks, maxMarks = 100) => {
  const percentage = (marks / maxMarks) * 100;
  return (
    GRADE_SCALE.find((g) => percentage >= g.min && percentage <= g.max) ||
    GRADE_SCALE[6]
  );
};

// ─── StudentPerformanceRow Component ───────────────────────────────────────
const StudentPerformanceRow = ({ student, onViewProfile, onPrintReport }) => {
  const [expanded, setExpanded] = useState(false);

  const hasSubjects = student.subjects && student.subjects.length > 0;
  const overallPercent = student.overallPercent || 0;
  const grade = hasSubjects ? getGradeFromMarks(overallPercent) : null;

  return (
    <div className="border-2 border-slate-100 rounded-2xl overflow-hidden mb-3">
      {/* Header Row */}
      <div
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
          expanded ? "bg-sky-50/50" : "bg-white hover:bg-slate-50"
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-shrink-0">
          {expanded ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-black text-[#03045e]">
              {student.name}
            </h4>
            <span className="text-[10px] font-bold text-slate-400">
              {student.admissionNo}
            </span>
            {hasSubjects ? (
              <span
                className="text-[9px] font-black px-2 py-0.5 rounded"
                style={{
                  backgroundColor: `${grade.color}20`,
                  color: grade.color,
                  border: `1px solid ${grade.color}40`,
                }}
              >
                {grade.grade} - {grade.label}
              </span>
            ) : (
              <span className="text-[9px] font-black text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                Not Graded
              </span>
            )}
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">
            Class {student.className}
            {hasSubjects
              ? ` · ${student.subjects.length} Subjects`
              : " · No Results Recorded"}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="hidden sm:flex items-center gap-2 w-48">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: hasSubjects ? `${overallPercent}%` : "0%",
                backgroundColor: hasSubjects ? grade.color : "#cbd5e1",
              }}
            />
          </div>
          <span className="text-[10px] font-black text-slate-500 w-10 text-right">
            {overallPercent.toFixed(1)}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProfile(student);
            }}
            className="p-2 hover:bg-sky-100 rounded-xl transition-colors text-[#0077b6]"
            title="View Profile"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrintReport(student);
            }}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
            title="Print Report"
          >
            <Printer size={16} />
          </button>
        </div>
      </div>

      {/* Expanded Subject Details */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/50">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {student.subjects?.map((sub, index) => {
              const subGrade = getGradeFromMarks(
                sub.marksObtained,
                sub.maxMarks,
              );
              const percent = (
                (sub.marksObtained / sub.maxMarks) *
                100
              ).toFixed(0);
              return (
                <div
                  key={`${sub.subjectId}-${index}`}
                  className="bg-white border border-slate-200 rounded-xl p-3"
                >
                  <p className="text-[9px] font-black text-slate-400 uppercase">
                    {sub.subjectName}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-lg font-black"
                      style={{ color: subGrade.color }}
                    >
                      {subGrade.grade}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {sub.marksObtained}/{sub.maxMarks}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: subGrade.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Academic Performance Page ────────────────────────────────────────
const AcademicPerformancePage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClassLevel, setSelectedClassLevel] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const provider = getDataProvider();
      const [allStudents, allClasses, allSubjects, allResults, allExams] =
        await Promise.all([
          provider.getStudents(),
          provider.getClasses(),
          provider.getSubjects(),
          provider.getResults(),
          provider.getExams(),
        ]);
      setStudents(allStudents || []);
      setClasses(allClasses || []);
      setSubjects(allSubjects || []);
      setResults(allResults || []);
      setExams(allExams || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Build student performance data
  const studentPerformanceData = useMemo(() => {
    return students.map((student) => {
      const cls = classes.find((c) => c.id === student.classId);
      const studentResults = results.filter((r) => r.studentId === student.id);

      const subjectsData = studentResults.map((res) => {
        const sub = subjects.find((s) => s.id === res.subjectId);
        return {
          subjectId: res.subjectId,
          subjectName: sub?.name || "Unknown",
          marksObtained: res.marksObtained || 0,
          maxMarks: res.maxMarks || 100,
          grade: res.grade || "-",
        };
      });

      const totalMarks = subjectsData.reduce(
        (sum, s) => sum + s.marksObtained,
        0,
      );
      const totalMax = subjectsData.reduce((sum, s) => sum + s.maxMarks, 0);
      const overallPercent = totalMax > 0 ? (totalMarks / totalMax) * 100 : 0;

      return {
        id: student.id,
        name: student.name,
        admissionNo: student.admissionNo || student.id,
        classId: student.classId,
        className: cls?.name || "N/A",
        subjects: subjectsData,
        overallPercent,
        totalMarks,
        totalMax,
      };
    });
  }, [students, classes, subjects, results]);

  // Get unique class levels and sections
  const classLevels = useMemo(() => {
    const levels = [...new Set(classes.map((c) => c.level))];
    return levels.sort((a, b) => {
      const order = [
        "Nursery",
        "LKG",
        "UKG",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
      ];
      return order.indexOf(a) - order.indexOf(b);
    });
  }, [classes]);

  const availableSections = useMemo(() => {
    if (!selectedClassLevel) return [];
    const sections = classes
      .filter((c) => c.level === selectedClassLevel)
      .map((c) => c.section)
      .filter(Boolean);
    return [...new Set(sections)].sort();
  }, [classes, selectedClassLevel]);

  // Filtered data
  const filteredStudents = useMemo(() => {
    return studentPerformanceData.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());

      const cls = classes.find((c) => c.id === s.classId);
      const matchesClassLevel =
        selectedClassLevel === "" || cls?.level === selectedClassLevel;
      const matchesSection =
        selectedSection === "" || cls?.section === selectedSection;

      return matchesSearch && matchesClassLevel && matchesSection;
    });
  }, [
    studentPerformanceData,
    searchTerm,
    selectedClassLevel,
    selectedSection,
    classes,
  ]);

  // Stats based on filtered students
  const stats = useMemo(() => {
    const totalStudents = filteredStudents.length;
    const studentsWithResults = filteredStudents.filter(
      (s) => s.subjects.length > 0,
    ).length;
    const averagePercent =
      filteredStudents.length > 0
        ? filteredStudents.reduce((sum, s) => sum + s.overallPercent, 0) /
          filteredStudents.length
        : 0;

    const studentsWithGrades = filteredStudents.filter(
      (s) => s.subjects.length > 0,
    );
    const gradeDistribution = GRADE_SCALE.map((g) => ({
      ...g,
      count: studentsWithGrades.filter((s) => {
        const grade = getGradeFromMarks(s.overallPercent);
        return grade.grade === g.grade;
      }).length,
    }));

    return {
      totalStudents,
      studentsWithResults,
      averagePercent: averagePercent.toFixed(1),
      gradeDistribution,
    };
  }, [filteredStudents]);

  const handleViewProfile = (student) => {
    // Could open a modal with detailed student profile
    console.log("View profile:", student);
  };

  const handlePrintReport = (student) => {
    // Could trigger print dialog
    console.log("Print report:", student);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0077b6]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Academic Performance Center"
        description="Comprehensive academic management - student results, gradebook, reports, and analytics."
        breadcrumbs={["Admin Portal", "Academics", "Performance"]}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OperationsStatCard
          title="Total Students"
          value={stats.totalStudents.toString()}
          description={`${stats.studentsWithResults} with results recorded`}
          icon={Users}
          color="#0077b6"
          bg="#caf0f8"
        />
        <OperationsStatCard
          title="School Average"
          value={`${stats.averagePercent}%`}
          description="Overall performance index"
          icon={TrendingUp}
          color="#00b4d8"
          bg="#ade8f4"
        />
        <OperationsStatCard
          title="Top Performers"
          value={stats.gradeDistribution?.[0]?.count?.toString() || "0"}
          description="A+ Grade students"
          icon={Award}
          color="#10b981"
          bg="#d1fae5"
        />
        <OperationsStatCard
          title="Need Attention"
          value={
            stats.gradeDistribution
              ?.slice(-2)
              ?.reduce((a, b) => a + b.count, 0)
              ?.toString() || "0"
          }
          description="Below average performance"
          icon={AlertCircle}
          color="#ef4444"
          bg="#fee2e2"
        />
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-slate-100">
        {[
          { id: "overview", label: "Student Overview", icon: Users },
          { id: "analytics", label: "Performance Analytics", icon: BarChart3 },
          { id: "reports", label: "Reports & Cards", icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-black transition-colors border-b-2 -mb-0.5 ${
              activeTab === tab.id
                ? "border-[#0077b6] text-[#0077b6]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-4 rounded-2xl">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name or admission no..."
                className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-100 rounded-xl text-xs font-bold text-[#03045e] placeholder:text-slate-400 outline-none focus:border-[#0077b6] transition-colors bg-white"
              />
            </div>

            {/* Class Level Filter */}
            <select
              value={selectedClassLevel}
              onChange={(e) => {
                setSelectedClassLevel(e.target.value);
                setSelectedSection(""); // Reset section when class level changes
              }}
              className="border-2 border-slate-100 hover:border-[#0077b6] px-4 py-2.5 rounded-xl text-xs font-bold text-[#03045e] outline-none transition-colors bg-white"
            >
              <option value="">All Class Levels</option>
              {classLevels.map((level) => (
                <option key={level} value={level}>
                  {["Nursery", "LKG", "UKG"].includes(level)
                    ? level
                    : `Class ${level}`}
                </option>
              ))}
            </select>

            {/* Section Filter - always visible */}
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={!selectedClassLevel}
              className="border-2 border-slate-100 hover:border-[#0077b6] px-4 py-2.5 rounded-xl text-xs font-bold text-[#03045e] outline-none transition-colors bg-white disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {selectedClassLevel ? (
                availableSections.length > 0 ? (
                  <>
                    <option value="">All Sections</option>
                    {availableSections.map((section) => (
                      <option key={section} value={section}>
                        Section {section}
                      </option>
                    ))}
                  </>
                ) : (
                  <option value="">No Sections</option>
                )
              ) : (
                <option value="">Select Class Level First</option>
              )}
            </select>

            <div className="text-xs font-bold text-slate-400">
              Showing {filteredStudents.length} of{" "}
              {studentPerformanceData.length} students
            </div>
          </div>

          {/* Student List */}
          <AdminSectionCard title="Student Academic Records">
            {filteredStudents.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl">
                <Users size={48} className="mx-auto text-slate-300 mb-3" />
                <h4 className="text-sm font-black text-[#03045e]">
                  No Students Found
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust filters to see more results.
                </p>
              </div>
            ) : (
              <div>
                {filteredStudents.map((student) => (
                  <StudentPerformanceRow
                    key={student.id}
                    student={student}
                    onViewProfile={handleViewProfile}
                    onPrintReport={handlePrintReport}
                  />
                ))}
              </div>
            )}
          </AdminSectionCard>
        </div>
      )}

      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Grade Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AdminSectionCard title="Grade Distribution">
              <div className="space-y-3">
                {stats.gradeDistribution?.map((grade) => (
                  <div key={grade.grade} className="flex items-center gap-3">
                    <span
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
                      style={{
                        backgroundColor: `${grade.color}20`,
                        color: grade.color,
                      }}
                    >
                      {grade.grade}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-600">
                          {grade.label}
                        </span>
                        <span className="text-xs font-black text-slate-500">
                          {grade.count} students
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${stats.studentsWithResults > 0 ? (grade.count / stats.studentsWithResults) * 100 : 0}%`,
                            backgroundColor: grade.color,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-400 w-10 text-right">
                      {stats.studentsWithResults > 0
                        ? (
                            (grade.count / stats.studentsWithResults) *
                            100
                          ).toFixed(0)
                        : 0}
                      %
                    </span>
                  </div>
                ))}
              </div>
            </AdminSectionCard>

            <AdminSectionCard title="Class Performance Comparison">
              <div className="space-y-3">
                {classes
                  .filter((cls) => {
                    const matchesLevel =
                      selectedClassLevel === "" ||
                      cls.level === selectedClassLevel;
                    const matchesSection =
                      selectedSection === "" || cls.section === selectedSection;
                    return matchesLevel && matchesSection;
                  })
                  .map((cls) => {
                    const classStudents = studentPerformanceData.filter(
                      (s) => s.classId === cls.id,
                    );
                    const classAvg =
                      classStudents.length > 0
                        ? classStudents.reduce(
                            (sum, s) => sum + s.overallPercent,
                            0,
                          ) / classStudents.length
                        : 0;
                    return (
                      <div key={cls.id} className="flex items-center gap-3">
                        <span className="w-16 text-xs font-black text-slate-600">
                          {cls.name}
                        </span>
                        <div className="flex-1">
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0077b6] rounded-full transition-all"
                              style={{ width: `${classAvg}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-black text-slate-500 w-12 text-right">
                          {classAvg.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
              </div>
            </AdminSectionCard>
          </div>
        </div>
      )}

      {activeTab === "reports" && (
        <div className="space-y-6">
          <AdminSectionCard title="Report Cards & Academic Reports">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  title: "Individual Report Card",
                  desc: "Generate student-wise report cards",
                  icon: FileText,
                },
                {
                  title: "Class-wise Merit List",
                  desc: "Rank students by overall performance",
                  icon: Award,
                },
                {
                  title: "Subject-wise Analysis",
                  desc: "Detailed subject performance report",
                  icon: BarChart3,
                },
                {
                  title: "Consolidated Result",
                  desc: "School-wide result summary",
                  icon: Target,
                },
                {
                  title: "Progress Report",
                  desc: "Term-wise progress comparison",
                  icon: TrendingUp,
                },
                {
                  title: "Failed Students List",
                  desc: "Students needing improvement",
                  icon: AlertCircle,
                },
              ].map((report, idx) => (
                <button
                  key={idx}
                  className="flex items-start gap-4 p-4 border-2 border-slate-100 rounded-2xl hover:border-[#0077b6]/30 hover:bg-sky-50/30 transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#caf0f8] flex items-center justify-center flex-shrink-0">
                    <report.icon size={24} className="text-[#0077b6]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#03045e]">
                      {report.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">{report.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </AdminSectionCard>
        </div>
      )}
    </motion.div>
  );
};

export default AcademicPerformancePage;
