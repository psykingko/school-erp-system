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
// Lazy Loaded Pages
const CoursesPage = lazy(() => import("./pages/shared/CoursesPage"));
const FacultyPage = lazy(() => import("./pages/shared/FacultyPage"));
const WeeklyTimetablePage = lazy(() => import("./pages/shared/WeeklyTimetablePage"));
const ExaminationPage = lazy(() => import("./pages/shared/ExaminationPage"));
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
const LeavePage = lazy(() => import("./pages/student/LeavePage"));

// Teacher Portal Pages
const TeacherDashboard = lazy(() => import("./pages/teacher/TeacherDashboard"));
const AttendanceMgmtPage = lazy(
  () => import("./pages/teacher/AttendanceMgmtPage"),
);
const AssignmentsManagementPage = lazy(
  () => import("./pages/teacher/AssignmentsManagementPage"),
);
const QuestionPapersPage = lazy(() => import("./pages/teacher/QuestionPapersPage"));
const MarksExamsPage = lazy(() => import("./pages/teacher/MarksExamsPage"));
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

// Admin Portal Pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const StudentsPage = lazy(() => import("./pages/admin/StudentsPage"));
const StudentDetailsAdminPage = lazy(() => import("./pages/admin/StudentDetailsPage"));
const TeachersPage = lazy(() => import("./pages/admin/TeachersPage"));
const ParentsPage = lazy(() => import("./pages/admin/ParentsPage"));
const AdminsPage = lazy(() => import("./pages/admin/AdminsPage"));
const ClassesPage = lazy(() => import("./pages/admin/ClassesPage"));
const SubjectsPage = lazy(() => import("./pages/admin/SubjectsPage"));
const SubjectAllocationPage = lazy(
  () => import("./pages/admin/SubjectAllocationPage"),
);
const TimetablePage = lazy(() => import("./pages/admin/TimetablePage"));
const ExaminationsPage = lazy(() => import("./pages/admin/ExaminationsPage"));
const QuestionPapersAdminPage = lazy(() => import("./pages/admin/QuestionPapersAdminPage"));
const AttendanceOverviewPage = lazy(
  () => import("./pages/admin/AttendanceOverviewPage"),
);
const LeaveApprovalsPage = lazy(
  () => import("./pages/admin/LeaveApprovalsPage"),
);
const FeeManagementPage = lazy(() => import("./pages/admin/FeeManagementPage"));
const TransportManagementPage = lazy(
  () => import("./pages/admin/TransportManagementPage"),
);
const AdminDocumentsPage = lazy(() => import("./pages/admin/DocumentsPage"));
const NoticesPage = lazy(() => import("./pages/admin/NoticesPage"));
const AdminAnnouncementsPage = lazy(
  () => import("./pages/admin/AnnouncementsPage"),
);
const AdminClubsPage = lazy(() => import("./pages/admin/ClubsPage"));
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
const AdminProfilePage = lazy(() => import("./pages/admin/AdminProfilePage"));
const ManageDepartmentsPage = lazy(
  () => import("./pages/admin/ManageDepartmentsPage"),
);
const AccessControlPage = lazy(() => import("./pages/admin/AccessControlPage"));
const CommunicationCenterPage = lazy(
  () => import("./pages/admin/CommunicationCenterPage"),
);
const EmployeeDirectoryPage = lazy(
  () => import("./pages/admin/EmployeeDirectoryPage"),
);
const EmployeeLeavePage = lazy(
  () => import("./pages/admin/EmployeeLeavePage"),
);
const LeaveApprovalPage = lazy(
  () => import("./pages/admin/LeaveApprovalPage"),
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
import LoginPage from "./pages/auth/LoginPage";

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
          <LoginPage />
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
          path="examinations"
          element={<LazyRoute Component={ExaminationPage} />}
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
          path="assignments"
          element={<LazyRoute Component={AssignmentsManagementPage} />}
        />
        <Route
          path="question-papers"
          element={<LazyRoute Component={QuestionPapersPage} />}
        />
        <Route
          path="marks"
          element={<LazyRoute Component={MarksExamsPage} />}
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
          path="mentorship"
          element={<LazyRoute Component={TeacherMentorSupportPage} />}
        />
        <Route
          path="class-updates"
          element={<LazyRoute Component={AnnouncementsPage} />}
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
          element={<LazyRoute Component={AdminDashboard} />}
        />
        <Route
          path="students"
          element={<LazyRoute Component={StudentsPage} />}
        />
        <Route
          path="students/:id"
          element={<LazyRoute Component={StudentDetailsAdminPage} />}
        />
        <Route
          path="teachers"
          element={<LazyRoute Component={TeachersPage} />}
        />
        <Route path="parents" element={<LazyRoute Component={ParentsPage} />} />
        <Route path="admins" element={<LazyRoute Component={AdminsPage} />} />
        <Route path="employees" element={<LazyRoute Component={EmployeeDirectoryPage} />} />
        <Route path="employee-leaves" element={<LazyRoute Component={EmployeeLeavePage} />} />
        <Route path="classes" element={<LazyRoute Component={ClassesPage} />} />
        <Route
          path="subjects"
          element={<LazyRoute Component={SubjectsPage} />}
        />
        <Route
          path="subject-alloc"
          element={<LazyRoute Component={SubjectAllocationPage} />}
        />
        <Route
          path="timetable"
          element={<LazyRoute Component={TimetablePage} />}
        />
        <Route
          path="exams"
          element={<LazyRoute Component={ExaminationsPage} />}
        />
        <Route
          path="question-papers"
          element={<LazyRoute Component={QuestionPapersAdminPage} />}
        />
        <Route
          path="academic-performance"
          element={<LazyRoute Component={AcademicPerformancePage} />}
        />
        <Route
          path="attendance"
          element={<LazyRoute Component={AttendanceOverviewPage} />}
        />
        <Route
          path="leave-approval"
          element={<LazyRoute Component={LeaveApprovalPage} />}
        />
        <Route
          path="transport"
          element={<LazyRoute Component={TransportManagementPage} />}
        />
        <Route
          path="fees"
          element={<LazyRoute Component={FeeManagementPage} />}
        />
        <Route
          path="documents"
          element={<LazyRoute Component={AdminDocumentsPage} />}
        />
        <Route
          path="clubs"
          element={<LazyRoute Component={AdminClubsPage} />}
        />
        <Route
          path="committees"
          element={<LazyRoute Component={AdminCommitteesPage} />}
        />
        <Route
          path="achievements"
          element={<LazyRoute Component={AdminAchievementsPage} />}
        />
        <Route
          path="calendar"
          element={<LazyRoute Component={AdminSchoolCalendarPage} />}
        />
        <Route
          path="announcements"
          element={<LazyRoute Component={AdminAnnouncementsPage} />}
        />
        <Route path="notices" element={<LazyRoute Component={NoticesPage} />} />
        <Route
          path="analytics-workload"
          element={<LazyRoute Component={WorkloadAnalyticsPage} />}
        />
        <Route
          path="profile"
          element={<LazyRoute Component={AdminProfilePage} />}
        />
        <Route
          path="manage-departments"
          element={<LazyRoute Component={ManageDepartmentsPage} />}
        />
        <Route
          path="access-control"
          element={<LazyRoute Component={AccessControlPage} />}
        />
        <Route
          path="communication-center"
          element={<LazyRoute Component={CommunicationCenterPage} />}
        />
        <Route
          path="school-settings"
          element={
            <LazyRoute
              Component={PortalInDevelopment}
              title="School Settings"
            />
          }
        />
      </Route>

      {/* Auth Route */}
      <Route path="/login" element={<LoginPage />} />

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



