import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  CalendarDays,
  ClipboardList,
  Clock,
  Info
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import HelperButton from "../../components/HelperButton";
import HelperPopup from "../../components/HelperPopup";
import MainCard from "../../components/MainCard";
import { getExamData } from "../../services/examService";
import { useService } from "../../hooks/useService";
import { useStudent } from "../../context/StudentContext";
import ChildScopeSwitcher from "../../components/parent/ChildScopeSwitcher";
import EmptyState from "../../components/common/EmptyState";
import CycleSelector from "../../components/examinations/CycleSelector";

const NAVY = "#03045e";
const TEAL = "#0077b6";
const SAGE = "#00b4d8";
const LIME = "#caf0f8";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: "easeOut" },
  },
};


function ScheduleSection({ schedule = [], examName }) {
  const { t } = useLanguage();
  return (
    <MainCard variants={cardVariants}>
      <div className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl" style={{ backgroundColor: LIME }}>
            <CalendarDays size={26} style={{ color: TEAL }} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-extrabold" style={{ color: NAVY }}>
              {t("exam.schedule")}
            </h3>
            <p className="text-xs text-gray-400">{examName || "Upcoming Examinations"}</p>
          </div>
        </div>

        {schedule.length === 0 ? (
          <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-sm font-bold text-gray-500">Date Sheet has not been published yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {schedule.map((exam, i) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5"
                style={{
                  backgroundColor: i % 2 === 0 ? LIME : "white",
                  outline: i % 2 !== 0 ? `1px solid ${LIME}` : "none",
                }}
              >
                <div className="flex-shrink-0 w-12 text-center">
                  <p className="text-xs font-extrabold" style={{ color: TEAL }}>
                    {exam.date.split(" ")[1]}
                  </p>
                  <p
                    className="text-lg font-black leading-none"
                    style={{ color: NAVY }}
                  >
                    {exam.date.split(" ")[0]}
                  </p>
                </div>
                <div
                  className="w-px h-10 flex-shrink-0"
                  style={{ backgroundColor: TEAL + "40" }}
                  aria-hidden="true"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: NAVY }}>
                    {exam.subject}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={13} aria-hidden="true" />
                      {exam.time}
                    </span>
                    <span className="text-xs text-gray-400">{exam.room}</span>
                    <span className="text-xs text-gray-400">{exam.day}</span>
                  </div>
                </div>
                <span
                  className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: TEAL + "20", color: TEAL }}
                >
                  {t("exam.upcoming")}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </MainCard>
  );
}



function InstructionsSection({ instructions }) {
  const { t } = useLanguage();

  const parsedInstructions = (Array.isArray(instructions) ? instructions : typeof instructions === "string" ? instructions.split("\n") : [])
    .filter((inst) => typeof inst === "string" && inst.trim() !== "");

  return (
    <MainCard variants={cardVariants} className="h-full">
      <div className="p-5 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl" style={{ backgroundColor: LIME }}>
            <ClipboardList size={26} style={{ color: NAVY }} aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-extrabold" style={{ color: NAVY }}>
              {t("exam.instructions")}
            </h3>
            <p className="text-xs text-gray-400">{t("exam.instructionDesc")}</p>
          </div>
        </div>

        {parsedInstructions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <div className="w-10 h-10 rounded-full mb-3 flex items-center justify-center bg-white border border-gray-100 shadow-sm">
              <Info size={20} className="text-gray-400" />
            </div>
            <p className="text-sm font-bold text-gray-700 mb-1">No Special Instructions</p>
            <p className="text-xs text-gray-500 max-w-[220px] mx-auto leading-relaxed">
              No additional examination instructions have been provided for this examination. Please follow your school's standard examination guidelines.
            </p>
          </div>
        ) : (
          <ol className="flex flex-col gap-2.5">
            {parsedInstructions.map((inst, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold mt-0.5"
                  style={{ backgroundColor: NAVY, color: LIME }}
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <p className="text-sm text-gray-600 leading-snug">{inst}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </MainCard>
  );
}

function ExaminationPage() {
  const { t } = useLanguage();
  const { activeStudentId } = useStudent();
  const [showHelper, setShowHelper] = useState(false);
  const [manualCycleId, setManualCycleId] = useState(null);
  
  const { data: examination, loading: examLoading, error: examError } = useService(getExamData, [activeStudentId], [activeStudentId]);

  if (examError) {
    throw examError;
  }

  if (examLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeCycleId = manualCycleId || examination?.defaultCycleId;
  const activeCycle = examination?.cycles?.find(c => c.id === activeCycleId);

  if (!examination || !examination.cycles || examination.cycles.length === 0) {
    return (
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: NAVY }}>
                <FileText size={26} className="text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-black truncate" style={{ color: NAVY }}>
                  {t("exam.title")}
                </h1>
                <p className="text-sm text-gray-500 truncate">{t("exam.subtitle")}</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <HelperButton onClick={() => setShowHelper(true)} className="relative" />
            </div>
          </div>
          <ChildScopeSwitcher />
        </div>
        
        <MainCard className="h-[400px] flex items-center justify-center bg-white border border-dashed border-gray-300">
          <EmptyState 
            icon={FileText}
            title="No Upcoming Examinations"
            description="No examinations are currently available."
          />
        </MainCard>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: NAVY }}>
                <FileText size={26} className="text-white" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-black truncate" style={{ color: NAVY }}>
                  {t("exam.title")}
                </h1>
                <p className="text-sm text-gray-500 truncate">{t("exam.subtitle")}</p>
              </div>
            </div>

            <div className="flex-shrink-0">
              <HelperButton
                onClick={() => setShowHelper(true)}
                className="relative"
              />
            </div>
          </div>
          <ChildScopeSwitcher />
        </div>

        <CycleSelector
          cycles={examination.cycles}
          selectedCycleId={activeCycleId}
          onSelectCycle={setManualCycleId}
        />

        {activeCycle && (
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex flex-col gap-6">
              <ScheduleSection 
                schedule={activeCycle.dateSheet} 
                examName={activeCycle.name} 
              />
            </div>

            <div className="flex flex-col gap-6 h-full">
              <InstructionsSection instructions={activeCycle.generalInstructions} />
            </div>
          </motion.div>
        )}
      </div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="exam.title"
        contentEn="The Examinations section shows your admit card, upcoming exam schedule, past results, and important exam instructions. Download your admit card before the exam date."
        contentHi="परीक्षा अनुभाग आपका प्रवेश पत्र, आगामी परीक्षा कार्यक्रम, पिछले परिणाम और महत्वपूर्ण परीक्षा निर्देश दिखाता है। परीक्षा तिथि से पहले अपना प्रवेश पत्र डाउनलोड करें।"
      />
    </>
  );
}

export default ExaminationPage;

