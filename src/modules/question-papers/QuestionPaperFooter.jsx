import React from "react";
import "./QuestionPaperPrintStyles.css";

const QuestionPaperFooter = ({ paper, isPrintLayoutMode }) => {
  if (!isPrintLayoutMode) return null;

  const schoolName = paper?.schoolName || "EduDash High School";
  const generatedDate = new Date().toLocaleDateString();

  return (
    <div className="qp-footer qp-print-only mt-12 pt-4 border-t border-gray-300 text-[10px] font-bold text-gray-500 flex justify-between items-center w-full">
      <span>{schoolName}</span>
      <span>Generated: {generatedDate}</span>
      {/* Explicitly no page numbering yet, per Phase 4 prototype guidelines */}
    </div>
  );
};

export default QuestionPaperFooter;
