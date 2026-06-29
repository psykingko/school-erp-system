import React, { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, Library } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import PageAuthorityBanner from "../../components/admin/PageAuthorityBanner";
import LeaveApprovalsPage from "./LeaveApprovalsPage";
import LeavePortfolioPage from "./LeavePortfolioPage";

const LeaveManagementPage = () => {
  const [activeTab, setActiveTab] = useState("approvals");

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        title="Leave Management"
        description="Centralized command center for managing leave approvals and institutional leave policies."
        breadcrumbs={["Admin Portal", "Operations", "Leave Management"]}
      />

      <PageAuthorityBanner moduleId="admin_leave_management" moduleName="Leave Management" />

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("approvals")}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-black tracking-wider transition-colors border-b-2 ${
            activeTab === "approvals"
              ? "border-[#03045e] text-[#03045e]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <ClipboardCheck size={18} />
          APPROVAL CENTER
        </button>
        <button
          onClick={() => setActiveTab("policies")}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-black tracking-wider transition-colors border-b-2 ${
            activeTab === "policies"
              ? "border-[#03045e] text-[#03045e]"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <Library size={18} />
          LEAVE POLICIES
        </button>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "approvals" && <LeaveApprovalsPage />}
        {activeTab === "policies" && <LeavePortfolioPage />}
      </motion.div>
    </div>
  );
};

export default LeaveManagementPage;
