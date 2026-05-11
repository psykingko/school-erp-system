import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

// ── Inline language toggle ────────────────────────────────────────────────────

function PopupLangToggle({ popupLang, setPopupLang }) {
  return (
    <div
      className="flex items-center rounded-full p-0.5 border gap-0.5"
      style={{ backgroundColor: "#caf0f8", borderColor: "#00b4d8" }}
      role="group"
      aria-label="Popup language selector"
    >
      {["en", "hi"].map((opt) => {
        const isActive = popupLang === opt;
        return (
          <div key={opt} className="relative">
            {isActive && (
              <motion.div
                layoutId="popup-lang-pill"
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: "#03045e" }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
              />
            )}
            <button
              onClick={() => setPopupLang(opt)}
              className="relative z-10 px-2.5 py-1 rounded-full text-[11px] font-extrabold transition-colors focus:outline-none"
              style={{ color: isActive ? "#caf0f8" : "#03045e" }}
              aria-pressed={isActive}
              aria-label={opt === "en" ? "English" : "हिन्दी"}
            >
              {opt === "en" ? "EN" : "हि"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ── Mascot SVG ────────────────────────────────────────────────────────────────

function HelperMascot() {
  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"
      style={{ backgroundColor: "#03045e" }}
      aria-hidden="true"
    >
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        {/* Face */}
        <circle cx="14" cy="14" r="12" fill="#caf0f8" />
        {/* Eyes */}
        <circle cx="10" cy="12" r="2" fill="#03045e" />
        <circle cx="18" cy="12" r="2" fill="#03045e" />
        {/* Eye shine */}
        <circle cx="11" cy="11" r="0.8" fill="white" />
        <circle cx="19" cy="11" r="0.8" fill="white" />
        {/* Smile */}
        <path
          d="M9.5 17 Q14 21 18.5 17"
          stroke="#03045e"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
        {/* Graduation cap */}
        <rect x="8" y="5" width="12" height="3" rx="1" fill="#0077b6" />
        <polygon points="14,3 8,5 20,5" fill="#0077b6" />
        <line
          x1="20"
          y1="5"
          x2="22"
          y2="8"
          stroke="#00b4d8"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="22" cy="8.5" r="1" fill="#00b4d8" />
      </svg>
    </div>
  );
}

// ── Color legend row ──────────────────────────────────────────────────────────

function ColorLegend({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 mt-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2.5">
          <div
            className="w-3.5 h-3.5 rounded-full flex-shrink-0 mt-0.5"
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <p
            className="text-sm leading-snug font-medium"
            style={{ color: "#374151" }}
          >
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Main HelperPopup ──────────────────────────────────────────────────────────

function HelperPopup({
  isOpen,
  onClose,
  titleKey,
  contentEn,
  contentHi,
  colorLegend,
}) {
  const { lang: globalLang, t } = useLanguage();
  const [popupLang, setPopupLang] = useState(globalLang);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) setPopupLang(globalLang);
  }, [isOpen, globalLang]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && closeButtonRef.current) closeButtonRef.current.focus();
  }, [isOpen]);

  const title = t(titleKey);
  const content = popupLang === "hi" ? contentHi || contentEn : contentEn;
  const legend = colorLegend?.map((item) => ({
    color: item.color,
    label: popupLang === "hi" ? item.labelHi || item.labelEn : item.labelEn,
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
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

          {/* Modal card */}
          <motion.div
            className="relative bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl shadow-2xl z-10 overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {/* Top accent bar */}
            <div
              className="h-1 w-full"
              style={{
                background: "linear-gradient(90deg, #03045e, #0077b6, #00b4d8)",
              }}
              aria-hidden="true"
            />

            {/* Drag handle (mobile) */}
            <div
              className="flex justify-center pt-3 sm:hidden"
              aria-hidden="true"
            >
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="p-5 sm:p-6">
              {/* Header row */}
              <div className="flex items-start gap-3 mb-4">
                <HelperMascot />

                <div className="flex-1 min-w-0">
                  <p
                    className="text-[11px] font-bold uppercase tracking-widest mb-0.5"
                    style={{ color: "#0077b6" }}
                  >
                    {popupLang === "hi" ? "जानकारी" : "About this section"}
                  </p>
                  <h2
                    className="text-base font-extrabold leading-snug"
                    style={{ color: "#03045e" }}
                  >
                    {title}
                  </h2>
                </div>

                {/* Language toggle */}
                <PopupLangToggle
                  popupLang={popupLang}
                  setPopupLang={setPopupLang}
                />

                {/* Close button */}
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                  style={{ backgroundColor: "#caf0f8", color: "#03045e" }}
                  aria-label={t("helper.close")}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Divider */}
              <div
                className="h-px mb-4"
                style={{ backgroundColor: "#caf0f8" }}
                aria-hidden="true"
              />

              {/* Explanation text */}
              <p
                className="text-sm leading-relaxed font-medium mb-4"
                style={{ color: "#374151" }}
              >
                {content}
              </p>

              {/* Color legend */}
              {legend && legend.length > 0 && (
                <div
                  className="rounded-2xl p-4 mb-4"
                  style={{ backgroundColor: "#caf0f8" }}
                >
                  <p
                    className="text-[11px] font-extrabold uppercase tracking-wide mb-2.5"
                    style={{ color: "#03045e" }}
                  >
                    {popupLang === "hi" ? "रंग का अर्थ" : "Color meaning"}
                  </p>
                  <ColorLegend items={legend} />
                </div>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl text-sm font-extrabold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{ backgroundColor: "#03045e", color: "#caf0f8" }}
              >
                {t("helper.close")}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default HelperPopup;
