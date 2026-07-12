import React, { useState, useEffect, useMemo } from "react";
import { useStudent } from "../../context/StudentContext";
import studentDutyService from "../../services/studentDutyService";
import MainCard from "../../components/MainCard";
import DutyDetailsModal from "../../components/DutyDetailsModal";
import { ClipboardCheck, CheckCircle, XCircle, Eye, Clock, ClipboardList, User } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function ParentDutyRecordsPage() {
  const { t } = useLanguage();
  const { activeStudentId, activeStudent, childrenList, setActiveStudentId, isMultiChild, isLoading: isStudentLoading } = useStudent();
  
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Active & Completed");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (activeStudentId) {
      fetchRecords();
    }
  }, [activeStudentId]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const records = await studentDutyService.getParentDutyRecords([activeStudentId]);
      setRequests(records);
    } catch (error) {
      console.error("Error fetching parent duty records:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    return {
      total: requests.length,
      active: requests.filter(r => r.status === "Active").length,
      completed: requests.filter(r => r.status === "Completed").length,
      cancelled: requests.filter(r => r.status === "Cancelled").length,
    };
  }, [requests]);

  const participationHistory = useMemo(() => {
    const completed = requests.filter(r => r.status === "Completed");
    if (completed.length === 0) return null;

    const categoryCounts = completed.reduce((acc, req) => {
      acc[req.category] = (acc[req.category] || 0) + 1;
      return acc;
    }, {});

    const historyStrings = Object.entries(categoryCounts).map(([cat, count]) => {
      const dutyStr = count === 1 ? t("parentDuty.duty", { fallback: "Duty" }) : t("parentDuty.duties", { fallback: "Duties" });
      return `${count} ${cat} ${dutyStr}`;
    });

    return `${t("parentDuty.participatedIn", { fallback: "Participated in:" })} ${historyStrings.join(" • ")}`;
  }, [requests, t]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      if (statusFilter === "Active & Completed") {
        return req.status === "Active" || req.status === "Completed";
      }
      if (statusFilter === "Cancelled") {
        return req.status === "Cancelled";
      }
      return true; // "All"
    });
  }, [requests, statusFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Completed": return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isStudentLoading) {
    return <div className="p-8 text-center text-gray-500">{t("common.loadingStudentContext", { fallback: "Loading student context..." })}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#03045e] tracking-tight">{t("parentDuty.title", { fallback: "Duty Records" })}</h1>
        <p className="text-gray-500 font-medium mt-1">{t("parentDuty.subtitle", { fallback: "View duty participation records for your child." })}</p>
      </div>

      {/* Child Selector */}
      {isMultiChild && (
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-max">
          {childrenList.map((child) => (
            <button
              key={child.id}
              onClick={() => setActiveStudentId(child.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                activeStudentId === child.id 
                  ? "bg-white text-[#03045e] shadow-sm" 
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
              }`}
            >
              <User size={16} />
              {child.firstName}
            </button>
          ))}
        </div>
      )}

      {/* Participation History (Enhancement) */}
      {participationHistory && (
        <div className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <ClipboardCheck size={18} className="text-blue-600" />
          {participationHistory}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MainCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <ClipboardCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{t("parentDuty.totalDuties", { fallback: "Total Duties" })}</p>
            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          </div>
        </MainCard>
        <MainCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{t("common.active", { fallback: "Active" })}</p>
            <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
          </div>
        </MainCard>
        <MainCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{t("common.completed", { fallback: "Completed" })}</p>
            <p className="text-2xl font-bold text-gray-800">{stats.completed}</p>
          </div>
        </MainCard>
        <MainCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <XCircle size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">{t("common.cancelled", { fallback: "Cancelled" })}</p>
            <p className="text-2xl font-bold text-gray-800">{stats.cancelled}</p>
          </div>
        </MainCard>
      </div>

      {/* Records Table */}
      <MainCard className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-bold text-[#03045e]">{t("parentDuty.title", { fallback: "Duty Records" })}</h2>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#00b4d8] bg-white font-medium text-gray-600"
          >
            <option value="All">{t("parentDuty.allRecords", { fallback: "All Records" })}</option>
            <option value="Active & Completed">{t("parentDuty.activeAndCompleted", { fallback: "Active & Completed" })}</option>
            <option value="Cancelled">{t("parentDuty.cancelledOnly", { fallback: "Cancelled Only" })}</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">{t("common.student", { fallback: "Student" })}</th>
                <th className="p-4 font-bold">{t("parentDuty.dutyName", { fallback: "Duty Name" })}</th>
                <th className="p-4 font-bold">{t("common.category", { fallback: "Category" })}</th>
                <th className="p-4 font-bold">{t("parentDuty.requestedBy", { fallback: "Requested By" })}</th>
                <th className="p-4 font-bold">{t("common.date", { fallback: "Date" })}</th>
                <th className="p-4 font-bold">{t("common.status", { fallback: "Status" })}</th>
                <th className="p-4 font-bold text-right">{t("common.action", { fallback: "Action" })}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">{t("parentDuty.loadingRecords", { fallback: "Loading duty records..." })}</td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <ClipboardList size={40} className="text-gray-300 mb-3" />
                      <h3 className="text-lg font-bold text-gray-700">{t("parentDuty.noRecords", { fallback: "No Duty Records Found" })}</h3>
                      <p className="text-sm text-gray-500 mt-1">{t("parentDuty.noRecordsMsg", { fallback: "No duty participation records are available for the selected student." })}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm font-bold text-gray-700">{activeStudent?.firstName || t("common.student", { fallback: "Student" })}</td>
                    <td className="p-4 font-bold text-gray-800">{req.title}</td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                        {req.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-700">{req.requestedByTeacherName}</td>
                    <td className="p-4 text-sm font-medium text-gray-600">{req.dutyDate}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusColor(req.status)}`}>
                        {req.status === "Active" ? t("common.active", { fallback: "Active" }) : 
                         req.status === "Completed" ? t("common.completed", { fallback: "Completed" }) : 
                         req.status === "Cancelled" ? t("common.cancelled", { fallback: "Cancelled" }) : req.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setIsModalOpen(true);
                        }}
                        className="text-sm font-bold text-[#0077b6] hover:text-[#023e8a] flex items-center justify-end gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors ml-auto"
                      >
                        <Eye size={16} /> {t("common.view", { fallback: "View" })}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </MainCard>

      {/* View Modal */}
      {isModalOpen && selectedRequest && (
        <DutyDetailsModal 
          request={selectedRequest} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}
