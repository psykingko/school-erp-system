import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Briefcase,
  CheckSquare,
  Wallet,
  Activity,
  CalendarDays,
  UserPlus,
  BookOpen,
  Settings,
  Megaphone,
  FolderOpen,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import AdminQuickActionCard from "../../components/admin/AdminQuickActionCard";
import KPIWidget from "../../components/admin/analytics/KPIWidget";
import AttendanceTrendCard from "../../components/admin/analytics/AttendanceTrendCard";
import AcademicSummaryCard from "../../components/admin/analytics/AcademicSummaryCard";
import WorkloadCard from "../../components/admin/analytics/WorkloadCard";

import ConfirmationModal from "../../components/shared/ConfirmationModal";
import ToastNotification from "../../components/shared/ToastNotification";
import { getItem, setItem } from "../../persistence/storage";
import { STORAGE_KEYS } from "../../persistence/storageKeys";

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      staggerChildren: 0.1,
    },
  },
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [studentCount, setStudentCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const [feesDefaulters, setFeesDefaulters] = useState(0);
  const [routesCount, setRoutesCount] = useState(0);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [demoClassScores, setDemoClassScores] = useState([
    { name: "Class 11-A", averageGrade: "—" },
    { name: "Class 11-B", averageGrade: "—" },
    { name: "Class 12-A", averageGrade: "—" },
  ]);
  const [loading, setLoading] = useState(true);

  // Seed reset state
  const [resetConfirm, setResetConfirm] = useState({
    isOpen: false,
  });
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const handleResetSeed = () => {
    setResetConfirm({ isOpen: true });
  };

  const handleResetConfirm = () => {
    try {
      // Clear all localStorage data by setting empty arrays
      Object.values(STORAGE_KEYS).forEach((key) => {
        setItem(key, []);
      });
      setResetConfirm({ isOpen: false });
      setToast({
        show: true,
        message: "Seed data reset successfully. Refresh to reinitialize.",
        type: "success",
      });
      // Reload page after short delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Failed to reset seed data",
        type: "error",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const allStudents = getItem(STORAGE_KEYS.STUDENTS, []);
      const allTeachers = getItem(STORAGE_KEYS.TEACHERS, []);
      const allLeaves = getItem(STORAGE_KEYS.LEAVE_REQUESTS, []);
      const allFees = getItem(STORAGE_KEYS.FEES, []);
      const allRoutes = getItem(STORAGE_KEYS.TRANSPORT_ROUTES, []);
      const allClasses = getItem(STORAGE_KEYS.CLASSES, []);

      setStudentCount(allStudents.length);
      setTeacherCount(allTeachers.length);
      setPendingLeaves(allLeaves.filter((l) => l.status === "PENDING").length);
      setFeesDefaulters(allFees.filter((f) => f.status !== "Paid").length);
      setRoutesCount(allRoutes.length);
      setTeachers(allTeachers || []);
      setClasses(allClasses || []);

      // Build real class average scores from results
      const allResults = getItem(STORAGE_KEYS.RESULTS, []);
      const allSubjects = getItem(STORAGE_KEYS.SUBJECTS, []);
      const scoredClasses = allClasses.slice(0, 3).map((cls) => {
        const classResults = allResults.filter((r) => r.classId === cls.id);
        if (classResults.length === 0)
          return { name: cls.displayName || cls.name, averageGrade: "N/A" };
        const avg =
          classResults.reduce((sum, r) => sum + (r.marksObtained || 0), 0) /
          classResults.length;
        const maxMarks = classResults[0]?.maxMarks || 100;
        const pct = Math.round((avg / maxMarks) * 100);
        const grade =
          pct >= 90 ? "A+" : pct >= 75 ? "A" : pct >= 60 ? "B" : "C";
        return {
          name: cls.displayName || cls.name,
          averageGrade: `${pct}% (${grade})`,
        };
      });
      setDemoClassScores(
        scoredClasses.length > 0
          ? scoredClasses
          : [
              { name: "Class 11-A", averageGrade: "N/A" },
              { name: "Class 11-B", averageGrade: "N/A" },
              { name: "Class 12-A", averageGrade: "N/A" },
            ],
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >
      {/* Page Header */}
      <AdminPageHeader
        title="Institution Command Center"
        description="Daily administrative operations, academic management, and operational analytics dashboard."
        breadcrumbs={["Admin Portal", "Dashboard"]}
        actionButton={
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-[#caf0f8]">
            <Activity size={16} className="text-[#0077b6] animate-pulse" />
            <span className="text-xs font-black text-[#03045e] uppercase tracking-wider">
              SYSTEM BALANCED
            </span>
          </div>
        }
      />

      {/* Polish Pass: High fidelity KPI widgets grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIWidget
          title="Total Registered Students"
          value={studentCount ? studentCount.toString() : "10"}
          description="Active cohort enrolled"
          icon={Users}
          trend="+4%"
        />
        <KPIWidget
          title="Academic Faculty"
          value={teacherCount ? teacherCount.toString() : "5"}
          description="Teachers & support staff"
          icon={Briefcase}
          trend="100%"
          trendDirection="up"
          color="#0096c7"
          bg="#ade8f4"
        />
        <KPIWidget
          title="Pending Absences Leaves"
          value={pendingLeaves ? pendingLeaves.toString() : "2"}
          description="Awaiting reviews in queue"
          icon={CheckSquare}
          trend="Action Needed"
          trendDirection="down"
          color="#03045e"
          bg="#e0f2fe"
        />
        <KPIWidget
          title="Outstanding Fee Ledgers"
          value={feesDefaulters ? feesDefaulters.toString() : "3"}
          description="Pending ledger items"
          icon={Wallet}
          trend="82% Paid"
          color="#00b4d8"
          bg="#caf0f8"
        />
      </div>

      {/* Grid Layout: Visual charts & analytics cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Spark Chart Card */}
        <div className="lg:col-span-2">
          <AttendanceTrendCard
            points={[88, 92, 90, 94, 95, 93, 94]}
            labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
            avgRate="92.8% Compliance"
          />
        </div>

        {/* Academic averages card */}
        <AcademicSummaryCard
          title="Academic Performance Status"
          passRate="98%"
          examCount={3}
          toppersCount={demoClassScores.length}
          classScores={demoClassScores}
        />
      </div>

      {/* Main Workspace Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left: Teaching work portfolios load */}
        <div className="lg:col-span-2 space-y-6">
          <AdminSectionCard title="Faculty Workload Allocations Insights">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teachers.slice(0, 2).map((teacher) => (
                <WorkloadCard
                  key={teacher.id}
                  teacherName={teacher.name}
                  classesCount={2}
                  subjectsList={
                    teacher.subjectsAssigned || [teacher.department]
                  }
                  weeklyHours={teacher.id === "teach-001" ? 22 : 18}
                />
              ))}
            </div>
          </AdminSectionCard>


        </div>

        {/* Right Panel: Operations Quick Actions (Fully routed!) */}
        <div className="space-y-6">
          <AdminSectionCard title="Quick Command Controls">
            <div className="space-y-3">
              <AdminQuickActionCard
                title="Enroll New Student"
                description="Enroll students & map parent details"
                icon={UserPlus}
                onClick={() => navigate("/admin/students")}
              />
              <AdminQuickActionCard
                title="Allocate Subject Teacher"
                description="Map academic roles, class sections & subjects"
                icon={BookOpen}
                onClick={() => navigate("/admin/subject-alloc")}
              />
              <AdminQuickActionCard
                title="Reset Seed Data"
                description="Clear all data and reinitialize seed"
                icon={RefreshCw}
                onClick={handleResetSeed}
                color="#f59e0b"
                bg="#fef3c7"
              />
              <AdminQuickActionCard
                title="Configure Class Timetable"
                description="Create schedules, set periods & room mappings"
                icon={Settings}
                onClick={() => navigate("/admin/timetable")}
              />
              <AdminQuickActionCard
                title="Records File Repository"
                description="View certs, TC transcripts & Aadhar ID logs"
                icon={FolderOpen}
                onClick={() => navigate("/admin/documents")}
              />
            </div>
          </AdminSectionCard>
        </div>
      </div>

      {/* Seed Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={resetConfirm.isOpen}
        title="Reset Seed Data"
        message="Are you sure you want to reset all seed data? This will clear all students, teachers, classes, fees, and other data. The application will reload after reset."
        warningText="This action cannot be undone"
        onConfirm={handleResetConfirm}
        onCancel={() => setResetConfirm({ isOpen: false })}
        confirmButtonText="Reset Data"
        cancelButtonText="Cancel"
      />

      {/* Toast Notification */}
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </motion.div>
  );
};

export default AdminDashboard;
