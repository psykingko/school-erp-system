import React, { useState, useEffect, useMemo } from "react";
import studentDutyService from "../../services/studentDutyService";
import MainCard from "../../components/MainCard";
import DutyDetailsModal from "../../components/DutyDetailsModal";
import { ClipboardCheck, CheckCircle, XCircle, Eye, Clock, ClipboardList, Users, UserCog } from "lucide-react";

const CATEGORIES = ["Sports", "Assembly", "Competition", "Academic", "Administrative"];

import PageAuthorityBanner from "../../components/admin/PageAuthorityBanner";

export default function StudentDutyAdminPage() {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [teacherFilter, setTeacherFilter] = useState("All");
  const [classFilter, setClassFilter] = useState("All");
  const [sectionFilter, setSectionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [allRequests, dashboardStats] = await Promise.all([
        studentDutyService.getAllDutyRequests(),
        studentDutyService.getDutyDashboardStats()
      ]);
      // Sort to show newest first
      setRequests(allRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setStats(dashboardStats);
    } catch (error) {
      console.error("Error fetching admin duty data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Filter Options
  const filterOptions = useMemo(() => {
    const teachers = new Set();
    const classes = new Set();
    const sections = new Set();

    requests.forEach(req => {
      if (req.requestedByTeacherName) teachers.add(req.requestedByTeacherName);
      if (req.targetStudents) {
        req.targetStudents.forEach(stu => {
          const level = stu.classLevel || stu.className?.split('-')[0];
          if (level) classes.add(level);
          if (classFilter !== "All" && level === classFilter && stu.section) {
            sections.add(stu.section);
          }
        });
      }
    });

    return {
      teachers: Array.from(teachers).sort(),
      classes: Array.from(classes).sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        return isNaN(numA) || isNaN(numB) ? a.localeCompare(b) : numA - numB;
      }),
      sections: Array.from(sections).sort()
    };
  }, [requests, classFilter]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Category
      if (categoryFilter !== "All" && req.category !== categoryFilter) return false;
      // Teacher
      if (teacherFilter !== "All" && req.requestedByTeacherName !== teacherFilter) return false;
      // Status
      if (statusFilter !== "All" && req.status !== statusFilter) return false;
      // Date
      if (dateFilter && req.dutyDate !== dateFilter) return false;
      // Class/Section
      if (classFilter !== "All" || sectionFilter !== "All") {
        const hasMatchingStudent = req.targetStudents?.some(stu => {
          const level = stu.classLevel || stu.className?.split('-')[0];
          const matchClass = classFilter === "All" || level === classFilter;
          const matchSection = sectionFilter === "All" || stu.section === sectionFilter;
          return matchClass && matchSection;
        });
        if (!hasMatchingStudent) return false;
      }
      return true;
    });
  }, [requests, categoryFilter, teacherFilter, classFilter, sectionFilter, statusFilter, dateFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Completed": return "bg-green-100 text-green-800 border-green-200";
      case "Cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#03045e] tracking-tight">Student Duty Management</h1>
        <p className="text-gray-500 font-medium mt-1">Monitor and review student duty requests across the institution.</p>
      </div>

      <PageAuthorityBanner moduleId="admin_student_duty" moduleName="Student Duty Management" />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4">
          <MainCard className="p-4 flex flex-col justify-center items-center text-center">
            <ClipboardList size={24} className="text-blue-500 mb-2" />
            <p className="text-xs text-gray-500 font-bold uppercase">Total</p>
            <p className="text-2xl font-black text-gray-800">{stats.total}</p>
          </MainCard>
          <MainCard className="p-4 flex flex-col justify-center items-center text-center">
            <Clock size={24} className="text-yellow-500 mb-2" />
            <p className="text-xs text-gray-500 font-bold uppercase">Active</p>
            <p className="text-2xl font-black text-gray-800">{stats.active}</p>
          </MainCard>
          <MainCard className="p-4 flex flex-col justify-center items-center text-center">
            <CheckCircle size={24} className="text-green-500 mb-2" />
            <p className="text-xs text-gray-500 font-bold uppercase">Completed</p>
            <p className="text-2xl font-black text-gray-800">{stats.completed}</p>
          </MainCard>
          <MainCard className="p-4 flex flex-col justify-center items-center text-center">
            <XCircle size={24} className="text-red-500 mb-2" />
            <p className="text-xs text-gray-500 font-bold uppercase">Cancelled</p>
            <p className="text-2xl font-black text-gray-800">{stats.cancelled}</p>
          </MainCard>
          <MainCard className="p-4 flex flex-col justify-center items-center text-center bg-blue-50 border-blue-100">
            <Users size={24} className="text-blue-600 mb-2" />
            <p className="text-xs text-blue-600 font-bold uppercase">Students</p>
            <p className="text-2xl font-black text-blue-900">{stats.studentsAssigned}</p>
          </MainCard>
          <MainCard className="p-4 flex flex-col justify-center items-center text-center bg-purple-50 border-purple-100">
            <UserCog size={24} className="text-purple-600 mb-2" />
            <p className="text-xs text-purple-600 font-bold uppercase">Teachers</p>
            <p className="text-2xl font-black text-purple-900">{stats.teachersRequesting}</p>
          </MainCard>
        </div>
      )}

      {/* Filters Section */}
      <MainCard className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#00b4d8] bg-gray-50"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Teacher</label>
            <select
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#00b4d8] bg-gray-50"
            >
              <option value="All">All Teachers</option>
              {filterOptions.teachers.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Class Level</label>
            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setSectionFilter("All");
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#00b4d8] bg-gray-50"
            >
              <option value="All">All Class Levels</option>
              {filterOptions.classes.map(c => <option key={c} value={c}>Class {c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Section</label>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              disabled={classFilter === "All"}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#00b4d8] bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="All">All Sections</option>
              {filterOptions.sections.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#00b4d8] bg-gray-50"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 outline-none focus:border-[#00b4d8] bg-gray-50"
            />
          </div>
        </div>
      </MainCard>

      {/* Records Table */}
      <MainCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-bold">Duty Title</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Requested By</th>
                <th className="p-4 font-bold">Students Count</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400 font-medium">Loading duty requests...</td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <ClipboardList size={48} className="text-gray-300 mb-4" />
                      <h3 className="text-lg font-bold text-gray-700">No Duty Requests Found</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        No student duty requests match your criteria, or none have been created yet.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-800">{req.title}</td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                        {req.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-600">{req.requestedByTeacherName}</td>
                    <td className="p-4 text-sm font-medium text-gray-600">
                      {req.targetStudents?.length || 0} Students
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-500">{req.dutyDate}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusColor(req.status)}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setIsModalOpen(true);
                        }}
                        className="text-sm font-bold text-[#0077b6] hover:text-[#023e8a] flex items-center justify-end gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors ml-auto"
                      >
                        <Eye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </MainCard>

      {/* Shared Read-Only View Modal */}
      {isModalOpen && selectedRequest && (
        <DutyDetailsModal 
          request={selectedRequest} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}
