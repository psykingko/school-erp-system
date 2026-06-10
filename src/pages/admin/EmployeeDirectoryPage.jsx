import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Edit,
  Search,
  Trash2,
  CheckCircle2,
  Eye,
  Mail,
  Phone,
  Calendar,
  Building2,
  Shield
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import MainCard from "../../components/MainCard";
import localProvider from "../../data/providers/localProvider";
import { ROLES } from "../../auth/roles";

// We import the seeds to cross-reference roles since they aren't fully in localProvider yet
import { ROLE_NAVIGATION } from "../../auth/navigation";
// We'll mock the roles fetch to use the existing roles for demonstration
const ROLES_SEED = [
  { id: "role-super-admin", name: "Super Administrator" },
  { id: "role-principal", name: "Principal" },
  { id: "role-vice-principal", name: "Vice Principal" },
  { id: "role-academic-coordinator", name: "Academic Coordinator" },
  { id: "role-exam-controller", name: "Examination Controller" },
  { id: "role-hr-manager", name: "HR Manager" },
  { id: "role-class-teacher", name: "Class Teacher" },
  { id: "role-subject-teacher", name: "Subject Teacher" },
  { id: "role-librarian", name: "Librarian" },
  { id: "role-transport-manager", name: "Transport Manager" },
  { id: "role-accountant", name: "Accountant" },
  { id: "role-receptionist", name: "Receptionist" },
];

