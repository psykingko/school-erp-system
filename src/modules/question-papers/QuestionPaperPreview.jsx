import React, { useState, useMemo } from "react";
import QuestionPaperA4Shell from "./QuestionPaperA4Shell";
import QuestionPaperMetadataHeader from "./QuestionPaperMetadataHeader";
import QuestionPaperContentRenderer from "./QuestionPaperContentRenderer";
import QuestionPaperPrintToolbar from "../../components/questionPapers/QuestionPaperPrintToolbar";
import QuestionPaperFooter from "./QuestionPaperFooter";
import { questionPaperPaginationService } from "../../services/questionPaperPaginationService";

const QuestionPaperPreview = ({ paper, isTeacherView = false }) => {
  const [isPrintLayoutMode, setIsPrintLayoutMode] = useState(false);

  if (!paper) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Rejected": return "bg-rose-100 text-rose-800 border-rose-200";
      case "Submitted": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200"; // Draft
    }
  };

  const { warnings } = useMemo(() => {
    if (!paper?.paperContent) return { warnings: [] };
    return questionPaperPaginationService.estimatePagination(paper.paperContent);
  }, [paper?.paperContent]);

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Top Banner (Status) - Hidden in print */}
      <div className="mb-4 qp-no-print">
        {isTeacherView && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusColor(paper.status || "Draft")}`}>
                {paper.status || "Draft"}
              </span>
            </div>
          )}
      </div>
      
      {/* Universal Print Toolbar */}
      <QuestionPaperPrintToolbar 
        isPrintLayoutMode={isPrintLayoutMode} 
        setIsPrintLayoutMode={setIsPrintLayoutMode}
        warnings={warnings}
      />

      <div className="flex-1 overflow-y-auto">
        <QuestionPaperA4Shell isPrintLayoutMode={isPrintLayoutMode}>
          <QuestionPaperMetadataHeader paper={paper} />
          <QuestionPaperContentRenderer paperContent={paper.paperContent} content={paper.content} />
          <QuestionPaperFooter paper={paper} isPrintLayoutMode={isPrintLayoutMode} />
        </QuestionPaperA4Shell>
      </div>
    </div>
  );
};

export default QuestionPaperPreview;
