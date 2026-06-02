import React, { useState, useEffect } from "react";
import { getItem, setItem } from "../../persistence/storage";
import { STORAGE_KEYS } from "../../persistence/storageKeys";
import { approveLeave, rejectLeave } from "../../services/leaveService";
import {
  CheckSquare,
  ShieldCheck,
  Filter,
  Users,
  ClipboardCheck,
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import OperationsStatCard from "../../components/admin/operations/OperationsStatCard";
import ApprovalTable from "../../components/admin/operations/ApprovalTable";
import OperationsFilterBar from "../../components/admin/operations/OperationsFilterBar";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import { motion } from "framer-motion";

const LeaveApprovalsPage = () => {
  const [leaves, setLeaves] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Pending");
  const [loading, setLoading] = useState(true);

  // Success message state
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const allLeaves = getItem(STORAGE_KEYS.LEAVE_REQUESTS, []);
      const allStudents = getItem(STORAGE_KEYS.STUDENTS, []);
      const allClasses = getItem(STORAGE_KEYS.CLASSES, []);

      setLeaves(allLeaves || []);
      setStudents(allStudents || []);
      setClasses(allClasses || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId) => {
    try {
      const leave = leaves.find((l) => l.id === leaveId);
      if (!leave) return;
      const reviewer = leave.appliedTo || "teach-001";
      await approveLeave(leaveId, reviewer);

      const dbLeaves = getItem(STORAGE_KEYS.LEAVE_REQUESTS, []);
      setLeaves(dbLeaves);

      // Success feedback
      const stu = students.find((s) => s.id === leave.studentId);
      setSuccessMsg(
        `Leave request for ${stu ? stu.name : "Student"} APPROVED successfully!`,
      );
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReject = async (leaveId) => {
    try {
      const leave = leaves.find((l) => l.id === leaveId);
      if (!leave) return;
      const reviewer = leave.appliedTo || "teach-001";
      await rejectLeave(leaveId, reviewer);

      const dbLeaves = getItem(STORAGE_KEYS.LEAVE_REQUESTS, []);
      setLeaves(dbLeaves);

      const stu = students.find((s) => s.id === leave.studentId);
      setSuccessMsg(
        `Leave request for ${stu ? stu.name : "Student"} REJECTED successfully.`,
      );
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  // Helper resolver to format leave card displays
  const resolvedRequests = leaves.map((leave) => {
    const stu = students.find((s) => s.id === leave.studentId);
    const cls = classes.find((c) => c.id === (leave.classId || stu?.classId));

    // Normalize casing for StatusBadge
    let statusFormatted = "Pending";
    if (leave.status === "APPROVED") statusFormatted = "Approved";
    else if (leave.status === "REJECTED") statusFormatted = "Rejected";

    return {
      id: leave.id,
      name: stu ? stu.name : "Student Name",
      classSec: cls ? cls.name : "Class 11-A",
      type:
        leave.reason.toLowerCase().includes("sick") ||
        leave.reason.toLowerCase().includes("fever")
          ? "Sick Leave"
          : "Personal Leave",
      startDate: leave.fromDate,
      endDate: leave.toDate,
      reason: leave.reason,
      status: statusFormatted,
      classId: leave.classId,
    };
  });

  const filteredRequests = resolvedRequests.filter((req) => {
    const matchesSearch =
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "" || req.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Leave Requests Approval Desk"
        description="Review student and faculty leave submissions, verify class teacher recommendations, and audit institutional absences."
        breadcrumbs={["Admin Portal", "Operations", "Leave Approvals"]}
      />

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-3xl text-emerald-700 text-xs font-black shadow-sm transition-all animate-bounce">
          {successMsg}
        </div>
      )}

      {/* Roster Strengths stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <OperationsStatCard
          title="Pending Leave Reviews"
          value={leaves.filter((l) => l.status === "PENDING").length.toString()}
          description="Awaiting administrative review"
          icon={ClipboardCheck}
        />
        <OperationsStatCard
          title="Leaves Approved This Month"
          value={leaves
            .filter((l) => l.status === "APPROVED")
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
          placeholder="Search requests by student name or reason..."
          filterSlots={
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none"
            >
              <option value="">Filter Status...</option>
              <option value="Pending">Pending Reviews</option>
              <option value="Approved">Approved Requests</option>
              <option value="Rejected">Rejected Requests</option>
            </select>
          }
        />

        <div className="mt-6">
          <ApprovalTable
            requests={filteredRequests}
            onApprove={handleApprove}
            onReject={handleReject}
            isEmpty={filteredRequests.length === 0}
          />
        </div>
      </AdminSectionCard>
    </motion.div>
  );
};

export default LeaveApprovalsPage;
