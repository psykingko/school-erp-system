import React from "react";
import "./QuestionPaperPrintStyles.css";

const QuestionPaperA4Shell = ({ children, isPrintLayoutMode }) => {
  const paperContent = (
    <div className="qp-a4-shell">
      {children}
    </div>
  );

  if (isPrintLayoutMode) {
    return (
      <div className="qp-print-layout-mode">
        {paperContent}
      </div>
    );
  }

  return paperContent;
};

export default QuestionPaperA4Shell;
