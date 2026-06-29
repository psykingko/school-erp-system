import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Plus,
  Edit,
  Shield,
  Search,
  Trash2,
  Users,
  CheckCircle2,
  AlertTriangle,
  X,
  Activity,
  Layers,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import MainCard from "../../components/MainCard";
import departmentService from "../../services/departmentService";
import employeeService from "../../services/employeeService";
import departmentGovernanceService from "../../services/departmentGovernanceService";
import departmentOwnershipService from "../../services/departmentOwnershipService";
import { getTemplateModulesForDepartment } from "../../constants/departmentModuleTemplates";
import adminModuleCatalog from "../../services/adminModuleCatalog";
import authUserService from "../../services/authUserService";

const MODULE_OPTIONS = adminModuleCatalog.getAllModules().map(m => ({
  id: m.id,
  name: m.label
}));

const ManageDepartmentsPage = () => {
  const [activeTab, setActiveTab] = useState("health");
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [authUsers, setAuthUsers] = useState({});
  
  // Governance Metrics
  const [metrics, setMetrics] = useState(null);
  const [healthLedger, setHealthLedger] = useState([]);
  const [readiness, setReadiness] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  
  // Drawer
  const [selectedDrawerDept, setSelectedDrawerDept] = useState(null);
  const [drawerDistribution, setDrawerDistribution] = useState([]);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    departmentName: "",
    departmentHead: "",
    memberIds: [],
    status: "active",
    ownedModules: []
  });

  const eligibleHeads = useMemo(() => {
    return employees.filter(e => e.portalAccess && e.status === "active");
  }, [employees]);

  const eligibleMembers = useMemo(() => {
    return employees.filter(e => e.portalAccess);
  }, [employees]);

  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const fetchedDepts = await departmentService.getDepartments();
      const fetchedEmps = await employeeService.getEmployees();
      const allAuthUsers = await authUserService.getAllAdminUsers();
      
      const authMap = {};
      allAuthUsers.forEach(u => authMap[u.employeeId] = u);
      setAuthUsers(authMap);
      
      setDepartments(fetchedDepts);
      setEmployees(fetchedEmps);
      
      const [m, hl, r] = await Promise.all([
        departmentGovernanceService.getDepartmentGovernanceMetrics(),
        departmentGovernanceService.getDepartmentHealthLedger(),
        departmentGovernanceService.getDepartmentReadiness()
      ]);
      setMetrics(m);
      setHealthLedger(hl);
      setReadiness(r);

    } catch (error) {
      console.error("Error fetching governance data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredHealth = useMemo(() => {
    return healthLedger.filter((dept) =>
        searchTerm === "" || dept.departmentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [healthLedger, searchTerm]);

  const filteredReadiness = useMemo(() => {
    return readiness.filter((dept) =>
        searchTerm === "" || dept.departmentName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [readiness, searchTerm]);

  const handleOpenModal = (deptId = null, e = null) => {
    if (e) e.stopPropagation();
    
    if (deptId) {
      const dept = departments.find(d => d.departmentId === deptId);
      setEditingDept(dept);
      setFormData({
        departmentName: dept.departmentName,
        departmentHead: dept.departmentHead || "",
        memberIds: dept.memberIds || [],
        status: dept.status || "active",
        ownedModules: dept.ownedModules || getTemplateModulesForDepartment(dept.departmentId)
      });
    } else {
      setEditingDept(null);
      setFormData({
        departmentName: "",
        departmentHead: "",
        memberIds: [],
        status: "active",
        ownedModules: []
      });
    }
    setShowModal(true);
  };

  const handleOpenDrawer = async (deptId) => {
    const dept = healthLedger.find(d => d.departmentId === deptId);
    if (!dept) return;
    
    setSelectedDrawerDept(dept);
    setIsDrawerLoading(true);
    
    try {
      const distribution = await departmentGovernanceService.getEffectiveAccessDistribution(deptId);
      setDrawerDistribution(distribution);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDrawerLoading(false);
    }
  };

  const handleCloseDrawer = () => {
    setSelectedDrawerDept(null);
    setDrawerDistribution([]);
  };

  const handleToggleModule = (moduleId) => {
    setFormData(prev => ({
      ...prev,
      ownedModules: prev.ownedModules.includes(moduleId)
        ? prev.ownedModules.filter(id => id !== moduleId)
        : [...prev.ownedModules, moduleId]
    }));
  };

  const handleResetToTemplate = () => {
    if (editingDept) {
      setFormData(prev => ({
        ...prev,
        ownedModules: getTemplateModulesForDepartment(editingDept.departmentId)
      }));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingDept(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.departmentName.trim()) {
      alert("Department name is required.");
      return;
    }

    if (formData.departmentHead && formData.memberIds.includes(formData.departmentHead)) {
      alert("A user cannot be both the Head and a Member of the same department.");
      return;
    }

    try {
      // Transfer Validation
      const allUsersToAssign = [...formData.memberIds];
      if (formData.departmentHead) allUsersToAssign.push(formData.departmentHead);

      let transferRequired = false;
      const deptIdToCheck = editingDept ? editingDept.departmentId : null;
      
      for (const uid of allUsersToAssign) {
        // check if they are in another department
        const otherDeptAsHead = departments.find(d => d.departmentId !== deptIdToCheck && d.departmentHead === uid);
        const otherDeptAsMember = departments.find(d => d.departmentId !== deptIdToCheck && d.memberIds && d.memberIds.includes(uid));
        
        if (otherDeptAsHead || otherDeptAsMember) {
          transferRequired = true;
          break;
        }
      }

      if (transferRequired) {
        const confirmed = window.confirm("One or more selected admins already belong to another department. Transfer them?");
        if (!confirmed) return;

        // Perform transfers
        for (const uid of allUsersToAssign) {
          await departmentOwnershipService.removeUserFromOtherDepartments(uid, deptIdToCheck);
        }
      }

      if (editingDept) {
        await departmentService.updateDepartment(editingDept.departmentId, {
          departmentName: formData.departmentName,
          departmentHead: formData.departmentHead || null,
          memberIds: formData.memberIds,
          status: formData.status,
          ownedModules: formData.ownedModules
        });
      } else {
        await departmentService.createDepartment({
          departmentName: formData.departmentName,
          departmentHead: formData.departmentHead || null,
          memberIds: formData.memberIds,
          status: formData.status,
          ownedModules: formData.ownedModules
        });
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving department:", error);
      alert("Failed to save department.");
    }
  };

  const handleDelete = async (deptId, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this department?")) {
      await departmentService.deleteDepartment(deptId);
      fetchData();
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading Governance Dashboard...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Department Governance Center"
        description="Monitor department health, module ownership coverage, and derived access readiness."
        breadcrumbs={["Admin Portal", "Governance", "Departments"]}
        actionButton={
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#03045e] text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-[#0077b6]/20 text-xs font-black transition-all"
          >
            <Plus size={16} />
            <span>Create Department</span>
          </button>
        }
      />

      {/* Governance Summary Cards */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <MainCard className="p-4 border border-[#caf0f8]/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Total Departments</p>
                <p className="text-lg font-black text-[#03045e] mt-1">{metrics.totalDepartments}</p>
              </div>
              <div className="p-2 rounded-xl bg-[#caf0f8] text-[#0077b6]">
                <Building2 size={18} />
              </div>
            </div>
          </MainCard>
          <MainCard className="p-4 border border-[#caf0f8]/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Heads Assigned</p>
                <p className="text-lg font-black text-emerald-600 mt-1">{metrics.headsAssigned}</p>
              </div>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Users size={18} />
              </div>
            </div>
          </MainCard>
          <MainCard className={`p-4 border ${metrics.headsMissing > 0 ? 'border-orange-200 bg-orange-50' : 'border-[#caf0f8]/60'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[9px] font-black uppercase tracking-wider ${metrics.headsMissing > 0 ? 'text-orange-600' : 'text-gray-400'}`}>Heads Missing</p>
                <p className={`text-lg font-black mt-1 ${metrics.headsMissing > 0 ? 'text-orange-700' : 'text-[#03045e]'}`}>{metrics.headsMissing}</p>
              </div>
              <div className={`p-2 rounded-xl ${metrics.headsMissing > 0 ? 'bg-orange-200 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                <AlertTriangle size={18} />
              </div>
            </div>
          </MainCard>
          <MainCard className="p-4 border border-[#caf0f8]/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">Modules Covered</p>
                <p className="text-lg font-black text-[#0077b6] mt-1">{metrics.modulesCovered}</p>
              </div>
              <div className="p-2 rounded-xl bg-[#caf0f8] text-[#0077b6]">
                <Shield size={18} />
              </div>
            </div>
          </MainCard>
          <MainCard className={`p-4 border ${metrics.modulesUncovered > 0 ? 'border-red-200 bg-red-50' : 'border-[#caf0f8]/60'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-[9px] font-black uppercase tracking-wider ${metrics.modulesUncovered > 0 ? 'text-red-600' : 'text-gray-400'}`}>Modules Uncovered</p>
                <p className={`text-lg font-black mt-1 ${metrics.modulesUncovered > 0 ? 'text-red-700' : 'text-[#03045e]'}`}>{metrics.modulesUncovered}</p>
              </div>
              <div className={`p-2 rounded-xl ${metrics.modulesUncovered > 0 ? 'bg-red-200 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                <ShieldAlert size={18} />
              </div>
            </div>
          </MainCard>
        </div>
      )}

      {/* Governance Violations Widget */}
      {metrics && metrics.violations.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex flex-col gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-red-700 font-black">
            <AlertTriangle size={18} />
            <span>Governance Violations Detected</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {metrics.violations.map((v, idx) => (
              <div key={idx} className="bg-white p-3 rounded-xl border border-red-100 shadow-sm flex flex-col">
                <span className="text-[10px] font-black uppercase text-red-500 tracking-wider mb-1">{v.type}</span>
                <span className="text-xs font-bold text-gray-800 mb-1">{v.departmentName}</span>
                <span className="text-[11px] text-gray-500 leading-tight">{v.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          className={`px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors ${activeTab === 'health' ? 'text-[#0077b6] border-b-2 border-[#0077b6]' : 'text-gray-400 hover:text-gray-600'}`}
          onClick={() => setActiveTab('health')}
        >
          Department Health
        </button>
        <button
          className={`px-4 py-3 text-xs font-black uppercase tracking-wider transition-colors ${activeTab === 'readiness' ? 'text-[#0077b6] border-b-2 border-[#0077b6]' : 'text-gray-400 hover:text-gray-600'}`}
          onClick={() => setActiveTab('readiness')}
        >
          Department Readiness
        </button>
      </div>

      <MainCard className="p-4 border border-[#caf0f8]/60">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
            />
          </div>
        </div>
      </MainCard>

      <MainCard className="border border-[#caf0f8]/60 overflow-x-auto w-full">
        <table className="w-full min-w-[800px]">
          {activeTab === 'health' && (
            <>
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Department</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Department Head</th>
                  <th className="text-center py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Owned Modules</th>
                  <th className="text-center py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Member Count</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Health Status</th>
                  <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHealth.map((dept) => (
                  <tr key={dept.departmentId} onClick={() => handleOpenDrawer(dept.departmentId)} className="border-b border-gray-50 hover:bg-[#caf0f8]/20 transition-colors cursor-pointer">
                    <td className="py-4 px-4 text-xs font-black text-[#03045e]">{dept.departmentName}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Users size={12} className={dept.headEmployeeId ? "text-[#0077b6]" : "text-gray-300"} />
                        <span className={`text-xs font-bold ${dept.headEmployeeId ? "text-gray-800" : "text-gray-400 italic"}`}>
                          {dept.headName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-xs font-black text-gray-600">{dept.ownedModules.length}</td>
                    <td className="py-4 px-4 text-center text-xs font-black text-[#0077b6]">{dept.memberCount}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                        dept.status === 'Healthy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        dept.status === 'Warning' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {dept.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={(e) => handleOpenModal(dept.departmentId, e)} className="p-1.5 rounded-lg hover:bg-[#caf0f8] text-gray-400 hover:text-[#0077b6] transition-colors">
                          <Edit size={14} />
                        </button>
                        <button onClick={(e) => handleDelete(dept.departmentId, e)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          )}

          {activeTab === 'readiness' && (
            <>
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Department</th>
                  <th className="text-center py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Assigned Modules</th>
                  <th className="text-center py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Unassigned Modules</th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Readiness</th>
                </tr>
              </thead>
              <tbody>
                {filteredReadiness.map((dept) => (
                  <tr key={dept.departmentId} className="border-b border-gray-50 hover:bg-[#caf0f8]/20 transition-colors">
                    <td className="py-4 px-4 text-xs font-black text-[#03045e]">{dept.departmentName}</td>
                    <td className="py-4 px-4 text-center text-xs font-black text-[#0077b6]">{dept.assignedCount}</td>
                    <td className="py-4 px-4 text-center text-xs font-black text-orange-500">{dept.unassignedCount}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                        dept.readiness === 'Ready' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        dept.readiness === 'Partial' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {dept.readiness}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          )}
          
          {(activeTab === 'health' ? filteredHealth : filteredReadiness).length === 0 && (
            <tbody>
              <tr>
                <td colSpan="6" className="py-8 text-center text-xs font-bold text-gray-400">
                  No departments found.
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </MainCard>

      {/* Drill-down Drawer */}
      <AnimatePresence>
        {selectedDrawerDept && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseDrawer}
              className="absolute inset-0 bg-gray-900/20 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl border-l border-gray-100 flex flex-col z-10"
            >
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2">
                  <Building2 size={20} className="text-[#0077b6]" />
                  {selectedDrawerDept.departmentName}
                </h2>
                <button onClick={handleCloseDrawer} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200">
                {/* Info Card */}
                <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Department Head</p>
                    <p className="text-sm font-bold text-[#03045e] mt-1">{selectedDrawerDept.headName}</p>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Members</p>
                      <p className="text-sm font-bold text-[#0077b6] mt-1">{selectedDrawerDept.memberCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Owned Modules</p>
                      <p className="text-sm font-bold text-[#03045e] mt-1">{selectedDrawerDept.ownedModules.length}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Health</p>
                      <p className={`text-sm font-bold mt-1 ${selectedDrawerDept.status === 'Healthy' ? 'text-emerald-600' : 'text-red-600'}`}>{selectedDrawerDept.status}</p>
                    </div>
                  </div>
                </div>

                {/* Modules */}
                <div>
                  <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider mb-3">Owned Modules List</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDrawerDept.ownedModules.length > 0 ? (
                      selectedDrawerDept.ownedModules.map(modId => {
                        const mName = MODULE_OPTIONS.find(m => m.id === modId)?.name || modId;
                        return (
                          <span key={modId} className="px-2.5 py-1 bg-[#caf0f8]/40 border border-[#caf0f8] text-[#0077b6] text-xs font-bold rounded-lg shadow-sm">
                            {mName}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-gray-400 italic">No modules owned.</span>
                    )}
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Effective Access Distribution */}
                <div>
                  <h3 className="text-xs font-black text-[#03045e] uppercase tracking-wider mb-1">Effective Access Distribution</h3>
                  <p className="text-[10px] text-gray-500 mb-4">Read-only view of access profiles for admins in this department.</p>
                  
                  {isDrawerLoading ? (
                    <div className="text-xs text-gray-400 text-center py-4">Loading access profiles...</div>
                  ) : (
                    <div className="space-y-3">
                      {drawerDistribution.length > 0 ? (
                        drawerDistribution.map(emp => (
                          <div key={emp.employeeId} className="border border-gray-100 p-3 rounded-xl bg-gray-50/50">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-black text-gray-800">{emp.employeeName}</span>
                              {emp.isSuperAdmin && (
                                <span className="text-[9px] font-black uppercase bg-purple-100 text-purple-700 px-2 py-0.5 rounded">Super Admin</span>
                              )}
                            </div>
                            
                            {!emp.isSuperAdmin && (
                              <div className="space-y-2">
                                <div className="flex gap-2 text-[10px]">
                                  <span className="font-bold text-gray-500 w-24">Effective ({emp.effectiveModules.length}):</span>
                                  <span className="text-gray-700">{emp.effectiveModules.map(id => MODULE_OPTIONS.find(m => m.id === id)?.name || id).join(', ') || 'None'}</span>
                                </div>
                                {emp.manualOverrides.length > 0 && (
                                  <div className="flex gap-2 text-[10px]">
                                    <span className="font-bold text-orange-500 w-24">Overrides ({emp.manualOverrides.length}):</span>
                                    <span className="text-orange-600">{emp.manualOverrides.map(id => MODULE_OPTIONS.find(m => m.id === id)?.name || id).join(', ')}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-400 italic text-center py-4">No active admins found in this department.</div>
                      )}
                    </div>
                  )}
                </div>

              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button onClick={(e) => { handleCloseDrawer(); handleOpenModal(selectedDrawerDept.departmentId, e); }} className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-black uppercase tracking-wider rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                  Edit Department Info
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl w-full w-[95vw] md:w-[90vw] lg:max-w-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2">
                <Building2 size={20} className="text-[#0077b6]" />
                {editingDept ? "Edit Department" : "Create Department"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={formData.departmentName}
                  onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] outline-none focus:border-[#0077b6] transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Department Head (Employee)</label>
                <select
                  value={formData.departmentHead}
                  onChange={(e) => setFormData({ ...formData, departmentHead: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] outline-none focus:border-[#0077b6] transition-colors cursor-pointer"
                >
                  <option value="">-- Unassigned --</option>
                  {eligibleHeads.map(emp => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.employeeName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Department Members</label>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 max-h-[150px] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2">
                  {eligibleMembers.filter(emp => emp.employeeId !== formData.departmentHead).map(emp => (
                    <label key={emp.employeeId} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded-md transition-colors">
                      <input
                        type="checkbox"
                        className="accent-[#0077b6]"
                        checked={formData.memberIds.includes(emp.employeeId)}
                        onChange={() => {
                          setFormData(prev => ({
                            ...prev,
                            memberIds: prev.memberIds.includes(emp.employeeId)
                              ? prev.memberIds.filter(id => id !== emp.employeeId)
                              : [...prev.memberIds, emp.employeeId]
                          }));
                        }}
                      />
                      <span className="text-[11px] font-bold text-[#03045e] truncate" title={emp.employeeName}>{emp.employeeName}</span>
                    </label>
                  ))}
                  {eligibleMembers.length === 0 && <span className="text-xs text-gray-500 italic p-2">No eligible staff members available.</span>}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] outline-none focus:border-[#0077b6] transition-colors cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Owned Software Modules
                  </label>
                  {editingDept && (
                    <button
                      type="button"
                      onClick={handleResetToTemplate}
                      className="text-[9px] font-black text-[#0077b6] hover:underline"
                    >
                      Reset to Template Default
                    </button>
                  )}
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 max-h-[200px] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-2">
                  {MODULE_OPTIONS.map(mod => (
                    <label key={mod.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1.5 rounded-md transition-colors">
                      <input
                        type="checkbox"
                        className="accent-[#0077b6]"
                        checked={formData.ownedModules.includes(mod.id)}
                        onChange={() => handleToggleModule(mod.id)}
                      />
                      <span className="text-[11px] font-bold text-[#03045e]">{mod.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[9px] text-gray-500 mt-1 font-bold">
                  Selecting a module here makes the Department Head the authoritative owner of that module across the system.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black bg-[#0077b6] text-white hover:bg-[#03045e] transition-colors"
                >
                  Save Department
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default ManageDepartmentsPage;
