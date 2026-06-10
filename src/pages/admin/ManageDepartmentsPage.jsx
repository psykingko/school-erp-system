import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Plus,
  Edit,
  Shield,
  Search,
  Trash2,
  Users,
  CheckCircle2
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import MainCard from "../../components/MainCard";
import localProvider from "../../data/providers/localProvider";

const ManageDepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    departmentName: "",
    departmentHead: "",
    status: "active"
  });

  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const fetchedDepts = await localProvider.getDepartments();
      const fetchedEmps = await localProvider.getEmployees();
      setDepartments(fetchedDepts);
      setEmployees(fetchedEmps);
    } catch (error) {
      console.error("Error fetching departments/employees", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDepartments = useMemo(() => {
    return departments.filter((dept) => {
      const matchesSearch =
        searchTerm === "" ||
        dept.departmentName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || dept.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [departments, searchTerm, statusFilter]);

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        departmentName: dept.departmentName,
        departmentHead: dept.departmentHead || "",
        status: dept.status || "active"
      });
    } else {
      setEditingDept(null);
      setFormData({
        departmentName: "",
        departmentHead: "",
        status: "active"
      });
    }
    setShowModal(true);
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

    try {
      if (editingDept) {
        await localProvider.updateDepartment(editingDept.departmentId, {
          departmentName: formData.departmentName,
          departmentHead: formData.departmentHead || null,
          status: formData.status
        });
      } else {
        await localProvider.createDepartment({
          departmentName: formData.departmentName,
          departmentHead: formData.departmentHead || null,
          status: formData.status
        });
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving department:", error);
      alert("Failed to save department.");
    }
  };

  const handleDelete = async (deptId) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      await localProvider.deleteDepartment(deptId);
      fetchData();
    }
  };

  const getStatusBadge = (status) => {
    const isActive = status === "active";
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-50 text-gray-600 border-gray-200"}`}>
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const getEmployeeName = (empId) => {
    const emp = employees.find(e => e.employeeId === empId);
    return emp ? emp.employeeName : "Unassigned";
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading Departments...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Department Management"
        description="Standardized department registry serving as the single source of truth"
        breadcrumbs={["Admin Portal", "Administration", "Departments"]}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MainCard className="p-4 border border-[#caf0f8]/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Departments</p>
              <p className="text-lg font-black text-[#03045e] mt-1">{departments.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#caf0f8] text-[#0077b6]">
              <Building2 size={20} />
            </div>
          </div>
        </MainCard>
        <MainCard className="p-4 border border-[#caf0f8]/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Active Departments</p>
              <p className="text-lg font-black text-[#03045e] mt-1">
                {departments.filter((d) => d.status === "active").length}
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
              placeholder="Search departments..."
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
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Department ID</th>
              <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Department Name</th>
              <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Department Head</th>
              <th className="text-left py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
              <th className="text-right py-3 px-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map((dept) => (
              <tr key={dept.departmentId} className="border-b border-gray-50 hover:bg-[#caf0f8]/20 transition-colors">
                <td className="py-4 px-4 text-xs font-bold text-gray-600">{dept.departmentId}</td>
                <td className="py-4 px-4 text-xs font-black text-[#03045e]">{dept.departmentName}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <Users size={12} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-700">{getEmployeeName(dept.departmentHead)}</span>
                  </div>
                </td>
                <td className="py-4 px-4">{getStatusBadge(dept.status)}</td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleOpenModal(dept)} className="p-1.5 rounded-lg hover:bg-[#caf0f8] text-gray-400 hover:text-[#0077b6] transition-colors">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(dept.departmentId)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredDepartments.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-xs font-bold text-gray-400">
                  No departments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </MainCard>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-black text-[#03045e] flex items-center gap-2">
                <Building2 size={20} className="text-[#0077b6]" />
                {editingDept ? "Edit Department" : "Create Department"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-red-500 transition-colors">
                <Search size={20} className="rotate-45" /> {/* Close Icon Simulation */}
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
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
                  {employees.map(emp => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.employeeName} ({emp.employeeId} - {emp.designation})
                    </option>
                  ))}
                </select>
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
