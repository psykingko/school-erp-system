import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, Search, Save, RefreshCw
} from "lucide-react";

import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import staffAttendanceService from "../../services/staffAttendanceService";
import employeeService from "../../services/employeeService";
import { getAllTeachers } from "../../services/teacherService";

const StaffAttendanceMgmtPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [staffList, setStaffList] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [attendanceSource, setAttendanceSource] = useState("Manual Entry");
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    loadStaffAndAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const loadStaffAndAttendance = async () => {
    setLoading(true);
    try {
      // Fetch all staff members (Employees + Teachers)
      const [employees, teachers] = await Promise.all([
        employeeService.getEmployees(),
        getAllTeachers()
      ]);

      const formattedEmployees = employees.map(e => ({
        id: e.employeeId || e.id || "Unknown ID",
        name: e.name || e.employeeName || e.fullName || "Admin/Staff",
        type: (e.accessLevel === "Admin" || e.accessLevel === "Super Admin" || e.role === "ADMIN") ? "Admin" : "Staff",
        department: e.department || e.departmentId || "General"
      }));

      const formattedTeachers = teachers.map(t => ({
        id: t.teacherId || t.id || "Unknown ID",
        name: t.name || t.employeeName || t.teacherName || t.fullName || "Teacher",
        type: "Teacher",
        department: t.department || "Academics"
      }));

      // Combine and filter out duplicates by ID
      const combinedStaff = [...formattedEmployees, ...formattedTeachers];
      const uniqueStaff = Array.from(new Map(combinedStaff.map(item => [item.id, item])).values());
      setStaffList(uniqueStaff);

      // Load existing attendance for the date
      const existingRecords = await staffAttendanceService.getAllStaffAttendance();
      const recordsForDate = existingRecords.filter(r => r.attendanceDate === selectedDate);
      
      const attMap = {};
      recordsForDate.forEach(r => {
        attMap[r.employeeId] = r;
      });
      setAttendanceRecords(attMap);
    } catch (e) {
      console.error("Failed to load staff attendance data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (employeeId, status) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        employeeId,
        attendanceDate: selectedDate,
        attendanceStatus: status,
        attendanceSource: attendanceSource === "Biometric Sync (Simulation)" ? "BIOMETRIC" : "MANUAL"
      }
    }));
  };

  const handleBulkUpdate = (status) => {
    const newRecords = { ...attendanceRecords };
    filteredStaff.forEach(staff => {
      newRecords[staff.id] = {
        ...newRecords[staff.id],
        employeeId: staff.id,
        attendanceDate: selectedDate,
        attendanceStatus: status,
        attendanceSource: attendanceSource === "Biometric Sync (Simulation)" ? "BIOMETRIC" : "MANUAL",
        employeeType: staff.type,
        department: staff.department
      };
    });
    setAttendanceRecords(newRecords);
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const recordsToSave = Object.values(attendanceRecords).filter(r => r.attendanceDate === selectedDate && r.attendanceStatus);
      // Ensure all required fields exist
      const enrichedRecords = recordsToSave.map(r => {
        const staffObj = staffList.find(s => s.id === r.employeeId);
        return {
          ...r,
          employeeType: staffObj ? staffObj.type : "STAFF",
          department: staffObj ? staffObj.department : "GENERAL"
        };
      });

      await staffAttendanceService.submitDepartmentAttendance(enrichedRecords);
      alert("Attendance saved successfully!");
      loadStaffAndAttendance(); // Reload
    } catch (e) {
      console.error(e);
      alert("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      const matchesSearch = s.name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDepartment ? s.department === selectedDepartment : true;
      const matchesType = selectedType ? s.type === selectedType : true;
      return matchesSearch && matchesDept && matchesType;
    });
  }, [staffList, searchQuery, selectedDepartment, selectedType]);

  const uniqueDepartments = [...new Set(staffList.map(s => s.department).filter(Boolean))];
  const uniqueTypes = [...new Set(staffList.map(s => s.type).filter(Boolean))];

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-12">
      <AdminPageHeader
        title="Staff Attendance Management"
        description="Daily operational attendance entry for all employees."
        breadcrumbs={["Admin Portal", "Operations", "Staff Attendance"]}
      />

      <AdminSectionCard>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#03045e]/5 rounded-lg">
              <Calendar className="text-[#03045e]" size={20} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">Attendance Register</h3>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Select date and source</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#03045e] outline-none cursor-pointer"
            />
            
            <select 
              value={attendanceSource}
              onChange={(e) => setAttendanceSource(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#03045e] outline-none cursor-pointer"
            >
              <option value="Manual Entry">Manual Entry</option>
              <option value="Biometric Sync (Simulation)">Biometric Sync (Simulation)</option>
            </select>

            <button
              onClick={saveAttendance}
              disabled={saving || Object.keys(attendanceRecords).length === 0}
              className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#0096c7] disabled:bg-gray-300 text-white px-4 py-2 rounded-xl shadow-sm text-xs font-black transition-colors"
            >
              {saving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
              <span>Save Register</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] transition-colors"
            />
          </div>
          
          <select 
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] transition-colors"
          >
            <option value="">All Departments</option>
            {uniqueDepartments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-[#03045e] outline-none focus:border-[#0077b6] transition-colors"
          >
            <option value="">All Types</option>
            {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          {/* Bulk Actions */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
            <span className="text-[10px] font-bold text-gray-400 uppercase mr-1 whitespace-nowrap">Bulk:</span>
            <button onClick={() => handleBulkUpdate("PRESENT")} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-black uppercase hover:bg-emerald-200">Present</button>
            <button onClick={() => handleBulkUpdate("ABSENT")} className="px-2 py-1 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-black uppercase hover:bg-rose-200">Absent</button>
            <button onClick={() => handleBulkUpdate("ON_LEAVE")} className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase hover:bg-amber-200">Leave</button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <RefreshCw className="animate-spin text-[#0077b6]" size={24} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#caf0f8]/20 border-y border-[#caf0f8]/40">
                <tr>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest w-20">Emp ID</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Name</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Role (Admin/Teacher)</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Department</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                  <th className="px-4 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-400 text-xs font-medium">No staff members found.</td>
                  </tr>
                ) : (
                  filteredStaff.map((staff) => {
                    const record = attendanceRecords[staff.id];
                    const status = record?.attendanceStatus || "";
                    const source = record?.attendanceSource || "";
                    
                    return (
                      <tr key={staff.id} className="hover:bg-gray-50 transition-colors text-xs text-gray-700 font-bold">
                        <td className="px-4 py-3 text-gray-500">{staff.id}</td>
                        <td className="px-4 py-3 text-[#03045e] font-black">{staff.name}</td>
                        <td className="px-4 py-3">{staff.type}</td>
                        <td className="px-4 py-3">{staff.department}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {["PRESENT", "ABSENT", "LATE", "HALF_DAY", "ON_LEAVE"].map((s) => (
                              <button
                                key={s}
                                onClick={() => handleStatusChange(staff.id, s)}
                                className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${
                                  status === s 
                                    ? s === "PRESENT" ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                                    : s === "ABSENT" ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                                    : s === "LATE" ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                                    : s === "HALF_DAY" ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                                    : "bg-amber-500 text-white shadow-md shadow-amber-500/20" // ON_LEAVE
                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                }`}
                              >
                                {s.replace("_", " ")}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {source ? (
                            <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-lg">
                              {source === "BIOMETRIC" ? "Biometric" : "Manual"}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-300">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </AdminSectionCard>
    </motion.div>
  );
};

export default StaffAttendanceMgmtPage;
