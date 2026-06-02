import React from "react";
import AcademicTable from "./AcademicTable";
import { Edit2, ShieldAlert } from "lucide-react";

/**
 * AllocationTable
 * 
 * Modular grid rendering section-subject-teacher mappings.
 */
const AllocationTable = ({ 
  allocations = [], 
  onEditAllocation, 
  isEmpty = false 
}) => {
  return (
    <AcademicTable
      headers={[
        "Class Section",
        "Subject Assigned",
        "Assigned Teacher",
        "Schedule Detail",
        "Room Location",
        "Clearance Status",
        "Actions"
      ]}
      items={allocations}
      isEmpty={isEmpty}
      emptyTitle="No allocations assigned"
      emptyDescription="Create a new assignment or clear the active query filters."
      renderRow={(alloc) => (
        <tr key={alloc.id || `${alloc.classId}-${alloc.subjectId}`} className="hover:bg-[#caf0f8]/10 transition-colors text-xs text-gray-700 font-bold border-b border-[#caf0f8]/40">
          <td className="py-4 px-3 text-[#03045e] font-black first:pl-2">
            {alloc.className || "Class 11-A"}
          </td>
          <td className="py-4 px-3">
            <span className="px-2 py-0.5 rounded bg-[#caf0f8] text-[#03045e] text-[10px] font-black uppercase">
              {alloc.subjectName}
            </span>
          </td>
          <td className="py-4 px-3 text-[#0077b6]">{alloc.teacherName || "Unassigned"}</td>
          <td className="py-4 px-3 text-gray-400 font-bold">{alloc.schedule || "N/A"}</td>
          <td className="py-4 px-3 text-gray-500 font-semibold">{alloc.room || "Room 101"}</td>
          <td className="py-4 px-3">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 uppercase tracking-wider">
              AUTHORIZED
            </span>
          </td>
          <td className="py-4 px-3 text-right last:pr-2">
            {onEditAllocation && (
              <button 
                onClick={() => onEditAllocation(alloc)}
                className="text-[#0077b6] hover:text-[#03045e] transition-colors p-1.5 hover:bg-[#caf0f8]/40 rounded-lg flex items-center gap-1.5 ml-auto text-[10px] font-black"
              >
                <Edit2 size={12} />
                <span>REALLOCATE</span>
              </button>
            )}
          </td>
        </tr>
      )}
    />
  );
};

export default React.memo(AllocationTable);
