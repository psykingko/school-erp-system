import React, { useState } from "react";
import { motion } from "framer-motion";
import HelperButton from "../HelperButton";
import HelperPopup from "../HelperPopup";
import { useLanguage } from "../../context/LanguageContext";

/**
 * TeacherModuleHeader
 * 
 * Standard header for teacher portal modules.
 * Includes title, description, and integrated helperPopup support.
 */
const TeacherModuleHeader = ({ 
  titleKey, 
  title, // Optional: if provided, skips translation
  descriptionKey, 
  description, // Optional: if provided, skips translation
  helperContentEn, 
  helperContentHi,
  colorLegend = []
}) => {
  const { t } = useLanguage();
  const [showHelper, setShowHelper] = useState(false);

  return (
    <header className="mb-8 relative">
      <div className="flex flex-col gap-1 pr-12">
        <motion.h1 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-black text-[#03045e] tracking-tight"
        >
          {title || t(titleKey)}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-500 font-medium max-w-2xl"
        >
          {description || (descriptionKey ? t(descriptionKey) : t("common.moduleFallbackDesc"))}
        </motion.p>
      </div>

      <HelperButton 
        onClick={() => setShowHelper(true)} 
        className="absolute top-1 right-0 shadow-lg hover:shadow-xl transition-all" 
      />

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey={titleKey}
        contentEn={helperContentEn}
        contentHi={helperContentHi}
        colorLegend={colorLegend}
      />
    </header>
  );
};

export default React.memo(TeacherModuleHeader);
