import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  Users,
  Hash,
  GraduationCap,
  Cpu,
  FlaskConical,
  Calculator,
  Monitor,
  Globe,
  Dumbbell,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import HelperButton from "../components/HelperButton";
import HelperPopup from "../components/HelperPopup";

const NAVY = "#03045e";
const TEAL = "#0077b6";
const SAGE = "#00b4d8";
const LIME = "#caf0f8";

// Subject icon map keyed by subject id
const SUBJECT_ICONS = {
  phy: FlaskConical,
  chem: FlaskConical,
  math: Calculator,
  cs: Monitor,
  eng: Globe,
  pe: Dumbbell,
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function TypeBadge({ type }) {
  const isElective = type === "elective";
  return (
    <span
      className="text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full flex-shrink-0"
      style={{
        backgroundColor: isElective ? TEAL + "22" : SAGE + "33",
        color: isElective ? TEAL : SAGE,
      }}
    >
      {isElective ? "Elective" : "Core"}
    </span>
  );
}

function SubjectCard({ course }) {
  const IconComponent = SUBJECT_ICONS[course.id] ?? BookOpen;

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col"
      style={{ outline: `1px solid ${LIME}` }}
      role="article"
      aria-label={`${course.name} — ${course.code}`}
    >
      {/* Accent top bar */}
      <div
        className="h-1.5 w-full"
        style={{
          background:
            course.type === "elective"
              ? `linear-gradient(90deg, ${TEAL}, ${SAGE})`
              : `linear-gradient(90deg, ${NAVY}, ${TEAL})`,
        }}
        aria-hidden="true"
      />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Header */}
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
                {course.name}
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
          <TypeBadge type={course.type} />
        </div>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed">
          {course.description}
        </p>

        {/* Schedule */}
        <div
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl self-start"
          style={{ backgroundColor: LIME }}
        >
          <Clock size={17} style={{ color: TEAL }} aria-hidden="true" />
          <span className="text-xs font-semibold" style={{ color: NAVY }}>
            {course.schedule}
          </span>
        </div>

        {/* Teachers */}
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Users size={17} style={{ color: TEAL }} aria-hidden="true" />
            <span
              className="text-xs font-extrabold uppercase tracking-wide"
              style={{ color: TEAL }}
            >
              Teachers
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {course.teachers.map((t, i) => (
              <span
                key={i}
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: NAVY + "12", color: NAVY }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function CoursesPage({ courses = [] }) {
  const { t } = useLanguage();
  const [showHelper, setShowHelper] = useState(false);

  const core = courses.filter((c) => c.type === "core");
  const elective = courses.filter((c) => c.type === "elective");

  return (
    <>
      <div className="relative">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl" style={{ backgroundColor: NAVY }}>
            <BookOpen size={26} className="text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: NAVY }}>
              My Subjects
            </h1>
            <p className="text-sm text-gray-500">Class 11 — Science Stream</p>
          </div>
          <div className="ml-auto">
            <HelperButton
              onClick={() => setShowHelper(true)}
              className="relative"
            />
          </div>
        </div>

        {/* Core subjects */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: NAVY }}
              aria-hidden="true"
            />
            <h2 className="text-base font-extrabold" style={{ color: NAVY }}>
              Core Subjects
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
              <SubjectCard key={course.id} course={course} />
            ))}
          </motion.div>
        </div>

        {/* Electives */}
        {elective.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: TEAL }}
                aria-hidden="true"
              />
              <h2 className="text-base font-extrabold" style={{ color: NAVY }}>
                Elective Subjects
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
                <SubjectCard key={course.id} course={course} />
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
