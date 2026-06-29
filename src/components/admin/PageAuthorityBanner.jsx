import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import actionPermissionService from "../../services/actionPermissionService";
import departmentOwnershipService from "../../services/departmentOwnershipService";
import employeeService from "../../services/employeeService";
import { ShieldAlert, ShieldCheck, Shield } from "lucide-react";

/**
 * Provides a clear, unified access and ownership diagnostic banner for major pages.
 */
const PageAuthorityBanner = ({ moduleId, moduleName }) => {
  const { user } = useAuth();
  const [accessLevel, setAccessLevel] = useState("Loading...");
  const [ownerInfo, setOwnerInfo] = useState({ departmentName: "Loading...", ownerName: "Loading..." });

  useEffect(() => {
    let isMounted = true;
    
    const loadBannerData = async () => {
      try {
        const level = await actionPermissionService.getAccessLevel(user, moduleId);
        
        const dept = await departmentOwnershipService.getDepartmentByModule(moduleId);
        let deptName = "Unassigned";
        let headName = "Unassigned";
        
        if (dept) {
          deptName = dept.departmentName;
          if (dept.departmentHead) {
            const employees = await employeeService.getEmployees();
            const headEmp = employees.find(e => e.employeeId === dept.departmentHead);
            if (headEmp) headName = headEmp.employeeName;
          }
        }

        if (isMounted) {
          setAccessLevel(level);
          setOwnerInfo({ departmentName: deptName, ownerName: headName });
        }
      } catch (e) {
        console.error("Failed to load banner data", e);
      }
    };

    if (user && moduleId) {
      loadBannerData();
    }

    return () => { isMounted = false; };
  }, [user, moduleId]);

  if (accessLevel === "None") return null;

  // Visuals based on access level
  let bgClass = "bg-gray-50 border-gray-200";
  let iconClass = "text-gray-500";
  let Icon = Shield;
  let textClass = "text-gray-700";
  let badgeClass = "bg-gray-200 text-gray-700";

  if (accessLevel === "Owner") {
    bgClass = "bg-emerald-50 border-emerald-200";
    iconClass = "text-emerald-600";
    Icon = ShieldCheck;
    textClass = "text-emerald-800";
    badgeClass = "bg-emerald-200 text-emerald-800";
  } else if (accessLevel === "Super Admin") {
    bgClass = "bg-purple-50 border-purple-200";
    iconClass = "text-purple-600";
    Icon = ShieldAlert;
    textClass = "text-purple-800";
    badgeClass = "bg-purple-200 text-purple-800";
  } else if (accessLevel === "View Only") {
    bgClass = "bg-blue-50 border-blue-200";
    iconClass = "text-[#0077b6]";
    Icon = Shield;
    textClass = "text-[#03045e]";
    badgeClass = "bg-[#caf0f8] text-[#0077b6]";
  }

  return (
    <div className={`w-full flex flex-col sm:flex-row sm:items-center justify-between p-4 mb-6 rounded-2xl border ${bgClass} shadow-sm`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-white shadow-sm ${iconClass}`}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className={`text-sm font-black ${textClass}`}>{moduleName} Authorization</h3>
          <p className="text-[10px] sm:text-xs font-bold text-gray-500 mt-0.5">
            Department: <span className="text-gray-700">{ownerInfo.departmentName}</span> &bull; Owner: <span className="text-gray-700">{ownerInfo.ownerName}</span>
          </p>
        </div>
      </div>
      <div className="mt-3 sm:mt-0 flex items-center gap-2">
        <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Your Access Level:</span>
        <span className={`px-3 py-1 rounded-lg text-xs font-black tracking-wide ${badgeClass}`}>
          {accessLevel}
        </span>
      </div>
    </div>
  );
};

export default PageAuthorityBanner;
