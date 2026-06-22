import React from "react";
import "./QuestionPaperPrintStyles.css";

const QuestionPaperMetadataHeader = ({ paper }) => {
  if (!paper) return null;

  // Enforce strict N/A fallbacks per user feedback
  const schoolName = paper.schoolName || "EduDash High School"; // Placeholder for now
  const examType = paper.examType || "N/A";
  const subjectName = paper.subjectName || "N/A";
  const className = paper.className || "N/A";
  const section = paper.section || "N/A";
  const duration = paper.duration || "N/A";
  const maxMarks = paper.maxMarks || "N/A";

  return (
    <div className="qp-header">
      <div className="qp-school-name">{schoolName}</div>
      <div className="qp-exam-type">{examType}</div>
      <div className="qp-meta-grid">
        <div className="qp-meta-left">
          <span>Subject: {subjectName}</span>
          <span>Class: {className} (Section {section})</span>
        </div>
        <div className="qp-meta-right">
          <span>Duration: {duration}</span>
          <span>Maximum Marks: {maxMarks}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionPaperMetadataHeader;
