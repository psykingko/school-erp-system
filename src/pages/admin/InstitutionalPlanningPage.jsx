import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Users, School, Layers, AlertCircle, X, CheckCircle2, Briefcase, FileWarning, SearchX, CheckCircle, Component, TrendingUp, AlertTriangle, Activity, Edit2, ArrowRight } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import OperationsStatCard from "../../components/admin/operations/OperationsStatCard";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import AdminDataTable from "../../components/admin/AdminDataTable";
import { getDataProvider } from "../../data";
import { 
  getStudentCapacityMetrics, 
  getClassCapacityMetrics,
  getTeacherCoverageMetrics,
  getCoverageLedger
} from "../../services/studentService";
import employeeService, { getDepartmentCapacityMetrics } from "../../services/employeeService";

const InstitutionalPlanningPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("capacity");
  const [loading, setLoading] = useState(true);

  // Capacity State
  const [capacityMetrics, setCapacityMetrics] = useState({ totalCapacity: 0, totalEnrolled: 0, availableSeats: 0, occupancyPercentage: 0 });
  const [classesData, setClassesData] = useState([]);
  
  // Coverage State
  const [coverageMetrics, setCoverageMetrics] = useState({ totalExpectedAssignments: 0, coveredAssignments: 0, coverageGaps: 0, assignedTeachers: 0 });
  const [coverageLedger, setCoverageLedger] = useState([]);
  const [coverageSummary, setCoverageSummary] = useState({ fullyCovered: 0, missingTeachers: 0, impactedClasses: new Set(), impactedDepartments: new Set() });

  // Drawer states
  const [departmentData, setDepartmentData] = useState([]);
  const [staffMetrics, setStaffMetrics] = useState({ totalRequired: 0, totalCurrent: 0, totalVacant: 0, averageOccupancy: 0 });
  const [staffSummary, setStaffSummary] = useState({ mostUnderstaffed: [], mostStaffed: [], withVacancies: 0, atCapacity: 0 });

  // Drawer states
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [drawerData, setDrawerData] = useState(null);
  const [drawerStudents, setDrawerStudents] = useState([]);
  const [selectedCoverageRow, setSelectedCoverageRow] = useState(null);
  const [selectedDepartmentRow, setSelectedDepartmentRow] = useState(null);
  const [departmentEmployees, setDepartmentEmployees] = useState([]);
  
  // Edit Capacity State
  const [editingCapacity, setEditingCapacity] = useState(false);
  const [newCapacityValue, setNewCapacityValue] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const overallCapacity = await getStudentCapacityMetrics();
      setCapacityMetrics(overallCapacity);

      const provider = getDataProvider();
      const allClasses = await provider.getClasses();
      const classMetricsPromises = allClasses.map(async (cls) => {
        const cMetrics = await getClassCapacityMetrics(cls.id || cls.classId);
        return { ...cls, capacity: cMetrics.capacity, enrolled: cMetrics.enrolled, vacant: cMetrics.vacant, occupancyPercentage: cMetrics.occupancyPercentage };
      });
      const resolvedClasses = await Promise.all(classMetricsPromises);
      setClassesData(resolvedClasses);

      const overallCoverage = await getTeacherCoverageMetrics();
      setCoverageMetrics(overallCoverage);

      const ledger = await getCoverageLedger();
      setCoverageLedger(ledger);

      const impactedClasses = new Set();
      const impactedDepartments = new Set();
      let missingCount = 0; let coveredCount = 0;
      ledger.forEach(row => {
        if (row.status === "Coverage Gap") {
          missingCount++; impactedClasses.add(row.className); impactedDepartments.add("General"); 
        } else coveredCount++;
      });
      setCoverageSummary({ fullyCovered: coveredCount, missingTeachers: missingCount, impactedClasses, impactedDepartments });

      const deptMetrics = await getDepartmentCapacityMetrics();
      setDepartmentData(deptMetrics);

      let reqStaff = 0; let curStaff = 0; let vacStaff = 0; let totalOcc = 0; let withVac = 0; let atCap = 0;
      const sortedByVacancies = [...deptMetrics].sort((a, b) => b.vacantPositions - a.vacantPositions);
      const sortedByOccupancy = [...deptMetrics].sort((a, b) => b.occupancyPercent - a.occupancyPercent);

      deptMetrics.forEach(d => {
        reqStaff += d.requiredStaff; curStaff += d.currentStaff; vacStaff += d.vacantPositions; totalOcc += d.occupancyPercent;
        if (d.vacantPositions > 0) withVac++;
        if (d.occupancyPercent >= 100) atCap++;
      });

      setStaffMetrics({ totalRequired: reqStaff, totalCurrent: curStaff, totalVacant: vacStaff, averageOccupancy: deptMetrics.length > 0 ? Math.round(totalOcc / deptMetrics.length) : 0 });
      setStaffSummary({ mostUnderstaffed: sortedByVacancies.slice(0, 3).filter(d => d.vacantPositions > 0), mostStaffed: sortedByOccupancy.slice(0, 3).filter(d => d.occupancyPercent >= 100), withVacancies: withVac, atCapacity: atCap });

    } catch (error) {
      console.error("Failed to load planning metrics", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCapacityRowClick = async (cls) => {
    setSelectedClassId(cls.id || cls.classId);
    setDrawerData(cls);
    const provider = getDataProvider();
    const students = await provider.getStudents();
    setDrawerStudents(students.filter(s => s.classId === (cls.id || cls.classId) || s.className === (cls.id || cls.classId)));
  };

  const handleCoverageRowClick = (row) => setSelectedCoverageRow(row);
  const handleDepartmentRowClick = async (row) => {
    setSelectedDepartmentRow(row);
    const allEmps = await employeeService.getEmployees();
    setDepartmentEmployees(allEmps.filter(e => e.departmentId === row.departmentId));
  };

  const closeDrawer = () => {
    setSelectedClassId(null); setDrawerData(null); setDrawerStudents([]);
    setSelectedCoverageRow(null); setSelectedDepartmentRow(null); setDepartmentEmployees([]);
    setEditingCapacity(false);
  };

  const handleNavigateToClasses = (className) => {
    if (!className) {
      navigate("/admin/classes");
      return;
    }
    const parts = className.split("-");
    let level = parts[0];
    if (level === "XI") level = "11";
    if (level === "XII") level = "12";
    const section = parts[1] || "";
    navigate("/admin/classes", { state: { selectedClassLevel: level, selectedSection: section } });
  };

  const handleSaveCapacity = async () => {
    try {
      const capVal = parseInt(newCapacityValue, 10);
      if (isNaN(capVal) || capVal <= 0) return;
      const provider = getDataProvider();
      await provider.updateClass(selectedClassId, { capacity: capVal });
      setEditingCapacity(false);
      setDrawerData(prev => ({ ...prev, capacity: capVal }));
      fetchData();
    } catch (err) {
      console.error("Failed to update capacity", err);
    }
  };

  const getCapacityStatusConfig = (occupancy) => {
    if (occupancy >= 90) return { label: "Critical", colorClass: "bg-red-50 text-red-600 border-red-100" };
    if (occupancy >= 75) return { label: "Moderate", colorClass: "bg-yellow-50 text-yellow-600 border-yellow-100" };
    return { label: "Healthy", colorClass: "bg-green-50 text-green-600 border-green-100" };
  };

  const getCoverageStatusConfig = (status) => {
    if (status === "Coverage Gap") return { label: "Coverage Gap", colorClass: "bg-red-50 text-red-600 border-red-100" };
    return { label: "Covered", colorClass: "bg-green-50 text-green-600 border-green-100" };
  };

  const getDepartmentStatusConfig = (occupancy) => {
    if (occupancy >= 100) return { label: "Fully Staffed", colorClass: "bg-green-50 text-green-600 border-green-100" };
    if (occupancy >= 75) return { label: "Near Capacity", colorClass: "bg-yellow-50 text-yellow-600 border-yellow-100" };
    return { label: "Understaffed", colorClass: "bg-red-50 text-red-600 border-red-100" };
  };

  // Institutional Readiness and Risk Register Computations
  let readiness = { status: "Green", label: "Healthy Readiness", message: "No major capacity or staffing concerns detected." };
  const criticalClasses = classesData.filter(c => c.occupancyPercentage >= 95);
  const moderateClasses = classesData.filter(c => c.occupancyPercentage >= 85 && c.occupancyPercentage < 95);
  
  if (criticalClasses.length > 2 || coverageMetrics.coverageGaps > 3 || staffMetrics.totalVacant > 5) {
    readiness = { status: "Red", label: "Critical Planning Risks", message: "Significant capacity overload or staffing shortages require immediate attention." };
  } else if (moderateClasses.length > 0 || coverageMetrics.coverageGaps > 0 || staffMetrics.totalVacant > 0) {
    readiness = { status: "Yellow", label: "Moderate Concerns", message: "Emerging capacity or staffing gaps detected. Review required." };
  }

  const riskRegister = [
    ...criticalClasses.map(c => ({ issue: `${c.name || c.classId} is at critical capacity (${c.occupancyPercentage}%)`, type: "capacity" })),
    ...moderateClasses.map(c => ({ issue: `${c.name || c.classId} nearing capacity (${c.occupancyPercentage}%)`, type: "capacity" })),
    ...coverageLedger.filter(v => v.status === "Coverage Gap").map(v => ({ issue: `${v.subjectName} coverage gap in ${v.className}`, type: "coverage" })),
    ...staffSummary.mostUnderstaffed.map(d => ({ issue: `${d.departmentName} department understaffed (${d.vacantPositions} vacant)`, type: "staff" }))
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6 pb-12">
      <AdminPageHeader
        title="Institutional Planning"
        description="Official hub for capacity planning, teacher coverage, and department staffing readiness."
        breadcrumbs={["Admin Portal", "Institutional", "Institutional Planning"]}
      />

      {/* Executive Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <OperationsStatCard title="Available Seats" value={capacityMetrics.availableSeats} description="Total student vacancies" icon={Layers} color="#03045e" bg="#e0f2fe" />
        <OperationsStatCard title="Teacher Coverage %" value={`${coverageMetrics.totalExpectedAssignments > 0 ? Math.round((coverageMetrics.coveredAssignments / coverageMetrics.totalExpectedAssignments) * 100) : 0}%`} description="Assigned subjects" icon={CheckCircle2} color="#028090" bg="#e0fbfc" />
        <OperationsStatCard title="Coverage Gaps" value={coverageMetrics.coverageGaps} description="Unassigned subjects" icon={FileWarning} color={coverageMetrics.coverageGaps > 0 ? "#e63946" : "#028090"} bg={coverageMetrics.coverageGaps > 0 ? "#ffe3e0" : "#e0fbfc"} />
        <OperationsStatCard title="Staff Vacancies" value={staffMetrics.totalVacant} description="Missing department staff" icon={SearchX} color={staffMetrics.totalVacant > 0 ? "#e63946" : "#028090"} bg={staffMetrics.totalVacant > 0 ? "#ffe3e0" : "#e0fbfc"} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto whitespace-nowrap mt-4">
        <button onClick={() => setActiveTab("capacity")} className={`px-6 py-3 font-bold text-sm transition-colors relative ${activeTab === "capacity" ? "text-[#03045e]" : "text-gray-500 hover:text-gray-700"}`}>
          Student Capacity
          {activeTab === "capacity" && <motion.div layoutId="planningTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#03045e]" />}
        </button>
        <button onClick={() => setActiveTab("coverage")} className={`px-6 py-3 font-bold text-sm transition-colors relative ${activeTab === "coverage" ? "text-[#03045e]" : "text-gray-500 hover:text-gray-700"}`}>
          Teacher Coverage
          {activeTab === "coverage" && <motion.div layoutId="planningTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#03045e]" />}
        </button>
        <button onClick={() => setActiveTab("staff")} className={`px-6 py-3 font-bold text-sm transition-colors relative ${activeTab === "staff" ? "text-[#03045e]" : "text-gray-500 hover:text-gray-700"}`}>
          Department Capacity
          {activeTab === "staff" && <motion.div layoutId="planningTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#03045e]" />}
        </button>
      </div>

      {/* Existing Tabs Code Below */}
      {activeTab === "capacity" && (
        <motion.div key="capacity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 mt-6">
          <AdminSectionCard title="Class Capacity Ledger">
            <AdminDataTable
              headers={["Class", "Section", "Capacity", "Enrolled", "Vacant", "Occupancy %", "Status"]}
              items={classesData} isEmpty={classesData.length === 0 && !loading}
              renderRow={(cls) => {
                const status = getCapacityStatusConfig(cls.occupancyPercentage);
                return (
                  <tr key={cls.id || cls.classId} onClick={() => handleCapacityRowClick(cls)} className="hover:bg-[#caf0f8]/10 transition-colors cursor-pointer text-xs text-gray-700 font-bold border-b border-[#caf0f8]/40">
                    <td className="py-4 px-3 text-[#03045e] font-black first:pl-2">{cls.name || cls.classId}</td>
                    <td className="py-4 px-3 text-gray-800 font-extrabold">{cls.section || "N/A"}</td>
                    <td className="py-4 px-3 text-gray-500 font-semibold">{cls.capacity}</td>
                    <td className="py-4 px-3 text-[#0077b6] font-extrabold">{cls.enrolled}</td>
                    <td className="py-4 px-3 text-gray-600 font-semibold">{cls.vacant}</td>
                    <td className="py-4 px-3 text-gray-800 font-bold">{cls.occupancyPercentage}%</td>
                    <td className="py-4 px-3 last:pr-2"><span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${status.colorClass}`}>{status.label}</span></td>
                  </tr>
                );
              }}
            />
          </AdminSectionCard>
        </motion.div>
      )}

      {activeTab === "coverage" && (
        <motion.div key="coverage" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 mt-6">
          <AdminSectionCard title="Coverage Summary">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Subject Coverage</h4>
                <div className="flex gap-6">
                  <div><span className="block text-2xl font-black text-green-600">{coverageSummary.fullyCovered}</span><span className="text-xs font-bold text-gray-400">Fully Covered</span></div>
                  <div><span className="block text-2xl font-black text-red-600">{coverageSummary.missingTeachers}</span><span className="text-xs font-bold text-gray-400">Missing Teachers</span></div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Impacted Areas</h4>
                <div className="flex gap-6">
                  <div><span className="block text-xl font-black text-gray-800">{coverageSummary.impactedClasses.size}</span><span className="text-xs font-bold text-gray-400">Classes Impacted</span></div>
                  <div><span className="block text-xl font-black text-gray-800">{coverageSummary.impactedDepartments.size}</span><span className="text-xs font-bold text-gray-400">Departments Impacted</span></div>
                </div>
              </div>
            </div>
          </AdminSectionCard>
          <AdminSectionCard title="Coverage Ledger">
            <AdminDataTable
              headers={["Class", "Section", "Subject", "Assigned Teacher", "Department", "Status"]}
              items={coverageLedger} isEmpty={coverageLedger.length === 0 && !loading}
              renderRow={(row, idx) => {
                const status = getCoverageStatusConfig(row.status);
                return (
                  <tr key={idx} onClick={() => handleCoverageRowClick(row)} className="hover:bg-[#caf0f8]/10 transition-colors cursor-pointer text-xs text-gray-700 font-bold border-b border-[#caf0f8]/40">
                    <td className="py-4 px-3 text-[#03045e] font-black first:pl-2">{row.className}</td>
                    <td className="py-4 px-3 text-gray-800 font-extrabold">{row.section || "N/A"}</td>
                    <td className="py-4 px-3 text-gray-500 font-semibold">{row.subjectName}</td>
                    <td className={`py-4 px-3 font-extrabold ${row.teacherId ? "text-[#0077b6]" : "text-gray-400 italic"}`}>{row.teacherName}</td>
                    <td className="py-4 px-3 text-gray-600 font-semibold">{row.department}</td>
                    <td className="py-4 px-3 last:pr-2"><span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${status.colorClass}`}>{status.label}</span></td>
                  </tr>
                );
              }}
            />
          </AdminSectionCard>
        </motion.div>
      )}

      {activeTab === "staff" && (
        <motion.div key="staff" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 mt-6">
          <AdminSectionCard title="Department Readiness Summary">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Understaffed Departments</h4>
                <div className="space-y-2">
                  {staffSummary.mostUnderstaffed.length > 0 ? staffSummary.mostUnderstaffed.map(d => (
                    <div key={d.departmentId} className="flex justify-between items-center"><span className="text-xs font-bold text-gray-700">{d.departmentName}</span><span className="text-xs font-black text-[#e63946]">{d.vacantPositions} Vacancies</span></div>
                  )) : <div className="text-xs font-bold text-gray-400">All departments fully staffed</div>}
                </div>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-wider mb-3">Fully Staffed Departments</h4>
                <div className="space-y-2">
                  {staffSummary.mostStaffed.length > 0 ? staffSummary.mostStaffed.map(d => (
                    <div key={d.departmentId} className="flex justify-between items-center"><span className="text-xs font-bold text-gray-700">{d.departmentName}</span><span className="text-xs font-black text-green-600">Full</span></div>
                  )) : <div className="text-xs font-bold text-gray-400">No fully staffed departments</div>}
                </div>
              </div>
            </div>
          </AdminSectionCard>
          <AdminSectionCard title="Department Capacity Ledger">
            <AdminDataTable
              headers={["Department", "Required", "Current", "Vacant", "Occupancy %", "Status"]}
              items={departmentData} isEmpty={departmentData.length === 0 && !loading}
              renderRow={(row, idx) => {
                const status = getDepartmentStatusConfig(row.occupancyPercent);
                return (
                  <tr key={idx} onClick={() => handleDepartmentRowClick(row)} className="hover:bg-[#caf0f8]/10 transition-colors cursor-pointer text-xs text-gray-700 font-bold border-b border-[#caf0f8]/40">
                    <td className="py-4 px-3 text-[#03045e] font-black first:pl-2">{row.departmentName}</td>
                    <td className="py-4 px-3 text-gray-500 font-semibold">{row.requiredStaff}</td>
                    <td className="py-4 px-3 text-[#0077b6] font-extrabold">{row.currentStaff}</td>
                    <td className="py-4 px-3 font-extrabold text-gray-700">{row.vacantPositions}</td>
                    <td className="py-4 px-3 font-extrabold text-gray-800">{row.occupancyPercent}%</td>
                    <td className="py-4 px-3 last:pr-2"><span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${status.colorClass}`}>{status.label}</span></td>
                  </tr>
                );
              }}
            />
          </AdminSectionCard>
        </motion.div>
      )}

      {/* Drawers */}
      <AnimatePresence>
        {(selectedClassId || selectedCoverageRow || selectedDepartmentRow) && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 bg-black/40 z-40" onClick={closeDrawer} />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-lg font-black text-[#03045e]">
                  {selectedClassId && "Class Capacity Detail"}
                  {selectedCoverageRow && "Coverage Detail"}
                  {selectedDepartmentRow && "Department Detail"}
                </h3>
                <button onClick={closeDrawer} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-500 hover:text-[#e63946] hover:bg-rose-50 transition-colors shadow-sm border border-gray-100"><X size={16} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {selectedClassId && drawerData && (
                  <>
                    <div className="bg-[#caf0f8]/20 rounded-2xl p-4 border border-[#caf0f8]/50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-black text-[#03045e]">Class Summary</h4>
                        {!editingCapacity && (
                          <button onClick={() => { setEditingCapacity(true); setNewCapacityValue(drawerData.capacity); }} className="text-[10px] uppercase tracking-wider font-black text-[#0077b6] hover:text-[#023e8a] bg-blue-50 px-2 py-1 rounded border border-blue-100 flex items-center gap-1 transition-colors">
                            <Edit2 size={10} /> Edit Capacity
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div><span className="block text-gray-500 font-semibold mb-1">Class</span><span className="font-bold text-gray-800">{drawerData.name || drawerData.classId}</span></div>
                        <div><span className="block text-gray-500 font-semibold mb-1">Section</span><span className="font-bold text-gray-800">{drawerData.section || "N/A"}</span></div>
                        
                        {editingCapacity ? (
                          <div className="col-span-2 mt-2 bg-white p-3 rounded-xl border border-blue-200 shadow-sm flex items-end gap-3">
                            <div className="flex-1">
                              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">New Capacity Limit</label>
                              <input 
                                type="number" 
                                value={newCapacityValue} 
                                onChange={(e) => setNewCapacityValue(e.target.value)}
                                className="w-full text-sm font-bold text-gray-800 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0077b6] focus:ring-1 focus:ring-[#0077b6]"
                                min="1"
                                autoFocus
                              />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setEditingCapacity(false)} className="px-3 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">Cancel</button>
                              <button onClick={handleSaveCapacity} className="px-3 py-2 text-xs font-bold bg-[#0077b6] hover:bg-[#023e8a] text-white rounded-lg transition-colors shadow-sm">Save</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div><span className="block text-gray-500 font-semibold mb-1">Capacity</span><span className="font-bold text-gray-800">{drawerData.capacity}</span></div>
                            <div><span className="block text-gray-500 font-semibold mb-1">Enrolled</span><span className="font-bold text-[#0077b6]">{drawerData.enrolled}</span></div>
                            <div><span className="block text-gray-500 font-semibold mb-1">Vacant</span><span className="font-bold text-gray-800">{drawerData.vacant}</span></div>
                          </>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-[#03045e] mb-3">Student Roster</h4>
                      {drawerStudents.length > 0 ? (
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                          <table className="w-full text-left">
                            <thead className="bg-gray-50/80 text-[10px] uppercase font-black text-gray-400">
                              <tr><th className="px-4 py-2">Student ID</th><th className="px-4 py-2">Name</th><th className="px-4 py-2">Status</th></tr>
                            </thead>
                            <tbody className="text-xs font-bold text-gray-700">
                              {drawerStudents.map(student => (
                                <tr key={student.id || student.studentId} className="border-t border-gray-50">
                                  <td className="px-4 py-3 font-black text-[#03045e]">{student.studentId}</td>
                                  <td className="px-4 py-3">{student.name}</td>
                                  <td className="px-4 py-3 text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12} /> Active</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : <div className="text-center py-6 text-gray-400 text-xs font-bold">No students enrolled.</div>}
                    </div>
                  </>
                )}
                {selectedCoverageRow && (
                  <div className="space-y-6">
                    <div className="bg-[#caf0f8]/20 rounded-2xl p-4 border border-[#caf0f8]/50">
                      <h4 className="text-sm font-black text-[#03045e] mb-3">Coverage Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div><span className="block text-gray-500 font-semibold mb-1">Class</span><span className="font-bold text-gray-800">{selectedCoverageRow.className}</span></div>
                        <div><span className="block text-gray-500 font-semibold mb-1">Subject</span><span className="font-bold text-gray-800">{selectedCoverageRow.subjectName}</span></div>
                        <div><span className="block text-gray-500 font-semibold mb-1">Assigned Teacher</span><span className="font-bold text-[#0077b6]">{selectedCoverageRow.teacherName}</span></div>
                      </div>
                    </div>
                    {selectedCoverageRow.status === "Coverage Gap" && (
                      <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col gap-4">
                        <div className="flex gap-3">
                          <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                          <div>
                            <h4 className="text-red-800 font-black text-sm mb-1">Coverage Gap Identified</h4>
                            <p className="text-red-600 text-xs font-bold">No teacher assigned. Planning processes required.</p>
                          </div>
                        </div>
                        <button onClick={() => handleNavigateToClasses(selectedCoverageRow.className)} className="w-full py-2.5 bg-white hover:bg-gray-50 text-red-700 font-black text-[10px] uppercase tracking-widest rounded-lg transition-colors border border-red-200 shadow-sm flex items-center justify-center gap-2">
                          Resolve Assignment <ArrowRight size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {selectedDepartmentRow && (
                  <div className="space-y-6">
                    <div className="bg-[#caf0f8]/20 rounded-2xl p-4 border border-[#caf0f8]/50">
                      <h4 className="text-sm font-black text-[#03045e] mb-3">Department Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div><span className="block text-gray-500 font-semibold mb-1">Department</span><span className="font-bold text-gray-800">{selectedDepartmentRow.departmentName}</span></div>
                        <div><span className="block text-gray-500 font-semibold mb-1">Required</span><span className="font-bold text-gray-800">{selectedDepartmentRow.requiredStaff}</span></div>
                        <div><span className="block text-gray-500 font-semibold mb-1">Current</span><span className="font-bold text-[#0077b6]">{selectedDepartmentRow.currentStaff}</span></div>
                        <div><span className="block text-gray-500 font-semibold mb-1">Vacant</span><span className="font-bold text-gray-800">{selectedDepartmentRow.vacantPositions}</span></div>
                      </div>
                    </div>
                    <button onClick={() => navigate("/admin/manage-departments")} className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-[#03045e] border border-gray-200 font-black text-[10px] uppercase tracking-widest rounded-xl transition-colors flex items-center justify-center gap-2">
                      Open Department Settings <ArrowRight size={14} />
                    </button>
                    <div>
                      <h4 className="text-sm font-black text-[#03045e] mb-3">Employee Roster</h4>
                      {departmentEmployees.length > 0 ? (
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                          <table className="w-full text-left">
                            <thead className="bg-gray-50/80 text-[10px] uppercase font-black text-gray-400">
                              <tr><th className="px-4 py-2">ID</th><th className="px-4 py-2">Name</th></tr>
                            </thead>
                            <tbody className="text-xs font-bold text-gray-700">
                              {departmentEmployees.map(emp => (
                                <tr key={emp.employeeId} className="border-t border-gray-50">
                                  <td className="px-4 py-3 font-black text-[#03045e]">{emp.employeeId}</td>
                                  <td className="px-4 py-3">{emp.employeeName}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : <div className="text-center py-6 text-gray-400 text-xs font-bold">No employees assigned.</div>}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InstitutionalPlanningPage;
