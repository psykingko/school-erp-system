import React, { useState } from "react";
import StatusBadge from "./StatusBadge";
import { Check, X, ShieldAlert, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import PermissionGate from "../PermissionGate";

/**
 * ApprovalTable
 * 
 * Directory view mapping student or faculty leave schedules and approving logs.
 */
const ApprovalTable = ({
  requests = [],
  onApprove, 
  onReject, 
  isEmpty = false,
  gateProps = null
}) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleExpand = (id) => {
    setExpandedRow(prev => prev === id ? null : id);
  };

  return (
    <div className="overflow-x-auto w-full">
      {isEmpty || requests.length === 0 ? (
        <div className="p-8 text-center bg-gray-50/50 rounded-3xl border border-dashed border-[#caf0f8]/80 text-gray-400 font-bold uppercase tracking-wider">
          No pending approvals requested
        </div>
      ) : (
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-[#caf0f8] text-[10px] uppercase font-black tracking-wider text-gray-400">
              <th className="py-4 px-3 first:pl-2">Student / Employee</th>
              <th className="py-4 px-3">Leave Type</th>
              <th className="py-4 px-3">Duration</th>
              <th className="py-4 px-3">Status</th>
              <th className="py-4 px-3 text-right last:pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#caf0f8]/30">
            {requests.map((req) => {
              const isStaff = req.isStaff;
              const b = req.balanceSnapshot;
              const isExpanded = expandedRow === req.id;
              
              let hasInsufficientBalance = false;
              let requestedDays = 0;
              let beforeBalance = "N/A";
              let afterBalance = "N/A";
              
              if (b) {
                requestedDays = b.requestedDays || 0;
                if (!b.isValid && b.error === "Insufficient Balance") {
                  hasInsufficientBalance = true;
                  beforeBalance = b.beforeBalance;
                  afterBalance = "N/A";
                } else if (b.isValid) {
                  beforeBalance = b.beforeBalance;
                  afterBalance = b.afterBalance;
                }
              }

              return (
                <React.Fragment key={req.id}>
                  <tr className="hover:bg-[#caf0f8]/10 transition-colors text-xs text-gray-700 font-bold cursor-pointer" onClick={() => toggleExpand(req.id)}>
                    <td className="py-4 px-3 first:pl-2">
                      <div className="flex items-center gap-2">
                        {isExpanded ? <ChevronUp size={14} className="text-[#0077b6] shrink-0" /> : <ChevronDown size={14} className="text-gray-400 shrink-0" />}
                        <div>
                          <span className="block text-[#03045e] font-black">{req.name || "Student"}</span>
                          <span className="block text-[9px] text-gray-400 mt-0.5">{req.classSec || "Class 11-A"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3">
                      <span className="inline-block px-2 py-0.5 rounded bg-gray-50 border border-gray-100 text-[9px] font-bold uppercase text-gray-400">
                        {req.type || "Sick Leave"}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className="text-xs font-bold text-gray-600">
                        {req.startDate} to {req.endDate}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-4 px-3 text-right last:pr-2">
                      {req.status === "Pending" && (
                        <div className="flex items-center justify-end gap-1.5 flex-wrap" onClick={e => e.stopPropagation()}>
                          {hasInsufficientBalance ? (
                             <div className="text-[9px] text-rose-500 font-black uppercase tracking-wider flex items-center gap-1 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
                               <AlertCircle size={10} /> Insufficient Balance
                             </div>
                          ) : (
                            gateProps ? (
                              <PermissionGate {...gateProps}>
                                <button 
                                  onClick={() => onApprove(req.id)}
                                  className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-100 transition-colors"
                                  title="Approve request"
                                >
                                  <Check size={14} />
                                </button>
                              </PermissionGate>
                            ) : (
                              <button 
                                onClick={() => onApprove(req.id)}
                                className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-100 transition-colors"
                                title="Approve request"
                              >
                                <Check size={14} />
                              </button>
                            )
                          )}
                          {gateProps ? (
                            <PermissionGate {...gateProps}>
                              <button 
                                onClick={() => onReject(req.id)}
                                className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-600 border border-rose-100 transition-colors"
                                title="Reject request"
                              >
                                <X size={14} />
                              </button>
                            </PermissionGate>
                          ) : (
                            <button 
                              onClick={() => onReject(req.id)}
                              className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-600 border border-rose-100 transition-colors"
                              title="Reject request"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                  
                  {/* Approval Detail Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <tr>
                        <td colSpan={5} className="p-0 border-b border-[#caf0f8]/30">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-gray-50/50 overflow-hidden"
                          >
                            <div className="p-4 grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4 border-l-4 border-[#0077b6] ml-2 my-2 bg-white rounded-r-xl shadow-sm">
                              <div>
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Leave Information</h4>
                                <p className="text-xs font-bold text-[#03045e] mb-1">Type: <span className="text-gray-600">{req.type}</span></p>
                                <p className="text-xs font-bold text-[#03045e] mb-1">Duration: <span className="text-gray-600">{req.startDate} to {req.endDate}</span></p>
                                <p className="text-xs font-bold text-[#03045e]">Reason: <span className="text-gray-600">{req.reason || "N/A"}</span></p>
                              </div>
                              
                              {isStaff && b && req.status === "Pending" && (
                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                  <h4 className="text-[10px] font-black text-[#0077b6] uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <ShieldAlert size={12} /> Allocation Preview
                                  </h4>
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 font-bold">Balance At Application:</span>
                                      <span className="text-gray-700 font-black">{b.balanceAtApplication} Days</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 font-bold">Current Balance:</span>
                                      <span className="text-gray-700 font-black">{beforeBalance} Days</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-500 font-bold">Requested:</span>
                                      <span className="text-[#03045e] font-black">{requestedDays} Days</span>
                                    </div>
                                    <div className="flex justify-between pt-1 mt-1 border-t border-gray-200">
                                      <span className="text-gray-500 font-bold">Balance After Approval:</span>
                                      <span className={hasInsufficientBalance ? "text-rose-500 font-black" : "text-emerald-600 font-black"}>
                                        {hasInsufficientBalance ? "N/A" : `${afterBalance} Days`}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default React.memo(ApprovalTable);
