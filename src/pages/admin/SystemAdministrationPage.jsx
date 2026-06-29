import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Users,
  Check,
  FileText,
  Search,
  Filter,
  CheckCircle,
  Settings,
  X,
  ShieldCheck,
  CheckSquare,
  Lock,
  UserPlus
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import MainCard from "../../components/MainCard";
import employeeService from "../../services/employeeService";

import authUserService from "../../services/authUserService";
import adminModuleCatalog from "../../services/adminModuleCatalog";
import departmentOwnershipService from "../../services/departmentOwnershipService";
import effectiveAccessService from "../../services/effectiveAccessService";

const SystemAdministrationPage = () => {
  const [activeTab, setActiveTab] = useState("admin_permissions");
  const [employees, setEmployees] = useState([]);
  const [authUsers, setAuthUsers] = useState({});
  const [filteredAdmins, setFilteredAdmins] = useState([]);

  const [ownershipHealth, setOwnershipHealth] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [tempPermissions, setTempPermissions] = useState([]);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);

  const [showProvisionModal, setShowProvisionModal] = useState(false);
  const [provisionData, setProvisionData] = useState({ employeeId: "", username: "", password: "" });
  const [isProvisioning, setIsProvisioning] = useState(false);

  const moduleGroups = adminModuleCatalog.groupModulesBySection();

  // Fetch initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const empData = await employeeService.getEmployees();
      
      // Load auth users map
      const authMap = {};
      for (const emp of empData) {
        if (emp.linkedAuthUserId) {
          try {
            const authUser = await authUserService.getAuthUserByEmployeeId(emp.employeeId);
            if (authUser) {
              const accessProfile = await effectiveAccessService.buildAccessProfile(authUser);
              authUser.departmentModules = accessProfile.departmentModules;
              authUser.manualOverrides = accessProfile.manualOverrides;
              authUser.effectiveModules = accessProfile.effectiveModules;
              authMap[emp.employeeId] = authUser;
            }
          } catch(e) {
            // Ignore missing
          }
        }
      }

      setEmployees(empData);
      setAuthUsers(authMap);

      const healthData = await departmentOwnershipService.getOwnershipCoverage();
      setOwnershipHealth(healthData);
    } catch (error) {
      console.error("Failed to load admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter portal-eligible employees for the permissions tab
  useEffect(() => {
    const eligibleStaff = employees.filter(emp => emp.portalAccess);

    if (!searchTerm.trim()) {
      setFilteredAdmins(eligibleStaff);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const filtered = eligibleStaff.filter(
      (emp) =>
        emp.employeeName.toLowerCase().includes(lower) ||
        emp.employeeId.toLowerCase().includes(lower) ||
        (emp.departmentId && emp.departmentId.toLowerCase().includes(lower))
    );
    setFilteredAdmins(filtered);
  }, [searchTerm, employees]);

  const getStatusBadge = (status) => {
    return status === "ACTIVE" ? (
      <span className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider border border-emerald-200">
        Active Login
      </span>
    ) : (
      <span className="px-2 py-1 rounded-md bg-red-50 text-red-700 text-[9px] font-black uppercase tracking-wider border border-red-200">
        Inactive Login
      </span>
    );
  };

  const handleToggleLoginStatus = async (emp, authUser) => {
    if (!authUser) return;
    const newStatus = authUser.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    if (window.confirm(`Are you sure you want to ${newStatus === 'INACTIVE' ? 'disable' : 'enable'} login for ${emp.employeeName}?`)) {
      try {
        await authUserService.updateAdminUser(authUser.id, { status: newStatus });
        await loadData();
      } catch (err) {
        console.error("Failed to toggle status", err);
      }
    }
  };

  const handleProvisionAdmin = async (e) => {
    e.preventDefault();
    if (!provisionData.employeeId || !provisionData.username || !provisionData.password) return;
    setIsProvisioning(true);
    try {
      const authUser = await authUserService.createAdminUser({
        username: provisionData.username,
        password: provisionData.password,
        employeeId: provisionData.employeeId,
        status: "ACTIVE",
        isSuperAdmin: false
      });
      await employeeService.updateEmployee(provisionData.employeeId, { linkedAuthUserId: authUser.id });
      await loadData();
      setShowProvisionModal(false);
      setProvisionData({ employeeId: "", username: "", password: "" });
    } catch(err) {
      alert("Failed to provision admin: " + err.message);
    } finally {
      setIsProvisioning(false);
    }
  };

  // Permission Modal Handlers
  const openPermissionModal = (emp) => {
    setSelectedAdmin(emp);
    const authUser = authUsers[emp.employeeId];
    setTempPermissions(authUser?.manualOverrides || []);
  };

  const closePermissionModal = () => {
    setSelectedAdmin(null);
    setTempPermissions([]);
  };

  const handleToggleOverride = (moduleId) => {
    setTempPermissions(prev => {
      if (prev.includes(moduleId)) {
        return prev.filter(id => id !== moduleId);
      } else {
        return [...prev, moduleId];
      }
    });
  };

  const handleToggleSection = (moduleIdsInSection, deptModules) => {
    // Only toggle modules that are NOT already granted by departments
    const toggleable = moduleIdsInSection.filter(id => !deptModules.includes(id));
    const allSelected = toggleable.every(id => tempPermissions.includes(id));
    
    setTempPermissions(prev => {
      let next = [...prev];
      if (allSelected) {
        next = next.filter(id => !toggleable.includes(id));
      } else {
        toggleable.forEach(id => {
          if (!next.includes(id)) next.push(id);
        });
      }
      return next;
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedAdmin) return;
    setIsSavingPermissions(true);
    try {
      const authUser = authUsers[selectedAdmin.employeeId];
      if (authUser) {
        await authUserService.updateManualOverrides(authUser.id, tempPermissions);
        // Re-fetch profile to keep UI in sync
        const newAuthUser = await authUserService.getAuthUserByEmployeeId(selectedAdmin.employeeId);
        const accessProfile = await effectiveAccessService.buildAccessProfile(newAuthUser);
        
        setAuthUsers(prev => ({
          ...prev,
          [selectedAdmin.employeeId]: {
            ...newAuthUser,
            departmentModules: accessProfile.departmentModules,
            manualOverrides: accessProfile.manualOverrides,
            effectiveModules: accessProfile.effectiveModules,
          }
        }));
      }
      closePermissionModal();
    } catch (error) {
      console.error("Failed to save permissions", error);
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const renderPermissionSummaryCard = () => {
    if (!selectedAdmin) return null;
    const authUser = authUsers[selectedAdmin.employeeId];
    if (authUser?.isSuperAdmin) {
      return (
        <div className="bg-[#caf0f8]/20 border border-[#caf0f8] p-4 rounded-xl mb-6 flex items-center gap-3 shadow-sm">
          <ShieldCheck size={28} className="text-[#03045e]" />
          <div>
            <p className="text-sm font-black text-[#03045e]">Full System Access</p>
            <p className="text-[11px] text-gray-500 font-bold mt-0.5">This user is a Super Admin. They have implicit access to all modules and configurations.</p>
          </div>
        </div>
      );
    }

    const deptCount = authUser.departmentModules?.length || 0;
    const overrideCount = tempPermissions.length;
    
    // Calculate new effective count based on tempPermissions for the preview
    const newEffectiveSet = new Set([...(authUser.departmentModules || []), ...tempPermissions]);
    const previewEffectiveCount = newEffectiveSet.size;

    return (
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl mb-6 shadow-sm">
        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <FileText size={12} />
          Access Breakdown
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white border border-gray-100 p-3 rounded-lg text-center">
             <span className="block text-[10px] font-bold text-gray-400 uppercase">Department Modules</span>
             <span className="block text-xl font-black text-[#03045e]">{deptCount}</span>
          </div>
          <div className="bg-white border border-[#00b4d8] p-3 rounded-lg text-center">
             <span className="block text-[10px] font-bold text-[#00b4d8] uppercase">Manual Overrides</span>
             <span className="block text-xl font-black text-[#0077b6]">{overrideCount}</span>
          </div>
          <div className="bg-[#caf0f8]/30 border border-[#caf0f8] p-3 rounded-lg text-center">
             <span className="block text-[10px] font-black text-[#03045e] uppercase">Effective Access</span>
             <span className="block text-xl font-black text-[#03045e]">{previewEffectiveCount}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="System Administration"
        description="Manage administrative permissions, operational module ownership, and view audit logs."
        breadcrumbs={["Admin Portal", "System Administration"]}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          {
            label: "Total Admin Accounts",
            value: Object.keys(authUsers).length,
            icon: Users,
            color: "text-[#0077b6]",
          },
          {
            label: "Active Admin Accounts",
            value: Object.values(authUsers).filter((u) => u.status === "ACTIVE").length,
            icon: CheckCircle,
            color: "text-emerald-600",
          },
          {
            label: "Super Admins",
            value: Object.values(authUsers).filter((u) => u.isSuperAdmin).length,
            icon: Shield,
            color: "text-[#03045e]",
          },
          {
            label: "Modules Without Owner",
            value: ownershipHealth?.uncoveredModules || 0,
            icon: Search,
            color: "text-orange-600",
          },
          {
            label: "Ownership Violations",
            value: ownershipHealth?.violations?.length || 0,
            icon: X,
            color: "text-red-600",
          },
        ].map((stat, i) => (
          <MainCard key={i} className={`p-4 border ${stat.value > 0 && stat.label === "Ownership Violations" ? 'border-red-400 bg-red-50' : 'border-[#caf0f8]/60'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[9px] font-black uppercase tracking-wider ${stat.value > 0 && stat.label === "Ownership Violations" ? 'text-red-500' : 'text-gray-400'}`}>
                  {stat.label}
                </p>
                <p className={`text-lg font-black mt-1 ${stat.value > 0 && stat.label === "Ownership Violations" ? 'text-red-600' : 'text-[#03045e]'}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-2 rounded-xl bg-[#caf0f8] ${stat.color} ${stat.value > 0 && stat.label === "Ownership Violations" ? 'bg-red-100' : ''}`}>
                <stat.icon size={18} />
              </div>
            </div>
          </MainCard>
        ))}
      </div>

      {/* Tab Navigation */}
      <MainCard className="p-2 border border-[#caf0f8]/60">
        <div className="flex flex-wrap items-center gap-1">
          {[
            {
              id: "admin_permissions",
              label: "Admin Access Management",
              icon: ShieldCheck,
            },

            { id: "module_governance", label: "Ownership Health Dashboard", icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === tab.id
                  ? "bg-[#03045e] text-white shadow-sm"
                  : "text-gray-500 hover:text-[#03045e] hover:bg-gray-50"
              }`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </MainCard>

      {/* 1. Admin Module Permissions Tab */}
      {activeTab === "admin_permissions" && (
        <MainCard className="border border-[#caf0f8]/60 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-[#03045e]">
                  Admin Access Management
                </h3>
                <p className="text-[10px] text-gray-500 mt-1">
                  Manage Admin Accounts, Module Assignments, and Login Status.
                </p>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative max-w-sm w-full">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search admins..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] transition-colors"
                  />
                </div>
                <button
                  onClick={() => setShowProvisionModal(true)}
                  className="flex items-center justify-center gap-2 bg-[#0077b6] hover:bg-[#03045e] text-white px-4 py-2 rounded-xl shadow-lg shadow-[#0077b6]/20 text-[11px] font-black transition-all w-full md:w-auto shrink-0"
                >
                  <UserPlus size={14} />
                  <span>Provision Access</span>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Staff Details
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="text-center py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Portal Eligible
                  </th>
                  <th className="text-center py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Identity
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Dept Modules
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Overrides
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Effective Access
                  </th>
                  <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-xs font-bold text-gray-400">
                      Loading profiles...
                    </td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-xs font-bold text-gray-400">
                      No admin users found.
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((emp) => {
                    const authUser = authUsers[emp.employeeId];
                    const isSuper = authUser?.isSuperAdmin;
                    const assignedCount = isSuper ? "All" : (authUser?.manualOverrides?.length || 0);

                    return (
                      <tr
                        key={emp.employeeId}
                        className="border-b border-gray-50 hover:bg-[#caf0f8]/10 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${isSuper ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-[#03045e] text-white'}`}>
                              {isSuper ? <Shield size={14}/> : emp.employeeName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-black text-[#03045e] flex items-center gap-1.5">
                                {emp.employeeName}
                                {isSuper && <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 text-[8px] uppercase tracking-wider border border-red-100">Super Admin</span>}
                              </p>
                              <p className="text-[10px] font-bold text-gray-400">
                                {emp.employeeId}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-xs font-bold text-gray-600">
                          {emp.departmentId || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {emp.portalAccess ? <CheckCircle size={16} className="mx-auto text-emerald-500" /> : <X size={16} className="mx-auto text-gray-300" />}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {authUser ? <CheckCircle size={16} className="mx-auto text-[#0077b6]" /> : <X size={16} className="mx-auto text-gray-300" />}
                        </td>
                        <td className="py-3 px-4">
                          {authUser ? getStatusBadge(authUser.status) : <span className="text-[10px] text-gray-400 font-bold uppercase">Not Provisioned</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-black border ${isSuper ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-[#caf0f8]/20 text-[#0077b6] border-[#caf0f8]'}`}>
                            {isSuper ? "-" : (authUser?.departmentModules?.length || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-black border ${isSuper ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                            {isSuper ? "-" : (authUser?.manualOverrides?.length || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-black border ${isSuper ? 'bg-[#caf0f8]/50 text-[#03045e] border-[#caf0f8]' : 'bg-[#03045e] text-white border-[#03045e]'}`}>
                            {isSuper ? "All Modules" : (authUser?.effectiveModules?.length || 0)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {authUser ? (
                              <>
                                <button 
                                  onClick={() => handleToggleLoginStatus(emp, authUser)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border ${authUser.status === 'ACTIVE' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'} rounded-lg text-[10px] font-black transition-colors shadow-sm whitespace-nowrap`}
                                >
                                  {authUser.status === 'ACTIVE' ? "Disable Login" : "Enable Login"}
                                </button>
                                <button 
                                  onClick={() => openPermissionModal(emp)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#caf0f8] text-[#0077b6] rounded-lg text-[10px] font-black hover:bg-[#caf0f8]/20 transition-colors shadow-sm whitespace-nowrap"
                                >
                                  <Settings size={12} />
                                  Manage Access
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => { setProvisionData({ ...provisionData, employeeId: emp.employeeId }); setShowProvisionModal(true); }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0077b6] text-white rounded-lg text-[10px] font-black hover:bg-[#03045e] transition-colors shadow-sm whitespace-nowrap"
                              >
                                <UserPlus size={12} />
                                Provision Identity
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </MainCard>
      )}

      {/* 3. Ownership Health Dashboard Tab */}
      {activeTab === "module_governance" && (
        <div className="space-y-6">
          {/* Ownership Health Metrics */}
          {ownershipHealth && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-[#caf0f8] shadow-sm">
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-1">Total Modules</p>
                <p className="text-2xl font-black text-[#03045e]">{ownershipHealth.totalModules}</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 shadow-sm">
                <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider mb-1">Covered Modules</p>
                <p className="text-2xl font-black text-emerald-600">{ownershipHealth.coveredModules}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm">
                <p className="text-[10px] font-black text-red-700 uppercase tracking-wider mb-1">Uncovered Modules</p>
                <p className="text-2xl font-black text-red-600">{ownershipHealth.uncoveredModules}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 shadow-sm">
                <p className="text-[10px] font-black text-orange-700 uppercase tracking-wider mb-1">Departments Missing Head</p>
                <p className="text-2xl font-black text-orange-600">{ownershipHealth.departmentsWithoutHead}</p>
              </div>
            </div>
          )}

          {/* Violations Grid */}
          {ownershipHealth && ownershipHealth.violations.length > 0 && (
            <MainCard className="border border-red-200">
              <div className="p-4 border-b border-red-100 bg-red-50 flex items-center gap-2">
                <X size={16} className="text-red-600" />
                <h3 className="text-sm font-black text-red-800">Ownership Violations ({ownershipHealth.violations.length})</h3>
              </div>
              <div className="divide-y divide-red-100">
                {ownershipHealth.violations.map((violation, i) => (
                  <div key={i} className="p-4 flex items-start gap-3 bg-white">
                    <div className="mt-0.5">
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-[9px] font-black uppercase rounded-md whitespace-nowrap">
                        {violation.type}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{violation.departmentName}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5">{violation.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </MainCard>
          )}

          {/* We do not render the full table here right now to keep it clean, the health summary handles the reporting. */}
        </div>
      )}

      {/* Permission Modal */}
      <AnimatePresence>
        {selectedAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePermissionModal}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                  <h3 className="text-lg font-black text-[#03045e] flex items-center gap-2">
                    Manage Permissions
                    {authUsers[selectedAdmin.employeeId]?.isSuperAdmin && (
                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-[10px] uppercase tracking-wider border border-red-100 flex items-center gap-1">
                        <Shield size={10} /> Super Admin
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 font-bold mt-1">
                    {selectedAdmin.employeeName} ({selectedAdmin.employeeId}) • {selectedAdmin.departmentId}
                  </p>
                </div>
                <button
                  onClick={closePermissionModal}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 bg-white scrollbar-thin scrollbar-thumb-gray-200">
                
                {/* DEV ONLY DIAGNOSTIC PANEL */}
                {import.meta.env.DEV && (
                  <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-purple-600 text-white text-[9px] font-black uppercase rounded">Development Diagnostic</span>
                      <span className="text-xs font-black text-purple-900">Effective Access Validation Panel</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-mono text-purple-800">
                      <div className="bg-white p-2 rounded border border-purple-100">
                        <span className="block font-black mb-1 border-b border-purple-100 pb-1">Department Modules</span>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(authUsers[selectedAdmin.employeeId]?.departmentModules || [], null, 2)}</pre>
                      </div>
                      <div className="bg-white p-2 rounded border border-purple-100">
                        <span className="block font-black mb-1 border-b border-purple-100 pb-1">Manual Overrides</span>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(authUsers[selectedAdmin.employeeId]?.manualOverrides || [], null, 2)}</pre>
                      </div>
                      <div className="bg-white p-2 rounded border border-purple-100">
                        <span className="block font-black mb-1 border-b border-purple-100 pb-1">Effective Modules</span>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(authUsers[selectedAdmin.employeeId]?.effectiveModules || [], null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                )}

                {renderPermissionSummaryCard()}

                <div className="space-y-6">
                  {Object.entries(moduleGroups).map(([section, modules]) => {
                    const isSuper = authUsers[selectedAdmin.employeeId]?.isSuperAdmin;
                    const deptModules = authUsers[selectedAdmin.employeeId]?.departmentModules || [];
                    const moduleIds = modules.map(m => m.id);
                    
                    const toggleable = moduleIds.filter(id => !deptModules.includes(id));
                    const isAllSelected = toggleable.length > 0 && toggleable.every(id => tempPermissions.includes(id));
                    const isSomeSelected = toggleable.some(id => tempPermissions.includes(id));

                    return (
                      <div key={section} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                          <h4 className="text-xs font-black text-[#03045e] uppercase tracking-wider flex items-center gap-2">
                            {section}
                          </h4>
                          {!isSuper && toggleable.length > 0 && (
                            <label className="flex items-center gap-2 cursor-pointer group">
                              <span className="text-[10px] font-bold text-gray-500 group-hover:text-[#0077b6] transition-colors">Toggle Available Overrides</span>
                              <div className="relative flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={isAllSelected}
                                  onChange={() => handleToggleSection(moduleIds, deptModules)}
                                  className="peer sr-only"
                                />
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                  isAllSelected ? 'bg-[#0077b6] border-[#0077b6]' : 
                                  isSomeSelected ? 'bg-[#caf0f8] border-[#0077b6]' : 'bg-white border-gray-300 group-hover:border-[#0077b6]'
                                }`}>
                                  {isAllSelected && <Check size={12} className="text-white" />}
                                  {!isAllSelected && isSomeSelected && <div className="w-2 h-0.5 bg-[#0077b6] rounded-full" />}
                                </div>
                              </div>
                            </label>
                          )}
                        </div>
                        
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {modules.map(mod => {
                            const isDeptOwned = deptModules.includes(mod.id);
                            const isOverride = tempPermissions.includes(mod.id);
                            const isChecked = isSuper || isDeptOwned || isOverride;
                            
                            let badge = null;
                            if (isSuper) badge = <span className="mt-1 px-1.5 py-0.5 bg-red-50 text-red-600 rounded text-[8px] uppercase font-black border border-red-200">Super Admin</span>;
                            else if (isDeptOwned) badge = <span className="mt-1 px-1.5 py-0.5 bg-[#caf0f8]/50 text-[#0077b6] rounded text-[8px] uppercase font-black border border-[#caf0f8]">Department</span>;
                            else if (isOverride) badge = <span className="mt-1 px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded text-[8px] uppercase font-black border border-orange-200">Manual Override</span>;

                            return (
                              <label
                                key={mod.id}
                                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                                  isSuper ? 'bg-gray-50 border-gray-100 opacity-70 cursor-not-allowed' :
                                  isDeptOwned ? 'bg-[#caf0f8]/10 border-[#caf0f8] cursor-not-allowed opacity-80' :
                                  isChecked ? 'bg-orange-50/30 border-orange-200 cursor-pointer hover:bg-orange-50/50' : 'bg-white border-gray-200 cursor-pointer hover:border-[#00b4d8] hover:bg-gray-50'
                                }`}
                              >
                                <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={isSuper || isDeptOwned}
                                    onChange={() => handleToggleOverride(mod.id)}
                                    className="peer sr-only"
                                  />
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                    isChecked ? (isSuper ? 'bg-gray-400 border-gray-400' : isDeptOwned ? 'bg-[#0077b6] border-[#0077b6]' : 'bg-orange-500 border-orange-500') : 'bg-white border-gray-300'
                                  }`}>
                                    {isChecked && (isSuper || isDeptOwned ? <Lock size={10} className="text-white" /> : <Check size={12} className="text-white" />)}
                                  </div>
                                </div>
                                <div>
                                  <span className={`text-xs font-bold block ${isChecked ? (isOverride ? 'text-orange-900' : 'text-[#03045e]') : 'text-gray-600'}`}>
                                    {mod.label}
                                  </span>
                                  <div className="flex items-center gap-1 flex-wrap">
                                    <span className="text-[9px] text-gray-400 font-mono mt-0.5 block">{mod.id}</span>
                                    {badge}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={closePermissionModal}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePermissions}
                  disabled={isSavingPermissions || authUsers[selectedAdmin.employeeId]?.isSuperAdmin}
                  className="px-5 py-2.5 rounded-xl text-xs font-black bg-[#03045e] text-white hover:bg-[#020344] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-[#03045e]/20"
                >
                  {isSavingPermissions ? "Saving..." : "Save Permissions"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Provision Admin Modal */}
      <AnimatePresence>
        {showProvisionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProvisionModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h3 className="text-lg font-black text-[#03045e] flex items-center gap-2">
                  <UserPlus size={18} className="text-[#0077b6]" />
                  Provision Admin Access
                </h3>
                <button
                  onClick={() => setShowProvisionModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 text-[#0077b6] rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={32} />
                </div>
                <h4 className="text-sm font-black text-[#03045e]">Manual Provisioning Disabled</h4>
                <p className="text-xs font-bold text-gray-500">
                  Provisioning moved to Staff Onboarding. Identity creation is now fully automated and decoupled from this interface to ensure security and audit integrity.
                </p>
                <div className="pt-6">
                  <button
                    onClick={() => setShowProvisionModal(false)}
                    className="px-6 py-2.5 rounded-xl text-xs font-black bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    Acknowledge
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SystemAdministrationPage;
