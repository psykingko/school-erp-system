import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
  lazy,
  Suspense,
} from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import HeroBanner from "./components/HeroBanner";
import ActionNeededSection from "./components/ActionNeededSection";
import AttendanceCard from "./components/AttendanceCard";
import FeeCard from "./components/FeeCard";
import TimetableCard from "./components/TimetableCard";
import CredentialsCard from "./components/CredentialsCard";
import AssignmentsSummaryCard from "./components/AssignmentsSummaryCard";
import VCMessageCard from "./components/VCMessageCard";
import NoticeBoard from "./components/NoticeBoard";
import EventBoard from "./components/EventBoard";
import ChildScopeSwitcher from "./components/parent/ChildScopeSwitcher";
import ErrorBoundary from "./components/ErrorBoundary";
import MainCard from "./components/MainCard";
import { Users, ShieldCheck } from "lucide-react";
import "./modules/academic/index.js";

// Lazy Loaded Pages
const CoursesPage = lazy(() => import("./pages/shared/CoursesPage"));
const FacultyPage = lazy(() => import("./pages/shared/FacultyPage"));
const WeeklyTimetablePage = lazy(() => import("./pages/shared/WeeklyTimetablePage"));
const ExaminationPage = lazy(() => import("./pages/shared/ExaminationPage"));
const AcademicResultsPage = lazy(() => import("./pages/shared/AcademicResultsPage"));
const SchoolCalendarPage = lazy(() => import("./pages/shared/SchoolCalendarPage"));
const FeeDetailsPage = lazy(() => import("./pages/shared/FeeDetailsPage"));
const SubjectDetailPage = lazy(() => import("./pages/shared/SubjectDetailPage"));
const DocumentsPage = lazy(() => import("./pages/shared/DocumentsPage"));
const AssignmentsPage = lazy(() => import("./pages/student/AssignmentsPage"));
const AchievementsPage = lazy(() => import("./pages/shared/AchievementsPage"));
const MentorSupportPage = lazy(() => import("./pages/shared/MentorSupportPage"));
const ClubsCommitteesPage = lazy(() => import("./pages/shared/ClubsCommitteesPage"));
const TransportPage = lazy(() => import("./pages/shared/TransportPage"));
const StudentProfilePage = lazy(() => import("./pages/shared/StudentProfilePage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const ForcePasswordResetPage = lazy(() => import("./pages/auth/ForcePasswordResetPage"));
const LeavePage = lazy(() => import("./pages/student/LeavePage"));
const WithdrawalRequestPage = lazy(() => import("./pages/shared/WithdrawalRequestPage"));
const SupportCenterPage = lazy(() => import("./pages/shared/SupportCenterPage"));

// Teacher Portal Pages
const TeacherDashboard = lazy(() => import("./pages/teacher/TeacherDashboard"));
const AttendanceMgmtPage = lazy(
  () => import("./pages/teacher/AttendanceMgmtPage"),
);
const AssignmentsManagementPage = lazy(
  () => import("./pages/teacher/AssignmentsManagementPage"),
);
const TeacherExaminationWorkspace = lazy(() => import("./pages/teacher/examinations/TeacherExaminationWorkspace"));
const QuestionPapersPage = lazy(() => import("./pages/teacher/QuestionPapersPage"));
const ClassTimetablePage = lazy(
  () => import("./pages/teacher/ClassTimetablePage"),
);
const StudentPerfPage = lazy(() => import("./pages/teacher/StudentPerfPage"));
const AnnouncementsPage = lazy(
  () => import("./pages/teacher/AnnouncementsPage"),
);
const TeacherMentorSupportPage = lazy(
  () => import("./pages/teacher/MentorSupportPage"),
);
const ClubsActivitiesPage = lazy(
  () => import("./pages/teacher/ClubsActivitiesPage"),
);
const ReportsAnalyticsPage = lazy(
  () => import("./pages/teacher/ReportsAnalyticsPage"),
);
const ProfileSettingsPage = lazy(
  () => import("./pages/teacher/ProfileSettingsPage"),
);
const LeaveMgmtPage = lazy(() => import("./pages/teacher/LeaveMgmtPage"));
const TeacherLeavePage = lazy(() => import("./pages/teacher/TeacherLeavePage"));
const StudentDutyManagementPage = lazy(() => import("./pages/teacher/StudentDutyManagementPage"));
const StudentDutyRecordsPage = lazy(() => import("./pages/student/StudentDutyRecordsPage"));
const ParentDutyRecordsPage = lazy(() => import("./pages/parent/ParentDutyRecordsPage"));
const StudentExitManagementPage = lazy(() => import("./pages/admin/StudentExitManagementPage"));
const StudentExitTrackingPage = lazy(() => import("./pages/teacher/StudentExitTrackingPage"));

// Admin Portal Pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const StudentsPage = lazy(() => import("./pages/admin/StudentsPage"));
const StudentDetailsAdminPage = lazy(() => import("./pages/admin/StudentDetailsPage"));
const TeachersPage = lazy(() => import("./pages/admin/TeachersPage"));
const ParentsPage = lazy(() => import("./pages/admin/ParentsPage"));
const ClassesPage = lazy(() => import("./pages/admin/ClassesPage"));
const SubjectsPage = lazy(() => import("./pages/admin/SubjectsPage"));
const TimetablePage = lazy(() => import("./pages/admin/TimetablePage"));
const ExamCyclesPage = lazy(() => import("./pages/admin/examinations/ExamCyclesPage"));
const AcademicReportCardsPage = lazy(() => import("./pages/admin/examinations/academic-report-cards/AcademicReportCardsPage"));
const TeacherAcademicResultsPage = lazy(() => import("./pages/teacher/TeacherAcademicResultsPage"));
const AssessmentGovernancePage = lazy(() => import("./pages/admin/examinations/assessment-governance/AssessmentGovernancePage"));
const DateSheetsPage = lazy(() => import("./pages/admin/examinations/DateSheetsPage"));
const LiveOperationsPage = lazy(() => import("./pages/admin/examinations/LiveOperationsPage"));
const EvaluationCenterPage = lazy(() => import("./pages/admin/examinations/EvaluationCenterPage"));
const ResultsPublicationPage = lazy(() => import("./pages/admin/examinations/ResultsPublicationPage"));

const QuestionPapersAdminPage = lazy(() => import("./pages/admin/QuestionPapersAdminPage"));
const AttendanceOverviewPage = lazy(
  () => import("./pages/admin/AttendanceOverviewPage"),
);
const StaffAttendanceMgmtPage = lazy(
  () => import("./pages/admin/StaffAttendanceMgmtPage"),
);
const EmployeeAttendancePage = lazy(
  () => import("./pages/shared/EmployeeAttendancePage"),
);

const FeeManagementPage = lazy(() => import("./pages/admin/FeeManagementPage"));
const TransportManagementPage = lazy(
  () => import("./pages/admin/TransportManagementPage"),
);
const StudentDutyAdminPage = lazy(() => import("./pages/admin/StudentDutyAdminPage"));
const AdminDocumentsPage = lazy(() => import("./pages/admin/DocumentsPage"));
const NoticesPage = lazy(() => import("./pages/admin/NoticesPage"));
const AdminAnnouncementsPage = lazy(
  () => import("./pages/admin/AnnouncementsPage"),
);
const AdminClubManagementPage = lazy(() => import("./pages/admin/ClubManagementCenterPage"));
const AdminCommitteesPage = lazy(() => import("./pages/admin/CommitteesPage"));
const AdminAchievementsPage = lazy(
  () => import("./pages/admin/AchievementsPage"),
);
const AdminSchoolCalendarPage = lazy(
  () => import("./pages/admin/SchoolCalendarPage"),
);
const AcademicPerformancePage = lazy(
  () => import("./pages/admin/AcademicPerformancePage"),
);
const WorkloadAnalyticsPage = lazy(
  () => import("./pages/admin/WorkloadAnalyticsPage"),
);
const InstitutionalPlanningPage = lazy(
  () => import("./pages/admin/InstitutionalPlanningPage"),
);
const AdminProfilePage = lazy(() => import("./pages/admin/AdminProfilePage"));
const StaffWorkspaceLayout = lazy(() => import("./layouts/StaffWorkspaceLayout"));
const SupportManagementPage = lazy(() => import("./pages/admin/SupportManagementPage"));
const ManageDepartmentsPage = lazy(
  () => import("./pages/admin/ManageDepartmentsPage"),
);
const SystemAdministrationPage = lazy(() => import("./pages/admin/SystemAdministrationPage"));
const CommunicationCenterPage = lazy(
  () => import("./pages/admin/CommunicationCenterPage"),
);
const EmployeeDirectoryPage = lazy(
  () => import("./pages/admin/EmployeeDirectoryPage"),
);
const EmployeeLeavePage = lazy(
  () => import("./pages/admin/EmployeeLeavePage"),
);
const LeaveManagementPage = lazy(
  () => import("./pages/admin/LeaveManagementPage"),
);

import { formatDate } from "./shared/utils/attendanceHelpers";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import SkeletonCard from "./components/SkeletonCard";

// Auth & Routing
import { ROLES } from "./auth/roles";
import { ROLE_NAVIGATION } from "./auth/navigation";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRouteGuard from "./routes/AdminRouteGuard";

// Layouts
import StudentLayout from "./layouts/StudentLayout";
import ParentLayout from "./layouts/ParentLayout";
import TeacherLayout from "./layouts/TeacherLayout";
import AdminLayout from "./layouts/AdminLayout";

import { StudentProvider, useStudent } from "./context/StudentContext";

// Service Imports
import {
  getStudentProfile,
  getAttendance,
  getDocuments,
} from "./services/studentService";
import { getFeeDetails } from "./services/financeService";
import { getTimetable } from "./services/academicsService";
import {
  getBrandingInfo,
  getNoticesAndEvents,
  getNotifications,
} from "./services/sharedService";
import { getChildren } from "./services/parentService";
import {
  getAcademicProgress,
  getAcademicTimeline,
} from "./services/assignmentService";
import { getExamData } from "./services/examService";
import { getUpdatesForStudent } from "./services/classUpdatesService";
import { useService } from "./hooks/useService";

// Dashboard Aggregation and Skeleton Loaders for High-Performance progressive rendering
import { studentDashboardService } from "./services/studentService";
import DashboardCardSkeleton from "./shared/components/skeletons/DashboardCardSkeleton";
import ScheduleSkeleton from "./shared/components/skeletons/ScheduleSkeleton";
import ActionCenterSkeleton from "./shared/components/skeletons/ActionCenterSkeleton";

const LAYOUT_MAP = {
  [ROLES.STUDENT]: StudentLayout,
  [ROLES.PARENT]: ParentLayout,
  [ROLES.TEACHER]: TeacherLayout,
  [ROLES.ADMIN]: AdminLayout,
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

const CURRENT_DATE = formatDate(new Date());

// ── Home dashboard ────────────────────────────────────────────────────────────

// Memoized Subcomponents to prevent cascade rendering cycles
const MemoizedHeroBanner = React.memo(HeroBanner);
const MemoizedActionNeededSection = React.memo(ActionNeededSection);
const MemoizedAttendanceCard = React.memo(AttendanceCard);
const MemoizedFeeCard = React.memo(FeeCard);
const MemoizedTimetableCard = React.memo(TimetableCard);
const MemoizedCredentialsCard = React.memo(CredentialsCard);
const MemoizedAssignmentsSummaryCard = React.memo(AssignmentsSummaryCard);
const MemoizedVCMessageCard = React.memo(VCMessageCard);
const MemoizedNoticeBoard = React.memo(NoticeBoard);
const MemoizedEventBoard = React.memo(EventBoard);

const HomePage = React.memo(function HomePage({ onNavigatePage }) {
  const attendanceRef = useRef(null);
  const feeRef = useRef(null);
  const timetableRef = useRef(null);
  const assignmentsRef = useRef(null);

  const sectionRefs = useRef({
    "section-attendance": attendanceRef,
    "section-fee": feeRef,
    "section-timetable": timetableRef,
    "section-assignments": assignmentsRef,
  });

  const [highlightedSection, setHighlightedSection] = useState(null);
  const { isParent } = useAuth();
  const { activeStudentId } = useStudent();

  // ── Isolated Local States (Instead of Homepage Mega-State) ──
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [finance, setFinance] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [progress, setProgress] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [branding, setBranding] = useState(null);
  const [shared, setShared] = useState(null);
  const [classUpdates, setClassUpdates] = useState([]);
  const [derived, setDerived] = useState(null);

  // Loading States
  const [loadingCritical, setLoadingCritical] = useState(true);
  const [loadingDeferred, setLoadingDeferred] = useState(true);

  // Error States
  const [errorCritical, setErrorCritical] = useState("");
  const [errorDeferred, setErrorDeferred] = useState("");

  const [toastMessage, setToastMessage] = useState(null);

  const fetchCritical = useCallback(
    async (force = false) => {
      setLoadingCritical(true);
      try {
        const payload =
          await studentDashboardService.getCriticalStudentDashboardPayload(
            activeStudentId,
            force,
          );
        setProfile(payload.profile);
        setAttendance(payload.attendance);
        setFinance(payload.finance);
        setTimetable(payload.timetable);
        setDerived((prev) => ({
          ...prev,
          attendanceWarnings: payload.derived?.attendanceWarnings || [],
        }));
        setErrorCritical("");
      } catch (err) {
        console.error("Failed to load Student Dashboard critical data:", err);
        setErrorCritical("Unable to retrieve basic student profile details.");
      } finally {
        setLoadingCritical(false);
      }
    },
    [activeStudentId],
  );

  const fetchDeferred = useCallback(
    async (force = false) => {
      setLoadingDeferred(true);
      try {
        const payload =
          await studentDashboardService.getDeferredStudentDashboardPayload(
            activeStudentId,
            isParent,
            force,
          );
        setProgress(payload.progress);
        setTimeline(payload.timeline);
        setBranding(payload.branding);
        setShared(payload.shared);
        setClassUpdates(payload.classUpdates || []);
        setDerived((prev) => ({
          ...prev,
          missingDocuments: payload.derived?.missingDocuments || [],
          completionRate: payload.derived?.completionRate || 0,
          pendingCount: payload.derived?.pendingCount || 0,
          overdueCount: payload.derived?.overdueCount || 0,
          nextExam: payload.derived?.nextExam,
        }));
        setErrorDeferred("");
      } catch (err) {
        console.error("Failed to load Student Dashboard deferred data:", err);
        setErrorDeferred("Unable to retrieve announcements board.");
      } finally {
        setLoadingDeferred(false);
      }
    },
    [activeStudentId, isParent],
  );

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch critical metrics immediately for instantaneous first-paint
    fetchCritical();

    // 2. Defer secondary heavy calls to allow seamless page mounting
    const timer = setTimeout(() => {
      if (isMounted) fetchDeferred();
    }, 50);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchCritical, fetchDeferred]);

  const handleNavigate = useCallback((sectionId) => {
    const ref = sectionRefs.current[sectionId];
    const el = ref?.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedSection(sectionId);
    setTimeout(() => setHighlightedSection(null), 2000);
  }, []);

  const glowStyle = useCallback(
    (id) =>
      highlightedSection === id
        ? {
            outline: "3px solid #0077b6",
            outlineOffset: "3px",
            borderRadius: "16px",
            transition: "outline 0.2s ease",
          }
        : {},
    [highlightedSection],
  );

  const handleNavigateFeeDetails = useCallback(() => {
    onNavigatePage("feeDetails");
  }, [onNavigatePage]);

  const handleNavigateAssignments = useCallback(() => {
    onNavigatePage("assignments");
  }, [onNavigatePage]);

  return (
    <div className="flex flex-col gap-6 items-start w-full">
      <div className="w-full flex gap-6 items-start">
        <div className="flex-1 min-w-0 relative">
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-20 right-8 z-50 flex items-center gap-2 bg-emerald-500 text-white px-4 py-3 rounded-2xl shadow-xl shadow-emerald-500/20"
              >
                <CheckCircle2 size={16} />
                <span className="text-xs font-black">{toastMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hero Banner Section */}
          {loadingCritical ? (
            <div className="h-40 w-full bg-gray-100/50 rounded-[2.5rem] animate-pulse" />
          ) : errorCritical ? (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-2xl">
              {errorCritical}
            </div>
          ) : (
            <MemoizedHeroBanner student={profile?.personal} academic={profile?.academic} />
          )}

          {/* Action Needed Alerts Center */}
          <div className="mt-6">
            {loadingDeferred || loadingCritical ? (
              <div className="h-28 w-full bg-gray-50/50 rounded-[2rem] border border-gray-100/80 animate-pulse" />
            ) : (
              <MemoizedActionNeededSection
                attendanceWarnings={derived?.attendanceWarnings || []}
                nextExam={derived?.nextExam}
                fees={finance?.summary}
                pendingAssignments={
                  (derived?.pendingCount || 0) + (derived?.overdueCount || 0)
                }
                missingDocuments={derived?.missingDocuments || []}
                classUpdates={classUpdates || []}
                onNavigate={handleNavigate}
              />
            )}
          </div>

          {/* Attendance & Finance Cards */}
          <div
            className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
            ref={attendanceRef}
            style={glowStyle("section-attendance")}
          >
            {loadingCritical ? (
              <DashboardCardSkeleton />
            ) : (
              <MemoizedAttendanceCard studentId={activeStudentId} />
            )}

            <div
              ref={feeRef}
              style={glowStyle("section-fee")}
              className="h-full"
            >
              {loadingCritical ? (
                <DashboardCardSkeleton />
              ) : (
                <MemoizedFeeCard
                  amount={finance?.summary?.outstandingBalance}
                  currency={finance?.summary?.currency}
                  dueDate={finance?.summary?.dueDate}
                  status={finance?.summary?.status}
                  amountPaid={finance?.summary?.totalPaid}
                  totalAmount={finance?.summary?.totalFees}
                  onClick={handleNavigateFeeDetails}
                />
              )}
            </div>
          </div>

          {/* Timetable & Credentials */}
          <div
            className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6"
            ref={timetableRef}
            style={glowStyle("section-timetable")}
          >
            <div className="lg:col-span-2 h-full">
              {loadingCritical ? (
                <ScheduleSkeleton />
              ) : (
                <MemoizedTimetableCard
                  weeklyTimetable={timetable?.weekly || {}}
                  isConfigured={timetable?.isConfigured}
                />
              )}
            </div>

            <div className="flex flex-col gap-4">
              {loadingCritical ? (
                <>
                  <div className="h-[120px] bg-gray-50/60 rounded-3xl border border-gray-100 animate-pulse" />
                  <div className="h-[120px] bg-gray-50/60 rounded-3xl border border-gray-100 animate-pulse" />
                </>
              ) : (
                <>
                  <MemoizedCredentialsCard
                    type="library"
                    title="School Library"
                    primaryLabel="Library Card No."
                    primaryValue={
                      profile?.credentials?.library?.cardNumber || "LIB-11A-023"
                    }
                    passwordLabel="PIN"
                    passwordValue={
                      profile?.credentials?.library?.pin || "lib@Ash2024"
                    }
                    accentColor="emerald"
                    index={0}
                  />
                  <MemoizedCredentialsCard
                    type="email"
                    title="School Email"
                    primaryLabel="Email Address"
                    primaryValue={
                      profile?.credentials?.email?.address ||
                      "ashish.kumar@springdale.edu.in"
                    }
                    passwordLabel="Password"
                    passwordValue={
                      profile?.credentials?.email?.password || "Ash@Spring#24"
                    }
                    accentColor="blue"
                    index={1}
                  />
                </>
              )}
            </div>
          </div>

          {/* Assignments Summary & Principal Message */}
          <div
            className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
            ref={assignmentsRef}
            style={glowStyle("section-assignments")}
          >
            {loadingDeferred ? (
              <DashboardCardSkeleton />
            ) : (
              <MemoizedAssignmentsSummaryCard
                completionRate={derived?.completionRate || 0}
                pendingCount={derived?.pendingCount || 0}
                overdueCount={derived?.overdueCount || 0}
                onViewAll={handleNavigateAssignments}
                index={0}
              />
            )}

            {loadingDeferred ? (
              <DashboardCardSkeleton />
            ) : (
              <MemoizedVCMessageCard
                vcName={branding?.principal?.name}
                vcTitle={branding?.principal?.title}
                message={branding?.principal?.message}
                avatarColor={branding?.principal?.avatarColor}
                index={1}
              />
            )}
          </div>

          {/* Notices & Events Boards */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loadingDeferred ? (
              <ActionCenterSkeleton />
            ) : (
              <MemoizedNoticeBoard
                notices={shared?.general || []}
                examNotices={shared?.exam || []}
                classUpdates={classUpdates || []}
                index={0}
              />
            )}

            {loadingDeferred ? (
              <ActionCenterSkeleton />
            ) : (
              <MemoizedEventBoard
                happenings={shared?.events || []}
                upcoming={shared?.upcoming || []}
                index={1}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

function LazyRoute({ Component, ...props }) {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}

const PortalInDevelopment = ({ title }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
    <MainCard className="p-12 flex flex-col items-center max-w-md">
      <div className="w-20 h-20 bg-[#caf0f8] rounded-[2rem] flex items-center justify-center text-[#0077b6] mb-8">
        <ShieldCheck size={40} />
      </div>
      <h2 className="text-2xl font-black text-[#03045e] mb-4">{title}</h2>
      <p className="text-gray-500 font-bold mb-8 leading-relaxed">
        The {title} is currently under construction. Future updates will include
        system-wide fee management, transport logistics, and user
        administration.
      </p>
      <div className="flex gap-2">
        <div
          className="w-2 h-2 rounded-full bg-[#00b4d8] animate-bounce"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="w-2 h-2 rounded-full bg-[#00b4d8] animate-bounce"
          style={{ animationDelay: "0.2s" }}
        />
        <div
          className="w-2 h-2 rounded-full bg-[#00b4d8] animate-bounce"
          style={{ animationDelay: "0.4s" }}
        />
      </div>
    </MainCard>
  </div>
);

function NavigateToDashboard() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={`/${role?.toLowerCase()}/dashboard`} replace />;
}

function AppContent() {
  const { isAuthenticated, role } = useAuth();
  const { data: notifications } = useService(getNotifications);
  const navigate = useNavigate();

  const handlePageNavigation = useCallback(
    (pageId) => {
      if (pageId.startsWith("subject_")) {
        const subjectId = pageId.split("_")[1];
        navigate(`/${role?.toLowerCase()}/subjects/${subjectId}`);
        return;
      }
      switch (pageId) {
        case "feeDetails":
          navigate(`/${role?.toLowerCase()}/fees`);
          break;
        case "assignments":
          navigate(`/${role?.toLowerCase()}/assignments`);
          break;
        case "courses":
          navigate(`/${role?.toLowerCase()}/subjects`);
          break;
        case "profile":
          navigate(`/${role?.toLowerCase()}/profile`);
          break;
        case "support_center":
          navigate(`/${role?.toLowerCase()}/support`);
          break;
        default:
          navigate(`/${role?.toLowerCase()}/dashboard`);
      }
    },
    [navigate, role],
  );

  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          <LazyRoute Component={LoginPage} />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <Routes>
      {/* Student Portal Routes */}
      <Route
        path="/student"
        element={
          <StudentLayout
            navItems={ROLE_NAVIGATION[ROLES.STUDENT]}
            notifications={notifications || []}
            currentDate={CURRENT_DATE}
          />
        }
      >
        <Route
          path="dashboard"
          element={
            <LazyRoute
              Component={HomePage}
              onNavigatePage={handlePageNavigation}
            />
          }
        />
        <Route
          path="assignments"
          element={<LazyRoute Component={AssignmentsPage} />}
        />
        <Route
          path="subjects"
          element={
            <LazyRoute
              Component={CoursesPage}
              onNavigatePage={handlePageNavigation}
            />
          }
        />
        <Route
          path="subjects/:subjectId"
          element={<LazyRoute Component={SubjectDetailPage} />}
        />
        <Route
          path="timetable"
          element={<LazyRoute Component={WeeklyTimetablePage} />}
        />
        <Route
          path="examinations"
          element={<LazyRoute Component={ExaminationPage} />}
        />
        <Route
          path="academic-results"
          element={<LazyRoute Component={AcademicResultsPage} />}
        />
        <Route path="fees" element={<LazyRoute Component={FeeDetailsPage} />} />
        <Route
          path="transport"
          element={<LazyRoute Component={TransportPage} />}
        />
        <Route
          path="clubs"
          element={<LazyRoute Component={ClubsCommitteesPage} />}
        />
        <Route
          path="mentor-support"
          element={<LazyRoute Component={MentorSupportPage} />}
        />
        <Route
          path="documents"
          element={<LazyRoute Component={DocumentsPage} />}
        />
        <Route
          path="achievements"
          element={<LazyRoute Component={AchievementsPage} />}
        />
        <Route
          path="calendar"
          element={<LazyRoute Component={SchoolCalendarPage} />}
        />
        <Route
          path="my-duties"
          element={<LazyRoute Component={StudentDutyRecordsPage} />}
        />
        <Route
          path="profile"
          element={
            <LazyRoute
              Component={StudentProfilePage}
              onNavigatePage={handlePageNavigation}
            />
          }
        />
        <Route path="faculty" element={<LazyRoute Component={FacultyPage} />} />
        <Route path="leave" element={<LazyRoute Component={LeavePage} />} />
        <Route path="withdrawal_request" element={<LazyRoute Component={WithdrawalRequestPage} />} />
        <Route path="support" element={<LazyRoute Component={SupportCenterPage} />} />
      </Route>

      {/* Parent Portal Routes */}
      <Route
        path="/parent"
        element={
          <ParentLayout
            navItems={ROLE_NAVIGATION[ROLES.PARENT]}
            notifications={notifications || []}
            currentDate={CURRENT_DATE}
          />
        }
      >
        <Route
          path="dashboard"
          element={
            <LazyRoute
              Component={HomePage}
              onNavigatePage={handlePageNavigation}
            />
          }
        />
        <Route
          path="assignments"
          element={<LazyRoute Component={AssignmentsPage} />}
        />
        <Route
          path="subjects"
          element={
            <LazyRoute
              Component={CoursesPage}
              onNavigatePage={handlePageNavigation}
            />
          }
        />
        <Route
          path="subjects/:subjectId"
          element={<LazyRoute Component={SubjectDetailPage} />}
        />
        <Route
          path="timetable"
          element={<LazyRoute Component={WeeklyTimetablePage} />}
        />
        <Route
          path="duty-records"
          element={<LazyRoute Component={ParentDutyRecordsPage} />}
        />
        <Route
          path="examinations"
          element={<LazyRoute Component={ExaminationPage} />}
        />
        <Route
          path="academic-results"
          element={<LazyRoute Component={AcademicResultsPage} />}
        />
        <Route path="fees" element={<LazyRoute Component={FeeDetailsPage} />} />
        <Route
          path="transport"
          element={<LazyRoute Component={TransportPage} />}
        />
        <Route
          path="mentor-support"
          element={<LazyRoute Component={MentorSupportPage} />}
        />
        <Route
          path="documents"
          element={<LazyRoute Component={DocumentsPage} />}
        />
        <Route
          path="achievements"
          element={<LazyRoute Component={AchievementsPage} />}
        />
        <Route
          path="clubs"
          element={<LazyRoute Component={ClubsCommitteesPage} />}
        />
        <Route
          path="profile"
          element={
            <LazyRoute
              Component={StudentProfilePage}
              onNavigatePage={handlePageNavigation}
            />
          }
        />
        <Route path="faculty" element={<LazyRoute Component={FacultyPage} />} />
        <Route path="withdrawal_request" element={<LazyRoute Component={WithdrawalRequestPage} />} />
        <Route path="leave" element={<LazyRoute Component={LeavePage} />} />
        <Route path="calendar" element={<LazyRoute Component={SchoolCalendarPage} />} />
        <Route path="support" element={<LazyRoute Component={SupportCenterPage} />} />
      </Route>

      {/* Teacher Portal Routes */}
      <Route
        path="/teacher"
        element={
          <TeacherLayout
            navItems={ROLE_NAVIGATION[ROLES.TEACHER]}
            notifications={notifications || []}
            currentDate={CURRENT_DATE}
          />
        }
      >
        <Route
          path="dashboard"
          element={<LazyRoute Component={TeacherDashboard} />}
        />
        <Route
          path="attendance"
          element={<LazyRoute Component={AttendanceMgmtPage} />}
        />
        <Route
          path="my-attendance"
          element={<LazyRoute Component={EmployeeAttendancePage} />}
        />
        <Route
          path="assignments"
          element={<LazyRoute Component={AssignmentsManagementPage} />}
        />
        <Route
          path="examinations"
          element={<LazyRoute Component={TeacherExaminationWorkspace} />}
        />
        <Route
          path="question-papers"
          element={<LazyRoute Component={QuestionPapersPage} />}
        />
        <Route
          path="timetable"
          element={<LazyRoute Component={ClassTimetablePage} />}
        />
        <Route
          path="students"
          element={<LazyRoute Component={StudentPerfPage} />}
        />
        <Route
          path="academic-results"
          element={<LazyRoute Component={TeacherAcademicResultsPage} />}
        />
        <Route
          path="mentorship"
          element={<LazyRoute Component={TeacherMentorSupportPage} />}
        />
        <Route
          path="class-updates"
          element={<LazyRoute Component={AnnouncementsPage} />}
        />
        <Route
          path="student-duty"
          element={<LazyRoute Component={StudentDutyManagementPage} />}
        />
        <Route
          path="reports"
          element={<LazyRoute Component={ReportsAnalyticsPage} />}
        />
        <Route
          path="student-exit-tracking"
          element={<LazyRoute Component={StudentExitTrackingPage} />}
        />
        <Route
          path="clubs"
          element={<LazyRoute Component={ClubsActivitiesPage} />}
        />
        <Route
          path="profile-settings"
          element={<LazyRoute Component={ProfileSettingsPage} />}
        />
        <Route
          path="leave-management"
          element={<LazyRoute Component={LeaveMgmtPage} />}
        />
        <Route
          path="leaves"
          element={<LazyRoute Component={TeacherLeavePage} />}
        />
        <Route
          path="calendar"
          element={<LazyRoute Component={SchoolCalendarPage} />}
        />
        <Route path="support" element={<LazyRoute Component={SupportCenterPage} />} />
      </Route>

      {/* Admin Portal Routes */}
      <Route
        path="/admin"
        element={
          <AdminLayout
            navItems={ROLE_NAVIGATION[ROLES.ADMIN]}
            notifications={notifications || []}
            currentDate={CURRENT_DATE}
          />
        }
      >
        <Route
          path="dashboard"
          element={<AdminRouteGuard requiredModule="admin_home"><LazyRoute Component={AdminDashboard} /></AdminRouteGuard>}
        />
        <Route
          path="students"
          element={<AdminRouteGuard requiredModule="admin_students"><LazyRoute Component={StudentsPage} /></AdminRouteGuard>}
        />
        <Route
          path="students/:id"
          element={<AdminRouteGuard requiredModule="admin_students"><LazyRoute Component={StudentDetailsAdminPage} /></AdminRouteGuard>}
        />
        <Route
          path="teachers"
          element={<AdminRouteGuard requiredModule="admin_teachers"><LazyRoute Component={TeachersPage} /></AdminRouteGuard>}
        />
        <Route path="parents" element={<AdminRouteGuard requiredModule="admin_parents"><LazyRoute Component={ParentsPage} /></AdminRouteGuard>} />
        <Route path="employees" element={<AdminRouteGuard requiredModule="admin_employees"><LazyRoute Component={EmployeeDirectoryPage} /></AdminRouteGuard>} />
        <Route path="staff/:id/*" element={<AdminRouteGuard requiredModule="admin_employees"><LazyRoute Component={StaffWorkspaceLayout} /></AdminRouteGuard>} />
        <Route path="employee-leaves" element={<AdminRouteGuard requiredModule="admin_employee_leaves"><LazyRoute Component={EmployeeLeavePage} /></AdminRouteGuard>} />
        <Route path="my-attendance" element={<AdminRouteGuard requiredModule="admin_home"><LazyRoute Component={EmployeeAttendancePage} /></AdminRouteGuard>} />
        <Route path="classes" element={<AdminRouteGuard requiredModule="admin_classes"><LazyRoute Component={ClassesPage} /></AdminRouteGuard>} />
        <Route
          path="subjects"
          element={<AdminRouteGuard requiredModule="admin_subjects"><LazyRoute Component={SubjectsPage} /></AdminRouteGuard>}
        />
        <Route
          path="timetable"
          element={<AdminRouteGuard requiredModule="admin_timetable"><LazyRoute Component={TimetablePage} /></AdminRouteGuard>}
        />
          <Route
            path="examinations/cycles"
            element={<AdminRouteGuard requiredModule="admin_exams"><LazyRoute Component={ExamCyclesPage} /></AdminRouteGuard>}
          />
          <Route
            path="assessment-governance"
            element={<AdminRouteGuard requiredModule="admin_assessment_governance"><LazyRoute Component={AssessmentGovernancePage} /></AdminRouteGuard>}
          />
          <Route
            path="examinations/datesheets"
            element={<AdminRouteGuard requiredModule="admin_exams"><LazyRoute Component={DateSheetsPage} /></AdminRouteGuard>}
          />
          <Route
            path="examinations/ongoing"
            element={<AdminRouteGuard requiredModule="admin_exams"><LazyRoute Component={LiveOperationsPage} /></AdminRouteGuard>}
          />
          <Route
            path="examinations/evaluation"
            element={<AdminRouteGuard requiredModule="admin_exams"><LazyRoute Component={EvaluationCenterPage} /></AdminRouteGuard>}
          />
          <Route
            path="examinations/results"
            element={<AdminRouteGuard requiredModule="admin_exams"><LazyRoute Component={ResultsPublicationPage} /></AdminRouteGuard>}
          />
          <Route
            path="examinations/report-cards"
            element={<AdminRouteGuard requiredModule="admin_exams"><LazyRoute Component={AcademicReportCardsPage} /></AdminRouteGuard>}
          />
        <Route
          path="question-papers"
          element={<AdminRouteGuard requiredModule="admin_question_papers"><LazyRoute Component={QuestionPapersAdminPage} /></AdminRouteGuard>}
        />
        <Route
          path="academic-performance"
          element={<AdminRouteGuard requiredModule="admin_academic_performance"><LazyRoute Component={AcademicPerformancePage} /></AdminRouteGuard>}
        />
        <Route
          path="attendance"
          element={<AdminRouteGuard requiredModule="admin_attendance"><LazyRoute Component={AttendanceOverviewPage} /></AdminRouteGuard>}
        />
        <Route
          path="staff-attendance"
          element={<AdminRouteGuard requiredModule="admin_attendance"><LazyRoute Component={StaffAttendanceMgmtPage} /></AdminRouteGuard>}
        />
        <Route
          path="leave-management"
          element={<AdminRouteGuard requiredModule="admin_leave_management"><LazyRoute Component={LeaveManagementPage} /></AdminRouteGuard>}
        />
        <Route
          path="transport"
          element={<AdminRouteGuard requiredModule="admin_transport"><LazyRoute Component={TransportManagementPage} /></AdminRouteGuard>}
        />
        <Route
          path="fees"
          element={<AdminRouteGuard requiredModule="admin_fees"><LazyRoute Component={FeeManagementPage} /></AdminRouteGuard>}
        />
        <Route
          path="documents"
          element={<AdminRouteGuard requiredModule="admin_documents"><LazyRoute Component={AdminDocumentsPage} /></AdminRouteGuard>}
        />
        <Route
          path="student-duty"
          element={<AdminRouteGuard requiredModule="student_duty"><LazyRoute Component={StudentDutyAdminPage} /></AdminRouteGuard>}
        />
        <Route
          path="club-management"
          element={<AdminRouteGuard requiredModule="admin_clubs"><LazyRoute Component={AdminClubManagementPage} /></AdminRouteGuard>}
        />
        <Route
          path="committees"
          element={<AdminRouteGuard requiredModule="admin_clubs"><LazyRoute Component={AdminCommitteesPage} /></AdminRouteGuard>}
        />
        <Route
          path="achievements"
          element={<AdminRouteGuard requiredModule="admin_achievements"><LazyRoute Component={AdminAchievementsPage} /></AdminRouteGuard>}
        />
        <Route
          path="calendar-management"
          element={<AdminRouteGuard requiredModule="admin_calendar"><LazyRoute Component={AdminSchoolCalendarPage} /></AdminRouteGuard>}
        />
        <Route
          path="calendar"
          element={<AdminRouteGuard requiredModule="admin_calendar"><LazyRoute Component={SchoolCalendarPage} /></AdminRouteGuard>}
        />
        <Route
          path="announcements"
          element={<AdminRouteGuard requiredModule="admin_notices"><LazyRoute Component={AdminAnnouncementsPage} /></AdminRouteGuard>}
        />
        <Route path="notices" element={<AdminRouteGuard requiredModule="admin_notices"><LazyRoute Component={NoticesPage} /></AdminRouteGuard>} />
        <Route
          path="analytics-workload"
          element={<AdminRouteGuard requiredModule="admin_analytics_workload"><LazyRoute Component={WorkloadAnalyticsPage} /></AdminRouteGuard>}
        />
        <Route
          path="institutional-planning"
          element={<AdminRouteGuard requiredModule="admin_institutional_planning"><LazyRoute Component={InstitutionalPlanningPage} /></AdminRouteGuard>}
        />
        <Route
          path="profile"
          element={<AdminRouteGuard requiredModule="admin_profile"><LazyRoute Component={AdminProfilePage} /></AdminRouteGuard>}
        />
        <Route
          path="manage-departments"
          element={<AdminRouteGuard requiredModule="admin_manage_departments"><LazyRoute Component={ManageDepartmentsPage} /></AdminRouteGuard>}
        />
        <Route
          path="access-control"
          element={<AdminRouteGuard requiredModule="admin_access_control"><LazyRoute Component={SystemAdministrationPage} /></AdminRouteGuard>}
        />
        <Route
          path="communication-center"
          element={<AdminRouteGuard requiredModule="admin_communication_center"><LazyRoute Component={CommunicationCenterPage} /></AdminRouteGuard>}
        />
        <Route path="support" element={<AdminRouteGuard requiredModule="support_center"><LazyRoute Component={SupportCenterPage} /></AdminRouteGuard>} />
        <Route path="support-management" element={<AdminRouteGuard requiredModule="admin_support_management"><LazyRoute Component={SupportManagementPage} /></AdminRouteGuard>} />
        <Route path="student-exit-management" element={<AdminRouteGuard requiredModule="admin_student_exit"><LazyRoute Component={StudentExitManagementPage} /></AdminRouteGuard>} />
        <Route
          path="school-settings"
          element={
            <AdminRouteGuard requiredModule="admin_school_settings">
              <LazyRoute
                Component={PortalInDevelopment}
                title="School Settings"
              />
            </AdminRouteGuard>
          }
        />
      </Route>

      {/* Auth Route */}
      <Route path="/login" element={<LazyRoute Component={LoginPage} />} />
      <Route path="/force-reset-password" element={<LazyRoute Component={ForcePasswordResetPage} />} />

      {/* Global Fallback Route */}
      <Route path="*" element={<NavigateToDashboard />} />
    </Routes>
  );
}

function App() {
  const [resetCounter, setResetCounter] = useState(0);

  useEffect(() => {
    const handleReset = () => {
      setResetCounter((prev) => prev + 1);
    };
    window.addEventListener("erp-reset-event", handleReset);
    return () => window.removeEventListener("erp-reset-event", handleReset);
  }, []);

  return (
    <BrowserRouter key={resetCounter}>
      <AuthProvider>
        <LanguageProvider>
          <StudentProvider>
            <AppContent />
          </StudentProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;



// Trigger HMR
