import React from "react";
import { motion } from "framer-motion";

/**
 * MainCard Design System Component
 * Standardized shell for primary section cards across the ERP dashboard.
 * 
 * Features:
 * - Slightly thicker top border with soft accent color
 * - Large rounded radius (rounded-3xl or rounded-[2rem])
 * - Soft premium shadow
 * - Standardized hover elevation
 */
const MainCard = React.memo(({
  children,
  className = "",
  borderColor = "#00b4d8", // Standardized ERP Card Border Color (Cyan/Teal-Blue)
  variants,
  custom,
  initial = "hidden",
  animate = "visible",
  whileHover = { y: -4, transition: { duration: 0.2 } },
  as = "div",
  ...props
}) => {
  const Component = motion[as] || motion.div;

  // Default animation variants if none provided
  const defaultVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  return (
    <Component
      variants={variants || defaultVariants}
      custom={custom}
      initial={initial}
      animate={animate}
      // whileHover={whileHover}
      className={`bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col relative transition-shadow duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] ${className}`}
      style={{
        borderTop: `6px solid ${borderColor}`,
        ...props.style
      }}
      role="region"
      {...props}
    >
      {children}
    </Component>
  );
});

export default MainCard;
