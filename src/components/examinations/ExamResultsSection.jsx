import React from "react";
import { BookOpen } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import MainCard from "../../components/MainCard";

function ExamResultsSection({ results, variants }) {
  const { t } = useLanguage();
  return (
    <MainCard variants={variants} className="bg-white border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
          <BookOpen size={18} />
        </div>
        <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">{t("academicResults.subjectResults", { fallback: "Subject Results" })}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-wider border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">{t("academicResults.subjectCol", { fallback: "Subject" })}</th>
              <th className="px-6 py-4 text-center">{t("academicResults.marksCol", { fallback: "Marks" })}</th>
              <th className="px-6 py-4 text-center">{t("academicResults.gradeCol", { fallback: "Grade" })}</th>
              <th className="px-6 py-4 text-right">{t("academicResults.resultCol", { fallback: "Result" })}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {results.map(r => {
              const isPass = r.grade && !r.grade.includes('F') && !r.grade.includes('E');
              return (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#03045e]">{t(`subjects.${(r.subjectName || "").toLowerCase().replace(/\s+/g, "")}`, { fallback: t(r.subjectName, { fallback: r.subjectName }) })}</div>
                    {r.remarks && <div className="text-[10px] text-gray-400 italic mt-0.5">{r.remarks}</div>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-black text-[#0077b6]">{r.marksObtained}</span>
                    <span className="text-[10px] text-gray-400 font-bold ml-1">/ {r.maxMarks}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 font-black text-[11px] rounded-lg">{r.grade}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${
                      isPass ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {isPass ? t("academicResults.pass", { fallback: "Pass" }) : t("academicResults.fail", { fallback: "Fail" })}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </MainCard>
  );
}

export default ExamResultsSection;
