import React from "react";
import { motion } from "framer-motion";

/**
 * HelperButton
 *
 * A friendly animated info button used on every dashboard card.
 * Renders as a small rounded pill with a "?" label and a subtle pulse.
 *
 * Props:
 *   onClick  — () => void
 *   className — optional extra classes for positioning (e.g. "absolute top-4 right-4")
 */
function HelperButton({ onClick, className = "absolute top-4 right-4" }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={`${className} z-10 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1`}
      style={{
        width: "26px",
        height: "26px",
        borderRadius: "50%",
        backgroundColor: "#03045e",
        color: "#caf0f8",
        boxShadow: "0 0 0 3px rgba(0,119,182,0.25)",
        fontSize: "13px",
        fontWeight: 900,
        lineHeight: 1,
        border: "none",
        cursor: "pointer",
      }}
      aria-label="Help — what is this section?"
    >
      ?
    </motion.button>
  );
}

export default HelperButton;
