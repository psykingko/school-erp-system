import React, { useState, useEffect } from "react";
import { getItem } from "../../persistence/storage";
import { STORAGE_KEYS } from "../../persistence/storageKeys";
import { approveLeave, rejectLeave, getLeaveRequests } from "../../services/leaveService";
import { getApprovalBalancePreview } from "../../services/leaveBalanceService";
import {
  CheckSquare,
  ShieldCheck,
  Filter,
  Users,
  ClipboardCheck,
} from "lucide-react";
import OperationsStatCard from "../../components/admin/operations/OperationsStatCard";
import ApprovalTable from "../../components/admin/operations/ApprovalTable";
import OperationsFilterBar from "../../components/admin/operations/OperationsFilterBar";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import { motion, AnimatePresence } from "framer-motion";

const LeaveApprovalsPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [resolvedRequests, setResolvedRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Pending");
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(true);

  // Reject Modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingLeaveId, setRejectingLeaveId] = useState(null);
  const [rejectRemark, setRejectRemark] = useState("");
  const [rejecting, setRejecting] = useState(false);

  // Success message state
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allLeaves = await getLeaveRequests();
      setLeaves(allLeaves);
      
      const allStudents = getItem(STORAGE_KEYS.STUDENTS, []);
      const allClasses = getItem(STORAGE_KEYS.CLASSES, []);
      const allTeachers = getItem(STORAGE_KEYS.TEACHERS, []);
      const allEmployees = getItem(STORAGE_KEYS.EMPLOYEES, []);

      const resolved = await Promise.all(allLeaves.map(async (leave) => {
        let name = "Unknown";
        let subtext = "N/A";
        let typeFormatted = "Personal Leave";
        let isStaff = false;
        let applicantId = leave.applicantId || leave.studentId;
        
        // Resolve applicant details
        if (leave.applicantType === "Teacher") {
          const t = allTeachers.find(x => x.id === applicantId);
          name = t?.teacherName || "Teacher";
          subtext = t?.designation || "Teacher";
          isStaff = true;
        } else if (leave.applicantType === "Employee") {
          const e = allEmployees.find(x => x.employeeId === applicantId);
          name = e?.employeeName || "Employee";
          subtext = e ? e.designation : "Staff";
          isStaff = true;
        } else {
          // Legacy Student
          const s = allStudents.find(x => x.id === leave.studentId);
          const c = allClasses.find(x => x.id === (leave.classId || s?.classId));
          name = s?.name || "Student";
          subtext = c ? c.name : "Class N/A";
        }

        // Leave type name
        if (isStaff && leave.leaveTypeNameSnapshot) {
          typeFormatted = leave.leaveTypeNameSnapshot;
        } else if (leave.reason && (leave.reason.toLowerCase().includes("sick") || leave.reason.toLowerCase().includes("fever"))) {
          typeFormatted = "Sick Leave";
        } else {
          typeFormatted = leave.leaveType || "Personal Leave";
        }

        let statusFormatted = "Pending";
        if (leave.status === "APPROVED" || leave.status === "Approved") statusFormatted = "Approved";
        else if (leave.status === "REJECTED" || leave.status === "Rejected") statusFormatted = "Rejected";

        let balanceSnapshot = null;
        if (isStaff && statusFormatted === "Pending" && leave.leaveTypeId) {
           const requestedDays = leave.requestedDays || 0;
           const preview = await getApprovalBalancePreview(applicantId, leave.applicantType.toLowerCase(), leave.leaveTypeId, requestedDays);
           
           if (preview) {
             balanceSnapshot = {
               isValid: preview.isValid,
               requestedDays: preview.requestedDays,
               beforeBalance: preview.beforeBalance,
               afterBalance: preview.afterBalance,
               balanceAtApplication: leave.balanceAtApplication || "Not Available"
             };
           }
        }

        return {
          id: leave.id,
          name,
          classSec: subtext,
          type: typeFormatted,
          startDate: leave.fromDate,
          endDate: leave.toDate,
          reason: leave.reason,
          status: statusFormatted,
          isStaff,
          applicantType: leave.applicantType || "Student",
          balanceSnapshot
        };
      }));

      // Sort by latest applied
      resolved.sort((a, b) => {
        const aDate = leaves.find(l => l.id === a.id)?.createdAt;
        const bDate = leaves.find(l => l.id === b.id)?.createdAt;
        return new Date(bDate || 0) - new Date(aDate || 0);
      });

      setResolvedRequests(resolved);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await approveLeave(leaveId, "Admin"); // Assuming admin reviewer
      setSuccessMsg("Leave request APPROVED successfully and balances updated!");
      setTimeout(() => setSuccessMsg(""), 4000);
      fetchData(); // Refresh to update balances and states
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || "Failed to approve leave");
      setTimeout(() => setErrorMsg(""), 6000);
    }
  };

  const handleRejectClick = (leaveId) => {
    setErrorMsg("");
    setSuccessMsg("");
    setRejectingLeaveId(leaveId);
    setRejectRemark("");
    setRejectModalOpen(true);
  };

  const submitReject = async (e) => {
    e.preventDefault();
    if (!rejectRemark.trim()) {
      setErrorMsg("A remark is required to reject a leave request.");
      setTimeout(() => setErrorMsg(""), 6000);
      return;
    }
    setRejecting(true);
    try {
      await rejectLeave(rejectingLeaveId, "Admin", rejectRemark.trim());
      setSuccessMsg("Leave request REJECTED successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
      setRejectModalOpen(false);
      fetchData();
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || "Failed to reject leave");
      setTimeout(() => setErrorMsg(""), 6000);
    } finally {
      setRejecting(false);
    }
  };

  const filteredRequests = resolvedRequests.filter((req) => {
    const matchesSearch =
      (req.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.reason && req.reason.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      selectedStatus === "" || req.status === selectedStatus;

    const matchesType =
      selectedType === "" || req.applicantType === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >


      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-3xl text-emerald-700 text-xs font-black shadow-sm transition-all">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-3xl text-rose-700 text-xs font-black shadow-sm transition-all flex items-center gap-2">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Roster Strengths stats */}
      <div className="grid grid-cols-1 sm:grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <OperationsStatCard
          title="Pending Leave Reviews"
          value={leaves.filter((l) => (l.status || "Pending").toUpperCase() === "PENDING").length.toString()}
          description="Awaiting administrative review"
          icon={ClipboardCheck}
        />
        <OperationsStatCard
          title="Leaves Approved This Month"
          value={leaves
            .filter((l) => (l.status || "").toUpperCase() === "APPROVED")
            .length.toString()}
          description="Schedules synchronized to roster"
          icon={ClipboardCheck}
          color="#0096c7"
          bg="#ade8f4"
        />
        <OperationsStatCard
          title="Operational Coverage"
          value="100%"
          description="All classrooms mapped"
          icon={ClipboardCheck}
          color="#03045e"
          bg="#e0f2fe"
        />
      </div>

      {/* List in Section Card */}
      <AdminSectionCard>
        <OperationsFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search requests by name or reason..."
          filterSlots={
            <>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none"
              >
                <option value="">All Roles</option>
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Employee">Employee</option>
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending Reviews</option>
                <option value="Approved">Approved Requests</option>
                <option value="Rejected">Rejected Requests</option>
              </select>
            </>
          }
        />

        <div className="mt-6 space-y-8">
          {loading ? (
             <div className="p-8 text-center text-xs font-bold text-gray-400">Loading requests...</div>
          ) : (
            <>
              {filteredRequests.filter(r => r.isStaff).length > 0 && (
                <div>
                  <h3 className="text-xs font-black text-[#03045e] mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Users size={14} className="text-[#00b4d8]" />
                    Staff Leave Requests
                  </h3>
                  <div className="bg-white rounded-3xl border border-[#caf0f8]/50 overflow-hidden shadow-sm">
                    <ApprovalTable
                      requests={filteredRequests.filter(r => r.isStaff)}
                      onApprove={handleApprove}
                      onReject={handleRejectClick}
                      isEmpty={false}
                      gateProps={{ moduleId: "admin_leave_management", permission: "approve", mode: "disabled" }}
                    />
                  </div>
                </div>
              )}

              {filteredRequests.filter(r => !r.isStaff).length > 0 && (
                <div>
                  <h3 className="text-xs font-black text-[#03045e] mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Users size={14} className="text-[#00b4d8]" />
                    Student Leave Requests
                  </h3>
                  <div className="bg-white rounded-3xl border border-[#caf0f8]/50 overflow-hidden shadow-sm">
                    <ApprovalTable
                      requests={filteredRequests.filter(r => !r.isStaff)}
                      onApprove={handleApprove}
                      onReject={handleRejectClick}
                      isEmpty={false}
                      gateProps={{ moduleId: "admin_leave_management", permission: "approve", mode: "disabled" }}
                    />
                  </div>
                </div>
              )}

              {filteredRequests.length === 0 && (
                <div className="p-8 text-center bg-gray-50/50 rounded-3xl border border-dashed border-[#caf0f8]/80 text-gray-400 font-bold uppercase tracking-wider">
                  No pending approvals requested
                </div>
              )}
            </>
          )}
        </div>
      </AdminSectionCard>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => !rejecting && setRejectModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full w-[95vw] md:w-[90vw] lg:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-rose-50 to-white">
                <h3 className="text-lg font-black text-rose-600 flex items-center gap-2">
                  Reject Leave Request
                </h3>
              </div>
              <form onSubmit={submitReject} className="p-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#03045e] uppercase tracking-wider">Rejection Reason <span className="text-rose-500">*</span></label>
                    <textarea
                      required
                      autoFocus
                      rows={3}
                      value={rejectRemark}
                      onChange={(e) => setRejectRemark(e.target.value)}
                      placeholder="Please provide a clear reason for rejecting this leave..."
                      className="w-full px-4 py-2.5 text-xs font-bold text-[#03045e] bg-gray-50 border border-gray-100 rounded-xl focus:border-rose-500 focus:bg-white outline-none resize-none transition-all"
                    />
                  </div>
                </div>
                <div className="pt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setRejectModalOpen(false)}
                    disabled={rejecting}
                    className="px-5 py-2.5 text-xs font-black text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rejecting}
                    className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all disabled:opacity-50"
                  >
                    {rejecting ? "Rejecting..." : "Confirm Reject"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default LeaveApprovalsPage;
