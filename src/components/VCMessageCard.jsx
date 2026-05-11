import React from "react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

function getInitials(name) {
  const cleaned = name.replace(/\b(Dr|Prof|Mr|Ms|Mrs)\.?\s*/gi, "").trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "VC";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function VCMessageCard({ vcName, vcTitle, message, avatarColor, index = 0 }) {
  const initials = getInitials(vcName);

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="relative rounded-3xl shadow-md overflow-hidden cursor-default select-none"
      role="region"
      aria-label={`Message from ${vcName}, ${vcTitle}`}
    >
      {/* Background gradient using palette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(135deg, #03045e08, #0077b612, #00b4d810)",
        }}
      />
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, #03045e, #0077b6, #00b4d8)",
        }}
      />

      <div className="relative p-6 flex flex-col gap-5">
        {/* Header — avatar + name/title only, no right-side icon */}
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 18,
              delay: 0.2,
            }}
            className="relative flex-shrink-0"
            aria-hidden="true"
          >
            <div
              className="absolute inset-0 rounded-full opacity-25 blur-sm scale-110"
              style={{ backgroundColor: "#03045e" }}
            />
            <div
              className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-white"
              style={{ backgroundColor: "#03045e" }}
            >
              <span className="text-white font-black text-xl tracking-wide">
                {initials}
              </span>
            </div>
          </motion.div>
          <div>
            <p
              className="text-base font-extrabold leading-tight"
              style={{ color: "#03045e" }}
            >
              {vcName}
            </p>
            <p
              className="text-xs font-semibold mt-0.5"
              style={{ color: "#0077b6" }}
            >
              {vcTitle}
            </p>
          </div>
        </div>

        {/* Message — opening quote top-left, closing quote bottom-right (mirrored correctly) */}
        <div className="relative">
          <Quote
            size={42}
            className="absolute -top-2 -left-1 opacity-30"
            style={{ color: "#0077b6" }}
            aria-hidden="true"
          />
          <blockquote
            className="pl-8 pr-2 text-sm font-semibold leading-relaxed italic text-gray-700"
            aria-label={`Quote: ${message}`}
          >
            {message}
          </blockquote>
          <div className="flex justify-end mt-1 pr-2">
            {/* Closing quote: rotate 180° to get proper closing quotation mark */}
            <Quote
              size={26}
              className="opacity-30"
              style={{ color: "#0077b6", transform: "rotate(180deg)" }}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-0.5 rounded-full"
            style={{ backgroundColor: "#0077b6" }}
          />
          <span className="text-xs font-bold" style={{ color: "#0077b6" }}>
            — {vcName}, {vcTitle}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default VCMessageCard;
