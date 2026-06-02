import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Filter, ClipboardCheck } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminStatCard from "../../components/admin/AdminStatCard";
import AcademicFilterBar from "../../components/admin/academic/AcademicFilterBar";
import ResultsTable from "../../components/admin/academic/ResultsTable";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import AdminEditForm from "../../components/admin/AdminEditForm";
import { getDataProvider } from "../../data";

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editScore, setEditScore] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const provider = getDataProvider();
      const [allResults, allStudents, allSubjects, allExams, allClasses] =
        await Promise.all([
          provider.getResults(),
          provider.getStudents(),
          provider.getSubjects(),
          provider.getExams(),
          provider.getClasses(),
        ]);

      setResults(allResults || []);
      setStudents(allStudents || []);
      setSubjects(allSubjects || []);
      setExams(allExams || []);
      setClasses(allClasses || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateScore = async (formData) => {
    if (!editScore) return;
    try {
      const resId = editScore.id;
      const marks = parseInt(formData.marksObtained, 10) || 0;
      const max = parseInt(editScore.maxMarks, 10) || 100;
      const pct = marks / max;
      const grade =
        pct >= 0.9
          ? "A+"
          : pct >= 0.8
            ? "A"
            : pct >= 0.7
              ? "B"
              : pct >= 0.6
                ? "C"
                : "D";
      const remarks =
        pct >= 0.9
          ? "Outstanding Effort"
          : pct >= 0.8
            ? "Very Good Progress"
            : pct >= 0.7
              ? "Good"
              : "Needs Improvement";

      const provider = getDataProvider();
      await provider.updateResult(resId, {
        marksObtained: marks,
        grade,
        remarks,
      });
      const updatedResults = await provider.getResults();
      setResults(updatedResults || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Helper resolvers for table display
  const resolvedResults = results.map((res) => {
    const stu = students.find((s) => s.id === res.studentId);
    const sub = subjects.find((s) => s.id === res.subjectId);
    const ex = exams.find((e) => e.id === res.examId);
    const cls = classes.find((c) => c.id === res.classId);

    return {
      ...res,
      studentName: stu ? stu.name : "Student",
      subjectName: sub ? sub.name : "Subject",
      examName: ex ? ex.name : "UT-1 Exam",
      className: cls ? cls.name : "Class 11",
    };
  });

  const filteredResults = resolvedResults.filter((res) => {
    const matchesSearch =
      res.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.subjectName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClass === "" || res.classId === selectedClass;
    const matchesExam = selectedExam === "" || res.examId === selectedExam;

    return matchesSearch && matchesClass && matchesExam;
  });

  const scoreFields = [
    {
      name: "marksObtained",
      label: "Marks Obtained Score (0-100)",
      type: "text",
      required: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Institutional Results Ledger"
        description="Monitor school student performance cards, compile subject averages, and audit grades sheets."
        breadcrumbs={["Admin Portal", "Academic", "Results"]}
        actionButton={
          <button className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#0096c7] text-white px-5 py-2.5 rounded-2xl shadow-sm text-xs font-black transition-colors">
            <Plus size={16} />
            <span>COMPILE ACADEMIC CARD</span>
          </button>
        }
      />

      {/* Roster Strengths stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <AdminStatCard
          title="Scores Logged"
          value={results.length.toString()}
          badgeText="Graded Sheets"
          badgeType="success"
          icon={ClipboardCheck}
        />
        <AdminStatCard
          title="Overall Passing Ratio"
          value="96%"
          badgeText="Healthy Progress"
          badgeType="success"
          icon={ClipboardCheck}
          color="#0096c7"
          bg="#ade8f4"
        />
        <AdminStatCard
          title="Subject Average Grade"
          value="B+ / B"
          badgeText="Nominal Trend"
          badgeType="info"
          icon={ClipboardCheck}
          color="#03045e"
          bg="#e0f2fe"
        />
      </div>

      {/* Results Matrix Ledger */}
      <AdminSectionCard>
        <AcademicFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by student name or subject title..."
          filterElements={
            <>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none"
              >
                <option value="">Filter Section...</option>
                <option value="class-11a">Class 11-A</option>
                <option value="class-11b">Class 11-B</option>
                <option value="class-11c">Class 11-C</option>
                <option value="class-11d">Class 11-D</option>
              </select>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none"
              >
                <option value="">Filter Assessment...</option>
                <option value="exam-ut-1">Unit Test 1</option>
                <option value="exam-hy-2025">Half-Yearly Exam</option>
              </select>
            </>
          }
        />

        <div className="mt-6">
          <ResultsTable
            results={filteredResults}
            isEmpty={filteredResults.length === 0}
            onEditScore={(res) => setEditScore(res)}
          />
        </div>
      </AdminSectionCard>

      {/* Edit Score Modal */}
      <AdminEditForm
        isOpen={!!editScore}
        onClose={() => setEditScore(null)}
        title="Modify Student Score Record"
        data={editScore}
        fields={scoreFields}
        onSubmit={handleUpdateScore}
      />
    </motion.div>
  );
};

export default ResultsPage;
