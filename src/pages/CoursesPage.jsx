import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Users,
  Hash,
  FlaskConical,
  Calculator,
  Monitor,
  Globe,
  Dumbbell,
  Library,
  Briefcase,
  TrendingUp,
  Landmark,
  Scale,
  Palmtree,
  UserCheck,
  Home,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import HelperButton from "../components/HelperButton";
import HelperPopup from "../components/HelperPopup";
import MainCard from "../components/MainCard";
import { getCourses } from "../services/academicsService";
import { useService } from "../hooks/useService";
import { useStudent } from "../context/StudentContext";
import ChildScopeSwitcher from "../components/parent/ChildScopeSwitcher";

const NAVY = "#03045e";
const TEAL = "#0077b6";
const SAGE = "#00b4d8";
const LIME = "#caf0f8";

const SUBJECT_ICONS = {
  phy: FlaskConical,
  chem: FlaskConical,
  math: Calculator,
  cs: Monitor,
  eng: Globe,
  pe: Dumbbell,
  bio: Library,
  acc: Briefcase,
  bst: TrendingUp,
  eco: Landmark,
  his: Scale,
  pol: Landmark,
  geo: Palmtree,
  soc: UserCheck,
  hs: Home,
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function TypeBadge({ category }) {
  const { t } = useLanguage();
  const isElective = category === "optional";
  return (
    <span
      className="text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full flex-shrink-0"
      style={{
        backgroundColor: isElective ? TEAL + "22" : SAGE + "33",
        color: isElective ? TEAL : SAGE,
      }}
    >
      {isElective ? t("curriculum.type.elective") : t("curriculum.type.core")}
    </span>
  );
}

function SubjectCard({ course, onNavigatePage }) {
  const IconComponent = SUBJECT_ICONS[course.id] ?? BookOpen;
  const { t } = useLanguage();

  return (
    <MainCard
      variants={cardVariants}
      className="h-full flex flex-col"
      aria-label={`${course.name} — ${course.code}`}
    >
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="p-2.5 rounded-2xl flex-shrink-0"
              style={{ backgroundColor: LIME }}
            >
              <IconComponent
                size={29}
                style={{ color: NAVY }}
                aria-hidden="true"
              />
            </div>
            <div className="min-w-0">
              <h3
                className="text-base font-extrabold leading-tight"
                style={{ color: NAVY }}
              >
                {t(course.id.replace('-', '.')) || course.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Hash size={14} style={{ color: TEAL }} aria-hidden="true" />
                <span
                  className="text-xs font-bold font-mono"
                  style={{ color: TEAL }}
                >
                  {course.code}
                </span>
              </div>
            </div>
          </div>
          <TypeBadge category={course.category} />
        </div>

        <p className="text-sm text-gray-500 leading-relaxed">
          {course.description || "Course curriculum and objectives are available on the subject details page."}
        </p>

        <div
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl self-start"
          style={{ backgroundColor: LIME }}
        >
          <Clock size={17} style={{ color: TEAL }} aria-hidden="true" />
          <span className="text-xs font-semibold" style={{ color: NAVY }}>
            {course.schedule || "Regular Schedule"}
          </span>
        </div>

          {course.teachers && course.teachers.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Users size={17} style={{ color: TEAL }} aria-hidden="true" />
                <span
                  className="text-xs font-extrabold uppercase tracking-wide"
                  style={{ color: TEAL }}
                >
                  {t("courses.teachers")}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {course.teachers.map((t_name, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: NAVY + "12", color: NAVY }}
                  >
                    {t_name}
                  </span>
                ))}
              </div>
            </div>
          )}

        <div className="mt-auto pt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigatePage(`subject_${course.id}`);
            }}
            className="w-full bg-white hover:bg-[#caf0f8] text-[#03045e] border-2 border-[#03045e] font-bold py-2 rounded-xl transition-colors text-sm shadow-sm flex items-center justify-center gap-2"
          >
            <BookOpen size={16} />
            {t("curriculum.viewBtn")}
          </button>
        </div>
      </div>
    </MainCard>
  );
}

function CoursesPage({ onNavigatePage }) {
  const { t } = useLanguage();
  const { activeStudentId } = useStudent();
  const [showHelper, setShowHelper] = useState(false);
  const { data: courses, loading, error } = useService(getCourses, [activeStudentId], [activeStudentId]);

  if (error) throw error;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const core = (courses || []).filter((c) => c.category === "academic");
  const elective = (courses || []).filter((c) => c.category === "optional");

  return (
    <>
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl" style={{ backgroundColor: NAVY }}>
              <BookOpen size={26} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{ color: NAVY }}>
                {t("courses.title")}
              </h1>
              <p className="text-sm text-gray-500">{t("courses.subtitle")}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <HelperButton onClick={() => setShowHelper(true)} />
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: NAVY }}
              aria-hidden="true"
            />
            <h2 className="text-base font-extrabold" style={{ color: NAVY }}>
              {t("courses.core")}
            </h2>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: NAVY + "15", color: NAVY }}
            >
              {core.length}
            </span>
          </div>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {core.map((course) => (
              <SubjectCard key={course.id} course={course} onNavigatePage={onNavigatePage} />
            ))}
          </motion.div>
        </div>

        {elective.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: TEAL }}
                aria-hidden="true"
              />
              <h2 className="text-base font-extrabold" style={{ color: NAVY }}>
                {t("courses.elective")}
              </h2>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: TEAL + "22", color: TEAL }}
              >
                {elective.length}
              </span>
            </div>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {elective.map((course) => (
                <SubjectCard key={course.id} course={course} onNavigatePage={onNavigatePage} />
              ))}
            </motion.div>
          </div>
        )}
      </div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="courses.title"
        contentEn="My Subjects shows all subjects for Class 11 Science stream. Each card shows the subject code, schedule, room, and assigned teachers. Core subjects are compulsory; electives are optional."
        contentHi="मेरे विषय कक्षा 11 विज्ञान स्ट्रीम के सभी विषय दिखाते हैं। प्रत्येक कार्ड में विषय कोड, समय-सारणी, कमरा और नियुक्त शिक्षक दिखाए जाते हैं। मुख्य विषय अनिवार्य हैं; ऐच्छिक विषय वैकल्पिक हैं।"
      />
    </>
  );
}

export default CoursesPage;
