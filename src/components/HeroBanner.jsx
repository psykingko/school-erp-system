import React from "react";
import { motion } from "framer-motion";

// FIX: variants defined outside component — stable references, never recreated
const heroVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const titleVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.08, duration: 0.4, ease: "easeOut" },
  },
};

function HeroBanner({ student }) {
  return (
    <motion.div
      variants={heroVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full rounded-3xl overflow-hidden shadow-xl mb-6"
      style={{ minHeight: "90px" }}
    >
      {/* FIX: removed animate-gradient-x — that class doesn't exist in default
          Tailwind and caused the browser to repeatedly recalculate styles.
          Using a static gradient is visually equivalent and has zero CPU cost. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #03045e 0%, #0077b6 50%, #00b4d8 100%)",
        }}
        aria-hidden="true"
      />

      {/* Radial glow overlay — static, no animation */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(202,240,248,0.5) 0%, transparent 60%)",
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 px-6 md:px-10 py-7">
        <div
          className="inline-block rounded-2xl px-5 py-4"
          style={{
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.22)",
          }}
        >
          <motion.h1
            variants={titleVariants}
            initial="hidden"
            animate="visible"
            className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight"
          >
            Welcome back, {student?.name || "Student"}
          </motion.h1>
        </div>
      </div>
    </motion.div>
  );
}

export default HeroBanner;
