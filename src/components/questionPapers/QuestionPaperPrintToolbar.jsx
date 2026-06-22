import React, { useState } from "react";
import { Printer, FileDown, AlertTriangle, LayoutTemplate, XCircle } from "lucide-react";

const QuestionPaperPrintToolbar = ({ isPrintLayoutMode, setIsPrintLayoutMode, warnings = [] }) => {
  const [showPDFHint, setShowPDFHint] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    setShowPDFHint(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setShowPDFHint(false), 3000);
    }, 500);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100 qp-no-print">
      
      {/* Left side: Warnings (only if in print layout) */}
      <div className="flex-1 w-full">
        {isPrintLayoutMode && warnings.length > 0 && (
          <div className="flex flex-col gap-2">
            {warnings.map((warn, i) => (
              <div key={i} className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-200">
                <AlertTriangle size={14} />
                {warn}
              </div>
            ))}
          </div>
        )}
        {showPDFHint && (
          <div className="flex items-center gap-2 bg-[#03045e] text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest mt-2 animate-pulse">
            <FileDown size={14} />
            Please select "Save as PDF" in the print dialog.
          </div>
        )}
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={() => setIsPrintLayoutMode(!isPrintLayoutMode)}
          className={`text-xs font-bold px-4 py-2 rounded-xl transition-colors border flex items-center gap-2 ${
            isPrintLayoutMode 
              ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100" 
              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
          }`}
        >
          {isPrintLayoutMode ? <XCircle size={16} /> : <LayoutTemplate size={16} />}
          {isPrintLayoutMode ? "Exit Print Layout" : "View Print Layout"}
        </button>

        {isPrintLayoutMode && (
          <>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 text-[#03045e] hover:bg-[#03045e] hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
            >
              <Printer size={16} />
              Print Paper
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg transition-colors text-[10px] font-black uppercase tracking-widest"
            >
              <FileDown size={16} />
              Export PDF
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default QuestionPaperPrintToolbar;
