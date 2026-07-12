import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import HelperPopup from "../../components/HelperPopup";
import MainCard from "../../components/MainCard";
import { getSubjectCurriculum } from "../../services/academicsService";
import { useService } from "../../hooks/useService";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Hash,
  GraduationCap,
  Calendar,
  User,
  FlaskConical,
  Calculator,
  Monitor,
  Globe,
  Dumbbell,
  CheckCircle2,
} from "lucide-react";

const SUBJECT_ICONS = {
  phy: FlaskConical,
  chem: FlaskConical,
  math: Calculator,
  cs: Monitor,
  eng: Globe,
  pe: Dumbbell,
  bio: FlaskConical,
  acc: BookOpen,
  bst: BookOpen,
  eco: Globe,
  his: BookOpen,
  pol: BookOpen,
  geo: Globe,
  soc: BookOpen,
  hs: BookOpen,
};

const pageVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

function AccordionSection({ titleKey, children, defaultOpen = false, onHelpClick }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { t } = useLanguage();
  const title = t(titleKey);

  return (
    <MainCard 
      className="mb-5"
      whileHover={{ y: 0 }}
      initial="visible"
    >
      <div
        className="flex items-center justify-between w-full px-5 py-5 cursor-pointer select-none hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen((prev) => !prev)}
        role="button"
        aria-expanded={isOpen}
      >
        <h2 className="text-base font-extrabold text-[#03045e] flex items-center gap-2">
          {title}
        </h2>
        <div className="flex items-center gap-3">
          {onHelpClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onHelpClick(titleKey);
              }}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-[#caf0f8] text-[#0077b6] hover:bg-[#00b4d8]/20 transition-colors shadow-sm"
              aria-label="Help"
            >
              <span className="font-black text-sm">?</span>
            </button>
          )}
          {isOpen ? (
            <ChevronUp size={20} className="text-gray-400" />
          ) : (
            <ChevronDown size={20} className="text-gray-400" />
          )}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="accordion-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100 bg-white"
          >
            <div className="p-5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </MainCard>
  );
}

const HELPER_CONTENT = {
  "curriculum.syllabus": {
    en: "This section shows the topics and chapters covered in this subject during the academic session.",
    hi: "यह अनुभाग शैक्षणिक सत्र के दौरान इस विषय में शामिल विषयों और अध्यायों को दिखाता है।",
  },
  "curriculum.outcomes": {
    en: "These are the skills and knowledge expected to be acquired by the end of the course.",
    hi: "ये वे कौशल और ज्ञान हैं जो पाठ्यक्रम के अंत तक प्राप्त होने की उम्मीद है।",
  },
  "curriculum.textbooks": {
    en: "Official and recommended books for studying this subject.",
    hi: "इस विषय का अध्ययन करने के लिए आधिकारिक और अनुशंसित पुस्तकें।",
  },
};

