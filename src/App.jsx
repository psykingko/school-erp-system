import React, { useRef, useState, useCallback, useMemo } from "react";
import { dummyData } from "./data/dummyData";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import HeroBanner from "./components/HeroBanner";
import ActionNeededSection from "./components/ActionNeededSection";
import AttendanceCard from "./components/AttendanceCard";
import FeeCard from "./components/FeeCard";
import SubjectAttendanceCards from "./components/SubjectAttendanceCards";
import TimetableCard from "./components/TimetableCard";
import CredentialsCard from "./components/CredentialsCard";
import LMSCard from "./components/LMSCard";
import VCMessageCard from "./components/VCMessageCard";
import NoticeBoard from "./components/NoticeBoard";
import EventBoard from "./components/EventBoard";
import CoursesPage from "./pages/CoursesPage";
import FacultyPage from "./pages/FacultyPage";
import WeeklyTimetablePage from "./pages/WeeklyTimetablePage";
import ExaminationPage from "./pages/ExaminationPage";
import SchoolCalendarPage from "./pages/SchoolCalendarPage";
import { formatDate } from "./utils/attendanceHelpers";
import { LanguageProvider } from "./context/LanguageContext";
import { ViewModeProvider } from "./context/ViewModeContext";
import { motion, AnimatePresence } from "framer-motion";

// FIX: compute once at module level — never changes at runtime
const CURRENT_DATE = formatDate(new Date());

// Pre-filter attendance warnings once — dummyData is static
const ATTENDANCE_WARNINGS = dummyData.attendance.subjects.filter(
  (s) => s.percentage < 75,
);

// ── Home dashboard ────────────────────────────────────────────────────────────
function HomePage() {
  // FIX: use individual refs instead of a plain object literal.
  // A plain object `{ key: useRef() }` is recreated every render, making
  // handleNavigate's closure always capture a fresh (but correct) object.
  // Using a single stable ref-of-object avoids the recreation entirely.
  const attendanceRef = useRef(null);
  const feeRef = useRef(null);
  const timetableRef = useRef(null);
  const lmsRef = useRef(null);

  // Stable map — created once, never changes
  const sectionRefs = useRef({
    "section-attendance": attendanceRef,
    "section-fee": feeRef,
    "section-timetable": timetableRef,
    "section-lms": lmsRef,
  });

  const [highlightedSection, setHighlightedSection] = useState(null);

  // FIX: dependency array now correctly lists sectionRefs (stable ref object)
  const handleNavigate = useCallback((sectionId) => {
    const ref = sectionRefs.current[sectionId];
    const el = ref?.current;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlightedSection(sectionId);
    setTimeout(() => setHighlightedSection(null), 2000);
  }, []); // sectionRefs.current is stable — no deps needed

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

  return (
    <div className="flex gap-6 items-start">
      <div className="flex-1 min-w-0">
        <HeroBanner student={dummyData.student} />

        <div className="mt-6">
          <ActionNeededSection
            attendanceWarnings={ATTENDANCE_WARNINGS}
            nextExam={dummyData.widgets.nextExam}
            fees={dummyData.fees}
            pendingAssignments={dummyData.lms.pendingAssignments}
            onNavigate={handleNavigate}
          />
        </div>

        {/* Attendance + Fee */}
        <div
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
          ref={attendanceRef}
          style={glowStyle("section-attendance")}
        >
          <AttendanceCard
            overall={dummyData.attendance.overall}
            label="Overall Attendance"
          />
          <div ref={feeRef} style={glowStyle("section-fee")}>
            <FeeCard
              amount={dummyData.fees.amount}
              currency={dummyData.fees.currency}
              dueDate={dummyData.fees.dueDate}
              status={dummyData.fees.status}
              amountPaid={dummyData.fees.amountPaid}
              totalAmount={dummyData.fees.totalAmount}
            />
          </div>
        </div>

        <div className="mt-6">
          <SubjectAttendanceCards subjects={dummyData.attendance.subjects} />
        </div>

        {/* Timetable + Credentials */}
        <div
          className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6"
          ref={timetableRef}
          style={glowStyle("section-timetable")}
        >
          <div className="lg:col-span-2">
            <TimetableCard classes={dummyData.timetable.today} />
          </div>
          <div className="flex flex-col gap-4">
            <CredentialsCard {...dummyData.credentials.library} index={0} />
            <CredentialsCard {...dummyData.credentials.email} index={1} />
          </div>
        </div>

        {/* LMS + VC Message */}
        <div
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
          ref={lmsRef}
          style={glowStyle("section-lms")}
        >
          <LMSCard
            courseCompletion={dummyData.lms.courseCompletion}
            pendingAssignments={dummyData.lms.pendingAssignments}
            learningStreak={dummyData.lms.learningStreak}
            lmsUrl={dummyData.lms.lmsUrl}
            index={0}
          />
          <VCMessageCard
            vcName={dummyData.vcMessage.vcName}
            vcTitle={dummyData.vcMessage.vcTitle}
            message={dummyData.vcMessage.message}
            avatarColor={dummyData.vcMessage.avatarColor}
            index={1}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NoticeBoard
            notices={dummyData.notices}
            examNotices={dummyData.examNotices}
            index={0}
          />
          <EventBoard
            happenings={dummyData.happenings}
            upcoming={dummyData.upcoming}
            index={1}
          />
        </div>
      </div>
    </div>
  );
}

// ── App content ───────────────────────────────────────────────────────────────
function AppContent() {
  const { navItems, student, notifications } = dummyData;
  const [activePage, setActivePage] = useState("home");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarOpenRef = useRef(null);

  // FIX: memoize so Sidebar doesn't re-render on every AppContent render
  const handleMenuClick = useCallback(() => {
    if (sidebarOpenRef.current) sidebarOpenRef.current();
  }, []);

  // FIX: memoize so Sidebar doesn't re-render on every AppContent render
  const handleNavClick = useCallback((item) => {
    setActivePage(item.id);
  }, []);

  // FIX: memoize — only recomputes when activePage changes
  const navWithActive = useMemo(
    () => navItems.map((item) => ({ ...item, active: item.id === activePage })),
    [navItems, activePage],
  );

  const renderPage = () => {
    switch (activePage) {
      case "courses":
        return <CoursesPage courses={dummyData.courses} />;
      case "faculty":
        return <FacultyPage faculty={dummyData.faculty} />;
      case "timetable":
        return (
          <WeeklyTimetablePage weeklyTimetable={dummyData.weeklyTimetable} />
        );
      case "examination":
        return <ExaminationPage examination={dummyData.examination} />;
      case "calendar":
        return <SchoolCalendarPage schoolCalendar={dummyData.schoolCalendar} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#caf0f8]">
      <Sidebar
        navItems={navWithActive}
        student={student}
        openRef={sidebarOpenRef}
        onNavClick={handleNavClick}
        onCollapse={setSidebarCollapsed}
      />

      {/* Main content — margin animates in sync with sidebar width */}
      <motion.div
        animate={{ marginLeft: sidebarCollapsed ? 64 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex-1 flex flex-col min-w-0 md:ml-0"
      >
        <Header
          student={student}
          notifications={notifications}
          currentDate={CURRENT_DATE}
          onMenuClick={handleMenuClick}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {renderPage()}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <ViewModeProvider>
        <AppContent />
      </ViewModeProvider>
    </LanguageProvider>
  );
}

export default App;
