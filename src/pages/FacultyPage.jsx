import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  MessageSquare,
  X,
  Send,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import HelperButton from "../components/HelperButton";
import HelperPopup from "../components/HelperPopup";

const NAVY = "#03045e";
const TEAL = "#0077b6";
const SAGE = "#00b4d8";
const LIME = "#caf0f8";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ── Feedback Modal ────────────────────────────────────────────────────────────
function FeedbackModal({ faculty, onClose }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(onClose, 1800);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={`Feedback for ${faculty.name}`}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-hidden="true"
      />

      <motion.div
        className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl z-10 overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        {/* Accent bar */}
        <div
          className="h-1 w-full"
          style={{
            background: `linear-gradient(90deg, ${NAVY}, ${TEAL}, ${SAGE})`,
          }}
          aria-hidden="true"
        />

        {/* Drag handle */}
        <div className="flex justify-center pt-3 sm:hidden" aria-hidden="true">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        <div className="p-6">
          {submitted ? (
            <motion.div
              className="flex flex-col items-center gap-4 py-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: SAGE + "33" }}
              >
                <CheckCircle size={42} style={{ color: SAGE }} />
              </div>
              <p className="text-lg font-extrabold" style={{ color: NAVY }}>
                Feedback Submitted!
              </p>
              <p className="text-sm text-gray-500 text-center">
                Thank you for your feedback on {faculty.name}.
              </p>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-base shadow-md"
                    style={{ backgroundColor: faculty.avatarColor }}
                    aria-hidden="true"
                  >
                    {faculty.avatarInitials}
                  </div>
                  <div>
                    <p
                      className="text-base font-extrabold"
                      style={{ color: NAVY }}
                    >
                      {faculty.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {faculty.subjects.join(", ")}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: LIME, color: NAVY }}
                  aria-label="Close feedback"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Star rating */}
                <div>
                  <p
                    className="text-xs font-extrabold uppercase tracking-wide mb-2"
                    style={{ color: TEAL }}
                  >
                    Rating
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="w-10 h-10 rounded-xl font-black text-lg transition-all"
                        style={{
                          backgroundColor: star <= rating ? NAVY : LIME,
                          color: star <= rating ? LIME : NAVY,
                        }}
                        aria-label={`${star} star`}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <p
                    className="text-xs font-extrabold uppercase tracking-wide mb-2"
                    style={{ color: TEAL }}
                  >
                    Comments (optional)
                  </p>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Share your experience..."
                    className="w-full px-4 py-3 rounded-2xl text-sm resize-none outline-none border"
                    style={{
                      backgroundColor: LIME,
                      borderColor: SAGE + "60",
                      color: NAVY,
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={rating === 0}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-extrabold transition-all disabled:opacity-40"
                  style={{ backgroundColor: NAVY, color: LIME }}
                >
                  <Send size={20} aria-hidden="true" />
                  Submit Feedback
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Faculty card ──────────────────────────────────────────────────────────────
function FacultyCard({ faculty }) {
  const [showFeedback, setShowFeedback] = useState(false);

  return (
    <>
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col"
        style={{ outline: `1px solid ${LIME}` }}
        role="article"
        aria-label={`Faculty: ${faculty.name}`}
      >
        {/* Accent top bar */}
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${faculty.avatarColor}, ${TEAL})`,
          }}
          aria-hidden="true"
        />

        <div className="p-5 flex flex-col gap-4 flex-1">
          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-lg shadow-md flex-shrink-0"
              style={{ backgroundColor: faculty.avatarColor }}
              aria-hidden="true"
            >
              {faculty.avatarInitials}
            </div>
            <div>
              <h3
                className="text-base font-extrabold leading-tight"
                style={{ color: NAVY }}
              >
                {faculty.name}
              </h3>
              <p className="text-xs font-semibold text-gray-400 mt-0.5">
                {faculty.designation}
              </p>
              <p className="text-xs text-gray-400">{faculty.department}</p>
            </div>
          </div>

          {/* Subject tags */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <BookOpen size={16} style={{ color: TEAL }} aria-hidden="true" />
              <span
                className="text-[10px] font-extrabold uppercase tracking-wide"
                style={{ color: TEAL }}
              >
                Subjects
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {faculty.subjects.map((s, i) => (
                <span
                  key={i}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: NAVY + "12", color: NAVY }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-2">
            <a
              href={`mailto:${faculty.email}`}
              className="flex items-center gap-2 group"
              aria-label={`Email ${faculty.name}`}
            >
              <div
                className="p-1.5 rounded-lg"
                style={{ backgroundColor: LIME }}
              >
                <Mail size={17} style={{ color: TEAL }} aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold text-gray-600 group-hover:underline truncate">
                {faculty.email}
              </span>
            </a>
            <div className="flex items-center gap-2">
              <div
                className="p-1.5 rounded-lg"
                style={{ backgroundColor: LIME }}
              >
                <MapPin size={17} style={{ color: SAGE }} aria-hidden="true" />
              </div>
              <span className="text-xs font-semibold text-gray-600">
                {faculty.cabin}
              </span>
            </div>
          </div>

          {/* Feedback button */}
          <button
            onClick={() => setShowFeedback(true)}
            className="mt-auto flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-extrabold transition-all hover:opacity-90"
            style={{ backgroundColor: NAVY, color: LIME }}
            aria-label={`Give feedback for ${faculty.name}`}
          >
            <MessageSquare size={20} aria-hidden="true" />
            Give Feedback
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showFeedback && (
          <FeedbackModal
            faculty={faculty}
            onClose={() => setShowFeedback(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function FacultyPage({ faculty = [] }) {
  const { t } = useLanguage();
  const [showHelper, setShowHelper] = useState(false);

  return (
    <>
      <div className="relative">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl" style={{ backgroundColor: NAVY }}>
            <Users size={31} className="text-white" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: NAVY }}>
              My Teachers
            </h1>
            <p className="text-sm text-gray-500">
              All assigned teachers for this academic year
            </p>
          </div>
          <div className="ml-auto">
            <HelperButton
              onClick={() => setShowHelper(true)}
              className="relative"
            />
          </div>
        </div>

        {/* Summary */}
        {/* Teachers grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {faculty.map((f) => (
            <FacultyCard key={f.id} faculty={f} />
          ))}
        </motion.div>
      </div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="faculty.title"
        contentEn="My Teachers shows all teachers assigned for this academic year. Each card shows the teacher's name, subject, school email, and staff room location. Use the Feedback button to share your experience."
        contentHi="मेरे शिक्षक इस शैक्षणिक वर्ष के लिए नियुक्त सभी शिक्षकों को दिखाते हैं। प्रत्येक कार्ड में शिक्षक का नाम, विषय, स्कूल ईमेल और स्टाफ रूम स्थान दिखाया जाता है। अपना अनुभव साझा करने के लिए फीडबैक बटन का उपयोग करें।"
      />
    </>
  );
}

export default FacultyPage;