const EmployeeDirectoryPage = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const [editingEmp, setEditingEmp] = useState(null);
  const [activeEmp, setActiveEmp] = useState(null);
  
  const [formData, setFormData] = useState({
    employeeName: "",
    departmentId: "",
    roleId: "",
    designation: "",
    phone: "",
    email: "",
    joiningDate: new Date().toISOString().split("T")[0],
    status: "active"
  });

  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const fetchedEmps = await localProvider.getEmployees();
      const fetchedDepts = await localProvider.getDepartments();
      setEmployees(fetchedEmps);
      setDepartments(fetchedDepts);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        searchTerm === "" ||
        emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus =
        statusFilter === "all" || emp.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [employees, searchTerm, statusFilter]);

  const handleOpenModal = (emp = null) => {
    if (emp) {
      setEditingEmp(emp);
      setFormData({
        employeeName: emp.employeeName,
        departmentId: emp.departmentId || "",
        roleId: emp.roleId || "",
        designation: emp.designation || "",
        phone: emp.phone || "",
        email: emp.email || "",
        joiningDate: emp.joiningDate || new Date().toISOString().split("T")[0],
        status: emp.status || "active"
      });
    } else {
      setEditingEmp(null);
      setFormData({
        employeeName: "",
        departmentId: "",
        roleId: "",
        designation: "",
        phone: "",
        email: "",
        joiningDate: new Date().toISOString().split("T")[0],
        status: "active"
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmp(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.employeeName.trim() || !formData.email.trim()) {
      alert("Name and Email are required.");
      return;
    }

    try {
      if (editingEmp) {
        await localProvider.updateEmployee(editingEmp.employeeId, formData);
      } else {
        await localProvider.createEmployee(formData);
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving employee:", error);
      alert("Failed to save employee.");
    }
  };

  const handleDelete = async (empId) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      await localProvider.deleteEmployee(empId);
      fetchData();
    }
  };

  const openDetails = (emp) => {
    setActiveEmp(emp);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const isActive = status === "active";
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const getDeptName = (deptId) => {
    const d = departments.find(d => d.departmentId === deptId);
    return d ? d.departmentName : "Unassigned";
  };

  const getRoleName = (roleId) => {
    const r = ROLES_SEED.find(r => r.id === roleId);
    return r ? r.name : "Unassigned";
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading Employee Registry...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Employee Directory"
        description="Single source of truth for all non-teaching and administrative staff"
        breadcrumbs={["Admin Portal", "User Management", "Employees"]}
        actionButton={
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#03045e] text-white px-5 py-2.5 rounded-2xl shadow-lg shadow-[#0077b6]/20 text-xs font-black transition-all"
          >
            <Plus size={16} />
            <span>Add Employee</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MainCard className="p-4 border border-[#caf0f8]/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Staff</p>
              <p className="text-lg font-black text-[#03045e] mt-1">{employees.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#caf0f8] text-[#0077b6]">
              <Users size={20} />
            </div>
          </div>
        </MainCard>
        <MainCard className="p-4 border border-[#caf0f8]/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Active Employees</p>
              <p className="text-lg font-black text-[#03045e] mt-1">
                {employees.filter((e) => e.status === "active").length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </MainCard>
      </div>

      <MainCard className="p-4 border border-[#caf0f8]/60">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-[#caf0f8] text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] bg-white cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </MainCard>

      <MainCard className="border border-[#caf0f8]/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Employee</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Department</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Role & Designation</th>
                <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.employeeId} className="border-b border-gray-50 hover:bg-[#caf0f8]/20 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-xs font-black text-[#03045e]">{emp.employeeName}</p>
                      <p className="text-[10px] text-gray-400">{emp.employeeId}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-xs font-bold text-gray-600">{getDeptName(emp.departmentId)}</td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-xs font-bold text-gray-700">{emp.designation}</p>
                      <p className="text-[10px] text-gray-400">{getRoleName(emp.roleId)}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(emp.status)}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openDetails(emp)} className="p-1.5 rounded-lg hover:bg-[#caf0f8] text-gray-400 hover:text-[#0077b6] transition-colors">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => handleOpenModal(emp)} className="p-1.5 rounded-lg hover:bg-[#caf0f8] text-gray-400 hover:text-[#0077b6] transition-colors">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(emp.employeeId)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-xs font-bold text-gray-400">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </MainCard>

      {/* Edit/Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2">
                <Users size={20} className="text-[#0077b6]" />
                {editingEmp ? "Edit Employee" : "Add Employee"}
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="empForm" onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Employee Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.employeeName}
                      onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] outline-none focus:border-[#0077b6]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] outline-none focus:border-[#0077b6]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] outline-none focus:border-[#0077b6]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Department</label>
                    <select
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] outline-none focus:border-[#0077b6] cursor-pointer"
                    >
                      <option value="">-- Select --</option>
                      {departments.map(d => (
                        <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Designation</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] outline-none focus:border-[#0077b6]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">System Role</label>
                    <select
                      value={formData.roleId}
                      onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] outline-none focus:border-[#0077b6] cursor-pointer"
                    >
                      <option value="">-- Select --</option>
                      {ROLES_SEED.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Joining Date</label>
                    <input
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] outline-none focus:border-[#0077b6]"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] outline-none focus:border-[#0077b6] cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="empForm"
                className="px-4 py-2 rounded-xl text-xs font-black bg-[#0077b6] text-white hover:bg-[#03045e] transition-colors"
              >
                Save Employee
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Lightweight Employee Details Modal */}
      {showDetailsModal && activeEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
          >
            <div className="p-6 text-center border-b border-gray-100 bg-gray-50 relative">
              <button onClick={() => setShowDetailsModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
                <Search className="rotate-45" size={18} />
              </button>
              <div className="w-16 h-16 mx-auto bg-[#03045e] text-white rounded-full flex items-center justify-center text-2xl font-black mb-3">
                {activeEmp.employeeName.charAt(0)}
              </div>
              <h2 className="text-xl font-black text-[#03045e]">{activeEmp.employeeName}</h2>
              <p className="text-xs text-gray-500">{activeEmp.employeeId}</p>
              <div className="mt-2 flex justify-center">
                {getStatusBadge(activeEmp.status)}
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Building2 size={16} /></div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Department</p>
                  <p className="text-sm font-bold text-gray-700">{getDeptName(activeEmp.departmentId)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Shield size={16} /></div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Designation & Role</p>
                  <p className="text-sm font-bold text-gray-700">{activeEmp.designation}</p>
                  <p className="text-xs text-gray-500">{getRoleName(activeEmp.roleId)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Mail size={16} /></div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Email</p>
                  <p className="text-sm font-bold text-gray-700">{activeEmp.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Phone size={16} /></div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-bold text-gray-700">{activeEmp.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-50 text-slate-600 rounded-lg"><Calendar size={16} /></div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Joining Date</p>
                  <p className="text-sm font-bold text-gray-700">{activeEmp.joiningDate}</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default EmployeeDirectoryPage;
