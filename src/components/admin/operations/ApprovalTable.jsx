import React from "react";
import StatusBadge from "./StatusBadge";
import { Check, X, ShieldAlert } from "lucide-react";

/**
 * ApprovalTable
 * 
 * Directory view mapping student or faculty leave schedules and approving logs.
 */
const ApprovalTable = ({ 
  requests = [], 
  onApprove, 
  onReject, 
  isEmpty = false 
}) => {
  return (
    <div className="overflow-x-auto w-full">
      {isEmpty || requests.length === 0 ? (
        <div className="p-8 text-center bg-gray-50/50 rounded-3xl border border-dashed border-[#caf0f8]/80 text-gray-400 font-bold uppercase tracking-wider">
          No pending approvals requested
        </div>
      ) : (
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="border-b border-[#caf0f8] text-[10px] uppercase font-black tracking-wider text-gray-400">
              <th className="py-4 px-3 first:pl-2">Student / Employee</th>
              <th className="py-4 px-3">Category</th>
              <th className="py-4 px-3">Duration Bounds</th>
              <th className="py-4 px-3">Reason Description</th>
              <th className="py-4 px-3">Verification</th>
              <th className="py-4 px-3 text-right last:pr-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#caf0f8]/30">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-[#caf0f8]/10 transition-colors text-xs text-gray-700 font-bold">
                <td className="py-4 px-3 first:pl-2">
                  <span className="block text-[#03045e] font-black">{req.name || "Student"}</span>
                  <span className="block text-[9px] text-gray-400 mt-0.5">{req.classSec || "Class 11-A"}</span>
                </td>
                <td className="py-4 px-3">
                  <span className="inline-block px-2 py-0.5 rounded bg-gray-50 border border-gray-100 text-[9px] font-bold uppercase text-gray-400">
                    {req.type || "Sick Leave"}
                  </span>
                </td>
                <td className="py-4 px-3 text-gray-500 font-semibold">{req.startDate} to {req.endDate}</td>
                <td className="py-4 px-3 text-gray-600 max-w-xs truncate">{req.reason || "N/A"}</td>
                <td className="py-4 px-3">
                  <StatusBadge status={req.status} />
                </td>
                <td className="py-4 px-3 text-right last:pr-2">
                  {req.status === "Pending" && (
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => onApprove(req.id)}
                        className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-100 transition-colors"
                        title="Approve request"
                      >
                        <Check size={14} />
                      </button>
                      <button 
                        onClick={() => onReject(req.id)}
                        className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 flex items-center justify-center text-rose-600 border border-rose-100 transition-colors"
                        title="Reject request"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default React.memo(ApprovalTable);