export default function SubjectDetailPage({ subjectId, onBack }) {
  const params = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();

  const resolvedSubjectId = subjectId || params.subjectId;
  const resolvedOnBack = onBack || (() => navigate(`/${role?.toLowerCase()}/subjects`));

  const { lang, t } = useLanguage();
  const { isParent: isParentMode } = useAuth();
  const { data, loading, error } = useService(getSubjectCurriculum, [resolvedSubjectId], [resolvedSubjectId]);

  if (error) throw error;

  const [activeHelper, setActiveHelper] = useState(null);

  const handleHelpClick = useCallback((titleKey) => {
    setActiveHelper(titleKey);
  }, []);

  const handleHelperClose = useCallback(() => {
    setActiveHelper(null);
  }, []);

  const activeHelperContent = activeHelper ? HELPER_CONTENT[activeHelper] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const Icon = SUBJECT_ICONS[resolvedSubjectId] ?? BookOpen;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={resolvedOnBack}
          className="p-3 rounded-2xl shadow-sm flex-shrink-0 transition-all hover:bg-gray-50 bg-white border border-[#caf0f8]"
          aria-label="Go back"
        >
          <ArrowLeft size={24} className="text-[#03045e]" />
        </button>
        <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: "#03045e" }}>
          <Icon size={31} className="text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-black" style={{ color: "#03045e" }}>
            {data.title}
          </h1>
          <p className="text-sm text-gray-500">
            {t("curriculum.subjectDetails", { fallback: "Subject Details" })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { labelKey: "curriculum.code", value: data.code, icon: Hash, color: "#0077b6", bg: "#caf0f8" },
          { labelKey: "curriculum.class", value: data.classLevel, icon: GraduationCap, color: "#7c3aed", bg: "#ede9fe" },
          { labelKey: "curriculum.session", value: data.academicSession, icon: Calendar, color: "#059669", bg: "#d1fae5" },
          { labelKey: "curriculum.teacher", value: data.teacher, icon: User, color: "#d97706", bg: "#fef3c7" },
        ].map((info, idx) => (
          <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm" style={{ outline: "1px solid #caf0f8" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: info.bg }}>
              <info.icon size={24} style={{ color: info.color }} />
            </div>
            <div>
              <span className="text-base font-black block leading-none" style={{ color: "#03045e" }}>{info.value}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mt-1 block">
                {t(info.labelKey, { fallback: info.labelKey.split('.').pop() })}
              </span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-gray-600 font-medium mb-8 text-base md:px-1 leading-relaxed">
        {data.description}
      </p>

      <div className="space-y-4">
        <AccordionSection titleKey="curriculum.info" defaultOpen={true}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-1.5">
                <Hash size={14} /> {t("curriculum.code", { fallback: "Subject Code" })}
              </p>
              <p className="font-bold text-[#03045e]">{data.code}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-1.5">
                <GraduationCap size={14} /> {t("curriculum.class", { fallback: "Class" })}
              </p>
              <p className="font-bold text-[#03045e]">{data.classLevel}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-1.5">
                <Calendar size={14} /> {t("curriculum.session", { fallback: "Academic Session" })}
              </p>
              <p className="font-bold text-[#03045e]">{data.academicSession}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs font-bold text-gray-400 mb-1 flex items-center gap-1.5">
                <User size={14} /> {t("curriculum.teacher", { fallback: "Course Teacher" })}
              </p>
              <p className="font-bold text-[#03045e]">{data.teacher}</p>
            </div>
          </div>
        </AccordionSection>

        <AccordionSection titleKey="curriculum.objectives" defaultOpen={true}>
          <ul className="space-y-3">
            {(data.objectives || []).map((obj, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[#00b4d8] shrink-0 mt-0.5" />
                <span className="font-semibold text-gray-700">{obj}</span>
              </li>
            ))}
          </ul>
        </AccordionSection>

        <AccordionSection
          titleKey="curriculum.syllabus"
          defaultOpen={true}
          onHelpClick={handleHelpClick}
        >
          <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 w-full">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 font-bold text-gray-600 text-sm w-16 text-center">
                    {t("curriculum.sno", { fallback: "S.No" })}
                  </th>
                  <th className="py-3 px-4 font-bold text-gray-600 text-sm w-1/3">
                    {t("curriculum.unit", { fallback: "Unit Name" })}
                  </th>
                  <th className="py-3 px-4 font-bold text-gray-600 text-sm">
                    {t("curriculum.topics", { fallback: "Topics Covered" })}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data.curriculum || []).map((item, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 text-center font-bold text-gray-400">{i + 1}</td>
                    <td className="py-4 px-4 font-bold text-[#03045e]">{item.unit}</td>
                    <td className="py-4 px-4 font-medium text-gray-600 leading-relaxed">
                      {item.topics}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-4">
            {(data.curriculum || []).map((item, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex gap-4"
              >
                <div className="font-black text-xl text-gray-300 w-6 shrink-0">{i + 1}</div>
                <div>
                  <h4 className="font-bold text-[#03045e] mb-1 leading-snug">{item.unit}</h4>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed">
                    {item.topics}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AccordionSection>

        <AccordionSection
          titleKey="curriculum.outcomes"
          onHelpClick={handleHelpClick}
        >
          <ul className="space-y-3">
            {(data.outcomes || []).map((obj, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-[#00b4d8] shrink-0 mt-0.5" />
                <span className="font-semibold text-gray-700">{obj}</span>
              </li>
            ))}
          </ul>
        </AccordionSection>

        <AccordionSection
          titleKey="curriculum.textbooks"
          onHelpClick={handleHelpClick}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(data.textbooks || []).map((book, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2 shadow-sm"
              >
                <span
                  className={`self-start text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full ${
                    book.type === "main"
                      ? "bg-[#00b4d8]/10 text-[#00b4d8]"
                      : "bg-[#03045e]/10 text-[#03045e]"
                  }`}
                >
                  {book.type === "main" ? t("curriculum.mainBook", { fallback: "Main Textbook" }) : t("curriculum.refBook", { fallback: "Reference Book" })}
                </span>
                <h4 className="font-bold text-gray-800 leading-snug">{book.title}</h4>
                <p className="text-sm font-semibold text-gray-500 mt-auto">
                  {t("curriculum.author", { fallback: "Author" })}: {book.author}
                </p>
              </div>
            ))}
          </div>
        </AccordionSection>
      </div>

      <HelperPopup
        isOpen={activeHelper !== null}
        onClose={handleHelperClose}
        titleKey={activeHelper || "curriculum.syllabus"}
        contentEn={activeHelperContent?.en ?? ""}
        contentHi={activeHelperContent?.hi ?? ""}
      />
    </motion.div>
  );
}

