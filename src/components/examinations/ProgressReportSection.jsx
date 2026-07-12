import React from "react";
import { Award, Printer } from "lucide-react";
import PrintableReportCard from "../../pages/admin/examinations/academic-report-cards/components/PrintableReportCard";
import MainCard from "../../components/MainCard";

function ProgressReportSection({ reportCards, variants }) {
  if (!reportCards || reportCards.length === 0) {
    return null;
  }

  return (
    <MainCard variants={variants} className="bg-transparent border-none shadow-none mt-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-2xl bg-[#caf0f8]">
          <Award size={26} className="text-[#03045e]" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-[#03045e]">
            Progress Report
          </h3>
          <p className="text-xs text-gray-400">Institutional academic evaluation</p>
        </div>
      </div>

      <div className="space-y-8">
        {reportCards.map((card) => (
          <div key={card.id} className="relative">
            <div className="absolute top-4 right-8 z-10 print:hidden flex gap-2">
              <button
                onClick={() => window.print()}
                className="bg-white/80 backdrop-blur text-[#03045e] border border-gray-200 shadow-sm hover:bg-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <Printer size={16} /> Print Report
              </button>
            </div>
            <PrintableReportCard card={card} />
          </div>
        ))}
      </div>
    </MainCard>
  );
}

export default ProgressReportSection;
