import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, Edit2, Shield, CalendarDays, BookOpen, UserCheck, 
  Settings, PowerOff, Power, Library, Users, Clock, AlertCircle, X, ChevronRight, CheckCircle2 
} from "lucide-react";
import MainCard from "../../components/MainCard";
import { LEAVE_APPLICABLE_TYPES } from "../../constants/leaveConstants";
import { 
  getLeaveTypes, getLeavePortfolioSummary, createLeaveType, 
  updateLeaveType, deactivateLeaveType, reactivateLeaveType 
} from "../../services/leavePortfolioService";
import { formatDate } from "../../shared/utils/attendanceHelpers";
import PermissionGate from "../../components/admin/PermissionGate";

const LeavePortfolioPage = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [summary, setSummary] = useState({ totalLeaveTypes: 0, activeLeaveTypes: 0, inactiveLeaveTypes: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activePortfolio, setActivePortfolio] = useState(null);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  
  const [formData, setFormData] = useState({
    leaveTypeName: "",
    description: "",
    applicableTo: [],
    defaultAllocation: 0,
    sortOrder: 1,
    isActive: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const types = await getLeaveTypes();
      const sum = await getLeavePortfolioSummary();
      setPortfolios(types);
      setSummary(sum);
    } catch (e) {
      console.error("Failed to load leave portfolios", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPortfolios = useMemo(() => {
    return portfolios.filter(p => {
      const matchSearch = p.leaveTypeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "all" ? true : statusFilter === "active" ? p.isActive : !p.isActive;
      return matchSearch && matchStatus;
    });
  }, [portfolios, searchTerm, statusFilter]);

  const handleOpenDetail = (portfolio) => {
    setActivePortfolio(portfolio);
    setShowDetailModal(true);
  };

  const handleOpenForm = (portfolio = null) => {
    if (portfolio) {
      setEditingPortfolio(portfolio);
      setFormData({
        leaveTypeName: portfolio.leaveTypeName,
        description: portfolio.description || "",
        applicableTo: portfolio.applicableTo || [],
        defaultAllocation: portfolio.defaultAllocation,
        sortOrder: portfolio.sortOrder || 1,
        isActive: portfolio.isActive
      });
    } else {
      setEditingPortfolio(null);
      setFormData({
        leaveTypeName: "",
        description: "",
        applicableTo: [],
        defaultAllocation: 0,
        sortOrder: portfolios.length > 0 ? Math.max(...portfolios.map(p => p.sortOrder || 0)) + 1 : 1,
        isActive: true
      });
    }
    setShowFormModal(true);
  };

  const handleToggleApplicableTo = (type) => {
    setFormData(prev => {
      const list = prev.applicableTo.includes(type) 
        ? prev.applicableTo.filter(t => t !== type)
        : [...prev.applicableTo, type];
      return { ...prev, applicableTo: list };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.applicableTo.length === 0) {
      alert("Please select at least one applicable type.");
      return;
    }
    
    try {
      if (editingPortfolio) {
        await updateLeaveType(editingPortfolio.leaveTypeId, formData);
      } else {
        await createLeaveType(formData);
      }
      setShowFormModal(false);
      fetchData();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleToggleActive = async (e, portfolio) => {
    e.stopPropagation();
    try {
      if (portfolio.isActive) {
        await deactivateLeaveType(portfolio.leaveTypeId);
      } else {
        await reactivateLeaveType(portfolio.leaveTypeId);
      }
      fetchData();
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-20 bg-gray-100 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 rounded-3xl" />)}
        </div>
        <div className="h-[400px] bg-gray-100 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">


      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MainCard className="p-6 flex items-center gap-4 border-l-4 border-[#03045e]">
          <div className="w-14 h-14 bg-[#03045e]/10 text-[#03045e] rounded-2xl flex items-center justify-center">
            <Library size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Leave Types</p>
            <p className="text-3xl font-black text-[#03045e]">{summary.totalLeaveTypes}</p>
          </div>
        </MainCard>
        
        <MainCard className="p-6 flex items-center gap-4 border-l-4 border-emerald-500">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Active Portfolios</p>
            <p className="text-3xl font-black text-emerald-600">{summary.activeLeaveTypes}</p>
          </div>
        </MainCard>
        
        <MainCard className="p-6 flex items-center gap-4 border-l-4 border-rose-500">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Inactive</p>
            <p className="text-3xl font-black text-rose-600">{summary.inactiveLeaveTypes}</p>
          </div>
        </MainCard>
      </div>

      <MainCard className="overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search leave types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] focus:border-[#0077b6] focus:ring-2 focus:ring-[#0077b6]/20 outline-none w-64 bg-white transition-all"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 outline-none focus:border-[#0077b6] cursor-pointer bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
          
          <PermissionGate moduleId="admin_leave_management" permission="create" mode="hidden">
            <button
              onClick={() => handleOpenForm()}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 px-6 py-2.5 bg-[#0077b6] text-white rounded-xl text-sm font-bold hover:bg-[#03045e] transition-colors shadow-lg shadow-[#0077b6]/20"
            >
              <Plus size={18} />
              Create Leave Type
            </button>
          </PermissionGate>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider">Leave Type</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider">Applicable To</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider">Allocation</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider">Type</th>
                <th className="text-left py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-right py-4 px-6 text-[10px] font-black text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPortfolios.map((p) => (
                <tr 
                  key={p.leaveTypeId} 
                  className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                  onClick={() => handleOpenDetail(p)}
                >
                  <td className="py-4 px-6">
                    <p className="text-sm font-black text-[#03045e]">{p.leaveTypeName}</p>
                    <p className="text-xs text-gray-500 font-medium truncate w-full flex-1 min-w-0 md:max-w-[200px]">{p.description}</p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-1 flex-wrap">
                      {p.applicableTo.map(type => (
                        <span key={type} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold capitalize">
                          {type}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-black">
                      <Clock size={14} />
                      {p.defaultAllocation} Days
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {p.isSystemDefined ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-purple-600">
                        <Shield size={14} /> System
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-gray-500">
                        <UserCheck size={14} /> Custom
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                      <PermissionGate moduleId="admin_leave_management" permission="edit" mode="hidden">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleOpenForm(p); }}
                          className="p-2 text-gray-400 hover:text-[#0077b6] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Leave Type"
                        >
                          <Edit2 size={16} />
                        </button>
                      </PermissionGate>
                      
                      <PermissionGate moduleId="admin_leave_management" permission="edit" mode="hidden">
                        <button 
                          onClick={(e) => handleToggleActive(e, p)}
                          className={`p-2 rounded-lg transition-colors ${
                            p.isActive 
                              ? 'text-gray-400 hover:text-rose-500 hover:bg-rose-50' 
                              : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50'
                          }`}
                          title={p.isActive ? "Deactivate" : "Reactivate"}
                        >
                          {p.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>
                      </PermissionGate>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredPortfolios.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <Library size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="font-bold text-gray-400">No leave portfolios found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </MainCard>

      {/* Form Modal */}
      <AnimatePresence>
        {showFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full w-[95vw] md:w-[90vw] lg:max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-black text-[#03045e]">
                  {editingPortfolio ? "Edit Leave Portfolio" : "Create Leave Type"}
                </h2>
                <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <form id="portfolioForm" onSubmit={handleSave} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Leave Type Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.leaveTypeName}
                      onChange={(e) => setFormData({ ...formData, leaveTypeName: e.target.value })}
                      disabled={editingPortfolio?.isSystemDefined}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] outline-none focus:border-[#0077b6] disabled:bg-gray-100 disabled:text-gray-500"
                    />
                    {editingPortfolio?.isSystemDefined && (
                      <p className="text-xs text-rose-500 mt-1 font-bold">Name cannot be changed for system defined types.</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 outline-none focus:border-[#0077b6] resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Default Allocation (Days) *</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.defaultAllocation}
                        onChange={(e) => setFormData({ ...formData, defaultAllocation: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] outline-none focus:border-[#0077b6]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Sort Order</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.sortOrder}
                        onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#03045e] outline-none focus:border-[#0077b6]"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Applicable To *</label>
                    <div className="flex flex-wrap gap-3">
                      {LEAVE_APPLICABLE_TYPES.map(type => (
                        <label key={type} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={formData.applicableTo.includes(type)}
                            onChange={() => handleToggleApplicableTo(type)}
                            className="w-4 h-4 rounded text-[#0077b6] focus:ring-[#0077b6]"
                          />
                          <span className="text-sm font-bold text-gray-700 capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {!editingPortfolio && (
                    <label className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-xl border border-gray-100 mt-4">
                      <input 
                        type="checkbox" 
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-800">Set as Active Immediately</p>
                        <p className="text-xs text-gray-500">Portfolio will be available for allocation.</p>
                      </div>
                    </label>
                  )}
                </form>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  form="portfolioForm"
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0077b6] hover:bg-[#03045e] shadow-lg shadow-[#0077b6]/20 transition-all"
                >
                  {editingPortfolio ? "Save Changes" : "Create Portfolio"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Details Drawer/Modal */}
      <AnimatePresence>
        {showDetailModal && activePortfolio && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl w-full w-[95vw] md:w-[90vw] lg:max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 relative bg-gradient-to-br from-blue-50 to-white">
                <button 
                  onClick={() => setShowDetailModal(false)} 
                  className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 bg-white p-1 rounded-full shadow-sm"
                >
                  <X size={20} />
                </button>
                <div className="w-16 h-16 bg-[#03045e] rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-[#03045e]/20">
                  <Library size={28} />
                </div>
                <h2 className="text-2xl font-black text-[#03045e] mb-1">{activePortfolio.leaveTypeName}</h2>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <span className="text-xs font-mono text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-100">{activePortfolio.leaveTypeId}</span>
                  {activePortfolio.isSystemDefined && (
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded">System Data</span>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Description</p>
                  <p className="text-sm text-gray-700 font-medium leading-relaxed">
                    {activePortfolio.description || "No description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Clock size={12}/> Default Allocation</p>
                    <p className="text-xl font-black text-[#03045e]">{activePortfolio.defaultAllocation} <span className="text-sm text-gray-500 font-bold">Days</span></p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1.5"><Power size={12}/> Current Status</p>
                    <p className={`text-sm font-black uppercase tracking-wider mt-2 ${activePortfolio.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {activePortfolio.isActive ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Applicable Entity Types</p>
                  <div className="flex flex-wrap gap-2">
                    {activePortfolio.applicableTo.map(type => (
                      <div key={type} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/50 border border-blue-100 text-[#0077b6] rounded-lg text-xs font-bold capitalize">
                        <Users size={14} /> {type}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Created Date</p>
                    <p className="text-xs font-bold text-gray-600">{formatDate(activePortfolio.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Last Updated</p>
                    <p className="text-xs font-bold text-gray-600">{formatDate(activePortfolio.updatedAt)}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between">
                 <PermissionGate moduleId="admin_leave_management" permission="edit" mode="hidden">
                   <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleOpenForm(activePortfolio);
                    }}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-[#03045e] hover:bg-[#0077b6] transition-colors"
                  >
                    Edit Configuration
                  </button>
                 </PermissionGate>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  Close Drawer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LeavePortfolioPage;
