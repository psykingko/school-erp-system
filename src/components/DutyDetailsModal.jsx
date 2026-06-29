import React from "react";
import MainCard from "./MainCard";
import { X, Calendar, Clock, MapPin } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function DutyDetailsModal({ request, onClose }) {
  const { t } = useLanguage();
  if (!request) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Completed": return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <MainCard className="w-full w-[95vw] md:w-[90vw] lg:max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-3xl">
          <h2 className="text-xl font-bold text-[#03045e]">{t("duty.detailsTitle")}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-black text-gray-800">{request.title}</h3>
              <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-2">
                <span className="bg-gray-200 px-2 py-0.5 rounded text-gray-700">{request.category}</span>
                • {t("duty.requestedBy", { name: request.requestedByTeacherName })}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">{t("label.date")}</p>
              <p className="font-medium text-gray-800 flex items-center gap-1 mt-1">
                <Calendar size={16} className="text-[#00b4d8]" /> {request.dutyDate}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">{t("label.time")}</p>
              <p className="font-medium text-gray-800 flex items-center gap-1 mt-1">
                <Clock size={16} className="text-[#00b4d8]" /> {request.startTime} - {request.endTime}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-bold text-gray-400 uppercase">{t("label.location")}</p>
              <p className="font-medium text-gray-800 flex items-center gap-1 mt-1">
                <MapPin size={16} className="text-[#00b4d8]" /> {request.location || "N/A"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-bold text-gray-400 uppercase">{t("label.reason")}</p>
              <p className="font-medium text-gray-800 mt-1 bg-white p-2 border border-gray-200 rounded-md">
                {request.reason || t("duty.noReason")}
              </p>
            </div>
          </div>

          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">{t("duty.assignedStudents", { count: request.targetStudents?.length || 0 })}</h4>
          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto w-full">
            <table className="w-full text-left text-sm w-full md:min-w-[500px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="p-3 font-bold text-gray-600">{t("duty.studentName")}</th>
                  <th className="p-3 font-bold text-gray-600">{t("duty.classSection")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {request.targetStudents?.map(student => (
                  <tr key={student.studentId} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-800">{student.studentName}</td>
                    <td className="p-3 text-gray-600">{student.className}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50/50 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-white bg-gray-800 hover:bg-gray-900 rounded-xl transition-colors"
          >
            {t("btn.close")}
          </button>
        </div>
      </MainCard>
    </div>
  );
}
