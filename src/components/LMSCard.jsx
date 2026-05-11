import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ClipboardList, ExternalLink, Zap } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useViewMode } from "../context/ViewModeContext";
import HelperPopup from "./HelperPopup";
import HelperButton from "./HelperButton";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

const HELPER_CONTENT_EN =
  "The LMS (Learning Management System) is an online platform where study materials, assignments, and course progress are tracked. Completing assignments on time helps maintain a good learning streak.";
const HELPER_CONTENT_HI =
  "LMS (लर्निंग मैनेजमेंट सिस्टम) एक ऑनलाइन प्लेटफॉर्म है जहां अध्ययन सामग्री, असाइनमेंट और पाठ्यक्रम प्रगति को ट्रैक किया जाता है। समय पर असाइनमेंट पूरा करने से अच्छी लर्निंग स्ट्रीक बनाए रखने में मदद मिलती है।";

function LMSCard({
  courseCompletion,
  pendingAssignments,
  learningStreak,
  lmsUrl = "#",
  index = 0,
}) {
  const { t, lang } = useLanguage();
  const { isParentMode } = useViewMode();
  const [showHelper, setShowHelper] = useState(false);

  const completion = Math.min(100, Math.max(0, courseCompletion));
  const barColor =
    completion >= 70 ? "#00b4d8" : completion >= 40 ? "#0077b6" : "#EF4444";

  const parentSummary = t("lms.parentSummary", {
    pct: completion,
    pending: pendingAssignments,
  });

  return (
    <>
      <motion.div
        custom={index}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-5 relative overflow-hidden cursor-default select-none"
        style={{ outline: "1px solid #caf0f8" }}
        role="region"
        aria-label={`LMS overview: ${completion}% course completion`}
      >
        {/* Helper button */}
        <HelperButton onClick={() => setShowHelper(true)} />

        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="p-2.5 rounded-2xl"
            style={{ backgroundColor: "#00b4d820" }}
          >
            <BookOpen
              size={29}
              style={{ color: "#00b4d8" }}
              aria-hidden="true"
            />
          </div>
          <div>
            <h2
              className="text-lg font-extrabold leading-tight"
              style={{ color: "#03045e" }}
            >
              {t("lms.title")}
            </h2>
            <span className="text-xs font-semibold text-gray-400">
              {t("lms.subtitle")}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-600">
              {t("lms.completion")}
            </span>
            <motion.span
              className="text-2xl font-black"
              style={{ color: "#00b4d8" }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
              aria-label={`${completion}% complete`}
            >
              {completion}%
            </motion.span>
          </div>
          <div
            className="w-full h-4 rounded-full overflow-hidden"
            style={{ backgroundColor: "#caf0f8" }}
            role="progressbar"
            aria-valuenow={completion}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Course completion: ${completion}%`}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: barColor }}
              initial={{ width: "0%" }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            />
          </div>
        </div>

        {/* Parent summary */}
        {isParentMode && (
          <motion.p
            className="text-sm font-semibold leading-snug rounded-2xl px-4 py-2"
            style={{ backgroundColor: "#caf0f8", color: "#03045e" }}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.5 }}
          >
            {parentSummary}
          </motion.p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="flex items-center gap-2.5 rounded-2xl px-4 py-3"
            style={{ backgroundColor: "#0077b615" }}
          >
            <div
              className="p-1.5 rounded-xl"
              style={{ backgroundColor: "#0077b625" }}
            >
              <ClipboardList
                size={21}
                style={{ color: "#0077b6" }}
                aria-hidden="true"
              />
            </div>
            <div>
              <p
                className="text-xs font-semibold leading-none"
                style={{ color: "#0077b6" }}
              >
                {t("lms.pending")}
              </p>
              <p
                className="text-sm font-extrabold leading-tight"
                style={{ color: "#03045e" }}
              >
                {pendingAssignments}{" "}
                {pendingAssignments === 1
                  ? t("lms.assignment")
                  : t("lms.assignments")}
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-2.5 rounded-2xl px-4 py-3"
            style={{ backgroundColor: "#00b4d815" }}
          >
            <div
              className="p-1.5 rounded-xl"
              style={{ backgroundColor: "#00b4d825" }}
            >
              <Zap size={21} style={{ color: "#00b4d8" }} aria-hidden="true" />
            </div>
            <div>
              <p
                className="text-xs font-semibold leading-none"
                style={{ color: "#00b4d8" }}
              >
                {t("lms.streak")}
              </p>
              <p
                className="text-sm font-extrabold leading-tight"
                style={{ color: "#03045e" }}
              >
                {learningStreak}-{t("lms.streakDays")}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.a
          href={lmsUrl}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="flex items-center justify-center gap-2 text-white font-bold rounded-xl px-6 py-3 shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ backgroundColor: "#03045e" }}
          aria-label="Go to Learning Management System"
        >
          <span>{t("lms.goToLms")}</span>
          <ExternalLink size={21} aria-hidden="true" />
        </motion.a>
      </motion.div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="lms.title"
        contentEn={HELPER_CONTENT_EN}
        contentHi={HELPER_CONTENT_HI}
      />
    </>
  );
}

export default LMSCard;
