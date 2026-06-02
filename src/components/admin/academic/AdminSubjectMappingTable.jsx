import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Edit3,
  UserCheck,
  ArrowRightLeft,
  Plus,
  AlertCircle,
  Clock,
  Check,
  X,
} from "lucide-react";
import AdminSectionCard from "../AdminSectionCard";
import {
  getTeacherSubjectAssignments,
  getEligibleTeachersForSubject,
  changeSubjectTeacher,
  createTeacherSubjectAssignment,
  deleteTeacherSubjectAssignment,
  updateAssignmentPeriodsAndRoom,
  getTeacherCapacity,
} from "../../../services/teacherService";

const AdminSubjectMappingTable = ({ selectedClass, subjects, teachers, refreshData }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Fetch assignments when class changes ───────────────────────────────────
  useEffect(() => {
    if (!selectedClass) {
      setAssignments([]);
      return;
    }
    const loadAssignments = async () => {
      setLoading(true);
      try {
        const data = await getTeacherSubjectAssignments(selectedClass.id);
        setAssignments(data || []);
      } catch (e) {
        console.error("Failed to load assignments", e);
      } finally {
        setLoading(false);
      }
    };
    loadAssignments();
  }, [selectedClass]);

  // ── Modal State ────────────────────────────────────────────────────────────
  const [changeTeacherModalOpen, setChangeTeacherModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [eligibleTeachers, setEligibleTeachers] = useState([]);
  const [selectedNewTeacherId, setSelectedNewTeacherId] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");
  const [workloadWarning, setWorkloadWarning] = useState(null);
  const [allowOverload, setAllowOverload] = useState(false);

  // ── Add Subject Modal State ────────────────────────────────────────────────
  const [addSubjectModalOpen, setAddSubjectModalOpen] = useState(false);
  const [newSubjectData, setNewSubjectData] = useState({
    subjectId: "",
    teacherId: "",
    periodsPerWeek: 6,
    room: "",
  });
  const [availableSubjectsForClass, setAvailableSubjectsForClass] = useState([]);
  const [eligibleTeachersForSubject, setEligibleTeachersForSubject] = useState([]);
  const [addModalLoading, setAddModalLoading] = useState(false);
  const [addModalError, setAddModalError] = useState("");
  const [addModalSuccess, setAddModalSuccess] = useState("");

  // ── Delete Confirmation State ──────────────────────────────────────────────
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ── Inline Edit State ───────────────────────────────────────────────────────
  const [editingCell, setEditingCell] = useState(null); // { assignmentId, field }
  const [editValue, setEditValue] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // ── Workload Preview State ──────────────────────────────────────────────────
  const [teacherWorkload, setTeacherWorkload] = useState(null);
  const [workloadLoading, setWorkloadLoading] = useState(false);

  // ── Build subject mapping table ────────────────────────────────────────────
  const subjectMappings = useMemo(() => {
    if (!selectedClass || !assignments.length) return [];

    return assignments
      .map((assignment) => {
        const subject = subjects.find((s) => s.id === assignment.subjectId);
        const teacher = teachers.find((t) => t.id === assignment.teacherId);
        if (!subject || !teacher) return null;

        return {
          assignmentId: assignment.id || `${assignment.classId}-${assignment.subjectId}`,
          subjectId: subject.id,
          subjectName: subject.name || subject.subjectName,
          subjectCode: subject.code,
          subjectType: subject.subjectType || subject.category,
          teacherId: teacher.id,
          teacherName: teacher.teacherName || teacher.metadata?.name || teacher.name,
          teacherDesignation: teacher.designation || teacher.metadata?.designation,
          isClassTeacher: teacher.id === selectedClass.classTeacherId,
          periodsPerWeek: assignment.periodsPerWeek || 6,
          room: assignment.room || null,
        };
      })
      .filter(Boolean);
  }, [assignments, subjects, teachers, selectedClass]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const openChangeTeacherModal = async (mapping) => {
    setSelectedAssignment(mapping);
    setChangeTeacherModalOpen(true);
    setModalLoading(true);
    setModalError("");
    setModalSuccess("");
    setSelectedNewTeacherId("");

    try {
      const eligible = await getEligibleTeachersForSubject(mapping.subjectId, selectedClass?.id);
      const filtered = eligible.filter((t) => t.id !== mapping.teacherId);
      setEligibleTeachers(filtered);
    } catch (e) {
      setModalError("Failed to load eligible teachers.");
    } finally {
      setModalLoading(false);
    }
  };

  const closeChangeTeacherModal = () => {
    setChangeTeacherModalOpen(false);
    setSelectedAssignment(null);
    setEligibleTeachers([]);
    setSelectedNewTeacherId("");
    setModalError("");
    setModalSuccess("");
    setWorkloadWarning(null);
    setAllowOverload(false);
  };

  const handleConfirmChangeTeacher = async () => {
    if (!selectedAssignment || !selectedNewTeacherId) return;

    setModalLoading(true);
    setModalError("");
    setModalSuccess("");
    setWorkloadWarning(null);

    try {
      const result = await changeSubjectTeacher(
        selectedAssignment.assignmentId,
        selectedNewTeacherId,
        { allowOverload, reason: "Administrative reassignment" },
      );

      if (result.success) {
        const workloadMsg = result.workloadImpact?.newTeacher?.isOverloaded
          ? ` (${result.workloadImpact.newTeacher.newLoad} periods — overloaded)`
          : ` (${result.workloadImpact?.newTeacher?.newLoad} periods)`;
        setModalSuccess(`Subject teacher changed.${workloadMsg}`);
        
        const data = await getTeacherSubjectAssignments(selectedClass.id);
        setAssignments(data || []);
        if (refreshData) await refreshData();
        
        setTimeout(() => closeChangeTeacherModal(), 1500);
      } else {
        if (result.workloadImpact?.isOverloaded) {
          setWorkloadWarning(result.workloadImpact);
        }
        setModalError(result.error || "Failed to change teacher.");
      }
    } catch (e) {
      setModalError(e.message || "An unexpected error occurred.");
    } finally {
      setModalLoading(false);
    }
  };

  const openAddSubjectModal = () => {
    if (!selectedClass) return;
    setAddSubjectModalOpen(true);
    setAddModalError("");
    setAddModalSuccess("");
    setNewSubjectData({
      subjectId: "",
      teacherId: "",
      periodsPerWeek: 6,
      room: selectedClass.room || "",
    });

    const assignedSubjectIds = new Set(assignments.map((a) => a.subjectId));
    const available = subjects.filter((s) => !assignedSubjectIds.has(s.id));
    setAvailableSubjectsForClass(available);
    setEligibleTeachersForSubject([]);
  };

  const closeAddSubjectModal = () => {
    setAddSubjectModalOpen(false);
    setNewSubjectData({ subjectId: "", teacherId: "", periodsPerWeek: 6, room: "" });
    setAvailableSubjectsForClass([]);
    setEligibleTeachersForSubject([]);
    setAddModalError("");
    setAddModalSuccess("");
    setTeacherWorkload(null);
  };

  const handleSubjectSelection = async (subjectId) => {
    setNewSubjectData((prev) => ({ ...prev, subjectId, teacherId: "" }));
    setTeacherWorkload(null);
    if (!subjectId) {
      setEligibleTeachersForSubject([]);
      return;
    }
    try {
      const eligible = await getEligibleTeachersForSubject(subjectId, selectedClass?.id);
      setEligibleTeachersForSubject(eligible);
    } catch (e) {
      console.error("Failed to load eligible teachers", e);
    }
  };

  const handleTeacherSelection = async (teacherId) => {
    setNewSubjectData((prev) => ({ ...prev, teacherId }));
    if (!teacherId) {
      setTeacherWorkload(null);
      return;
    }

    setWorkloadLoading(true);
    try {
      const workload = await getTeacherCapacity(teacherId, {
        additionalPeriods: newSubjectData.periodsPerWeek || 6,
      });
      setTeacherWorkload(workload);
    } catch (e) {
      console.error("Failed to load teacher workload", e);
    } finally {
      setWorkloadLoading(false);
    }
  };

  const handleConfirmAddSubject = async () => {
    if (!selectedClass || !newSubjectData.subjectId || !newSubjectData.teacherId) {
      setAddModalError("Please select both subject and teacher.");
      return;
    }

    setAddModalLoading(true);
    setAddModalError("");
    setAddModalSuccess("");

    try {
      const result = await createTeacherSubjectAssignment({
        classId: selectedClass.id,
        subjectId: newSubjectData.subjectId,
        teacherId: newSubjectData.teacherId,
        periodsPerWeek: newSubjectData.periodsPerWeek,
        room: newSubjectData.room,
      });

      if (result.success) {
        setAddModalSuccess("Subject added successfully.");
        const data = await getTeacherSubjectAssignments(selectedClass.id);
        setAssignments(data || []);
        if (refreshData) await refreshData();
        setTimeout(() => closeAddSubjectModal(), 1200);
      } else {
        setAddModalError(result.error || "Failed to add subject.");
      }
    } catch (e) {
      setAddModalError(e.message || "An unexpected error occurred.");
    } finally {
      setAddModalLoading(false);
    }
  };

  const openDeleteConfirm = (mapping) => {
    setAssignmentToDelete(mapping);
    setDeleteConfirmOpen(true);
    setDeleteError("");
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setAssignmentToDelete(null);
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    if (!assignmentToDelete) return;
    setDeleteLoading(true);
    setDeleteError("");

    try {
      const result = await deleteTeacherSubjectAssignment(assignmentToDelete.assignmentId);
      if (result.success) {
        const data = await getTeacherSubjectAssignments(selectedClass.id);
        setAssignments(data || []);
        if (refreshData) await refreshData();
        closeDeleteConfirm();
      } else {
        setDeleteError(result.error || "Failed to remove subject.");
      }
    } catch (e) {
      setDeleteError(e.message || "An unexpected error occurred.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const startEditing = (assignmentId, field, currentValue) => {
    setEditingCell({ assignmentId, field });
    setEditValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const saveEdit = async () => {
    if (!editingCell) return;
    setEditLoading(true);
    try {
      const updates = {};
      if (editingCell.field === "periods") {
        updates.periodsPerWeek = parseInt(editValue);
      } else if (editingCell.field === "room") {
        updates.room = editValue || null;
      }

      const result = await updateAssignmentPeriodsAndRoom(editingCell.assignmentId, updates);
      if (result.success) {
        const data = await getTeacherSubjectAssignments(selectedClass.id);
        setAssignments(data || []);
        cancelEditing();
      } else {
        alert(result.error);
      }
    } catch (e) {
      alert(e.message || "Failed to save.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter") saveEdit();
    else if (e.key === "Escape") cancelEditing();
  };

  const getSubjectTypeBadge = (type) => {
    const styles = {
      academic: "bg-[#caf0f8] text-[#0077b6]",
      optional: "bg-amber-50 text-amber-600",
      activity: "bg-pink-50 text-pink-500",
      core: "bg-emerald-50 text-emerald-600",
      lab: "bg-violet-50 text-violet-600",
      language: "bg-orange-50 text-orange-600",
    };
    return styles[type] || styles.academic;
  };

  return (
    <>
      <AdminSectionCard>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[#0077b6]" />
            <h3 className="text-xs font-black text-[#03045e] uppercase tracking-wider">
              Subject — Teacher Mapping
            </h3>
          </div>
          <button
            onClick={openAddSubjectModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#03045e] text-white text-[10px] font-black hover:bg-[#0077b6] transition-colors"
          >
            <Plus size={12} />
            Add Subject
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-gray-400 font-semibold text-center py-8">
            Loading subject mappings...
          </p>
        ) : subjectMappings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-gray-400 font-semibold">
              No subject mappings found for this class.
            </p>
            <p className="text-[10px] text-gray-300 mt-1">
              Add subjects to build the academic structure.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#caf0f8]/60">
                  <th className="text-left py-3 px-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Subject</th>
                  <th className="text-left py-3 px-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Teacher</th>
                  <th className="text-center py-3 px-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="text-center py-3 px-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Periods/Week</th>
                  <th className="text-center py-3 px-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Room</th>
                  <th className="text-center py-3 px-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjectMappings.map((mapping) => (
                  <tr key={mapping.assignmentId} className="border-b border-[#caf0f8]/30 hover:bg-[#caf0f8]/10 transition-colors">
                    <td className="py-3 px-2">
                      <div className="space-y-0.5">
                        <p className="text-xs font-extrabold text-[#03045e]">{mapping.subjectName}</p>
                        <p className="text-[9px] text-gray-400 font-semibold">{mapping.subjectCode}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-gray-700">{mapping.teacherName}</p>
                          <p className="text-[9px] text-gray-400">{mapping.teacherDesignation}</p>
                        </div>
                        {mapping.isClassTeacher && (
                          <span className="ml-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#03045e] text-white text-[8px] font-bold">
                            <UserCheck size={8} /> CT
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[8px] font-bold uppercase ${getSubjectTypeBadge(mapping.subjectType)}`}>
                        {mapping.subjectType}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      {editingCell?.assignmentId === mapping.assignmentId && editingCell?.field === "periods" ? (
                        <div className="flex items-center justify-center gap-1">
                          <input type="number" min={1} max={10} value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={handleEditKeyDown} onBlur={saveEdit} autoFocus disabled={editLoading} className="w-12 text-center text-xs font-bold border border-[#0077b6] rounded-lg px-1 py-0.5 focus:outline-none" />
                        </div>
                      ) : (
                        <button onClick={() => startEditing(mapping.assignmentId, "periods", mapping.periodsPerWeek)} className="flex items-center justify-center gap-1 text-xs font-bold text-gray-600 hover:text-[#0077b6] transition-colors" title="Click to edit">
                          <Clock size={12} className="text-gray-400" />
                          {mapping.periodsPerWeek}
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      {editingCell?.assignmentId === mapping.assignmentId && editingCell?.field === "room" ? (
                        <input type="text" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={handleEditKeyDown} onBlur={saveEdit} autoFocus disabled={editLoading} placeholder={selectedClass.room || "Room"} className="w-16 text-center text-xs font-bold border border-[#0077b6] rounded-lg px-1 py-0.5 focus:outline-none" />
                      ) : (
                        <button onClick={() => startEditing(mapping.assignmentId, "room", mapping.room || "")} className="text-xs font-bold text-gray-600 hover:text-[#0077b6] transition-colors" title="Click to edit">
                          {mapping.room || selectedClass.room || <span className="text-gray-300">-</span>}
                        </button>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openChangeTeacherModal(mapping)} className="p-1.5 rounded-lg hover:bg-[#caf0f8]/50 text-gray-400 hover:text-[#0077b6] transition-colors" title="Change Teacher">
                          <ArrowRightLeft size={14} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-[#caf0f8]/50 text-gray-400 hover:text-[#03045e] transition-colors" title="Edit Periods">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => openDeleteConfirm(mapping)} className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-colors" title="Remove Subject">
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSectionCard>

      {/* Modals from AcademicStructurePage */}
      {changeTeacherModalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#caf0f8]/60">
              <div>
                <h3 className="text-sm font-black text-[#03045e]">Change Subject Teacher</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{selectedAssignment.subjectName} · {selectedClass?.displayName || selectedClass?.name}</p>
              </div>
              <button onClick={closeChangeTeacherModal} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X size={16} className="text-gray-400" /></button>
            </div>
            <div className="px-6 py-4 max-h-[320px] overflow-y-auto">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 mb-4">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Current Teacher</p>
                <p className="text-xs font-extrabold text-[#03045e]">{selectedAssignment.teacherName}</p>
                <p className="text-[10px] text-gray-500">{selectedAssignment.teacherDesignation}</p>
              </div>
              {modalLoading && <p className="text-xs text-gray-400 font-semibold text-center py-6">Loading eligible teachers...</p>}
              {modalError && <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 mb-3"><AlertCircle size={14} className="text-rose-500" /><p className="text-[10px] font-bold text-rose-600">{modalError}</p></div>}
              {modalSuccess && <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 mb-3"><Check size={14} className="text-emerald-500" /><p className="text-[10px] font-bold text-emerald-600">{modalSuccess}</p></div>}
              {!modalLoading && eligibleTeachers.length === 0 && <p className="text-xs text-gray-400 font-semibold text-center py-6">No other eligible teachers found for this subject.</p>}
              {!modalLoading && eligibleTeachers.map((t) => {
                const isSelected = selectedNewTeacherId === t.id;
                return (
                  <button key={t.id} onClick={() => setSelectedNewTeacherId(t.id)} className={`w-full text-left p-3 rounded-xl border mb-2 transition-all ${isSelected ? "bg-[#03045e] border-[#03045e] text-white" : "bg-white border-[#caf0f8] hover:border-[#0077b6]"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-extrabold ${isSelected ? "text-white" : "text-[#03045e]"}`}>{t.metadata?.name || t.name}</p>
                        <p className={`text-[10px] font-semibold mt-0.5 ${isSelected ? "text-white/80" : "text-gray-500"}`}>{t.metadata?.designation || t.designation}</p>
                        {t.taughtSubjects && t.taughtSubjects.length > 0 && <p className={`text-[9px] mt-1 font-semibold truncate ${isSelected ? "text-white/60" : "text-gray-400"}`} title={t.taughtSubjects.join(", ")}>Teaches: {t.taughtSubjects.join(", ")}</p>}
                      </div>
                      {isSelected && <Check size={16} className="text-white shrink-0" />}
                    </div>
                  </button>
                );
              })}
              {workloadWarning && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={14} className="text-amber-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-amber-700">Workload Warning</p>
                      <p className="text-[10px] text-amber-600 mt-0.5">{workloadWarning.teacherName} would have {workloadWarning.projectedLoad} periods/week (max: {workloadWarning.maxAllowed}). This may cause scheduling conflicts.</p>
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input type="checkbox" checked={allowOverload} onChange={(e) => setAllowOverload(e.target.checked)} className="w-3 h-3 rounded border-amber-300 text-amber-500 focus:ring-amber-400" />
                        <span className="text-[10px] font-semibold text-amber-700">Allow overload and proceed</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#caf0f8]/60 bg-gray-50/50">
              <button onClick={closeChangeTeacherModal} className="px-4 py-2 rounded-xl text-[10px] font-black text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
              <button onClick={handleConfirmChangeTeacher} disabled={!selectedNewTeacherId || modalLoading || modalSuccess || (workloadWarning && !allowOverload)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#03045e] text-white text-[10px] font-black hover:bg-[#0077b6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"><ArrowRightLeft size={12} /> Confirm Change</button>
            </div>
          </motion.div>
        </div>
      )}

      {addSubjectModalOpen && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#caf0f8]/60">
              <div>
                <h3 className="text-sm font-black text-[#03045e]">Add Subject</h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">{selectedClass.displayName || selectedClass.name}</p>
              </div>
              <button onClick={closeAddSubjectModal} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><X size={16} className="text-gray-400" /></button>
            </div>
            <div className="px-6 py-4 max-h-[400px] overflow-y-auto">
              {addModalLoading && <p className="text-xs text-gray-400 font-semibold text-center py-6">Adding subject...</p>}
              {addModalError && <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 mb-3"><AlertCircle size={14} className="text-rose-500" /><p className="text-[10px] font-bold text-rose-600">{addModalError}</p></div>}
              {addModalSuccess && <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100 mb-3"><Check size={14} className="text-emerald-500" /><p className="text-[10px] font-bold text-emerald-600">{addModalSuccess}</p></div>}
              {!addModalLoading && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Subject</label>
                    <select value={newSubjectData.subjectId} onChange={(e) => handleSubjectSelection(e.target.value)} className="w-full bg-white border border-[#caf0f8] text-[#03045e] text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077b6]">
                      <option value="">Select Subject</option>
                      {availableSubjectsForClass.map((s) => (
                        <option key={s.id} value={s.id}>{s.name || s.subjectName}</option>
                      ))}
                    </select>
                    {availableSubjectsForClass.length === 0 && <p className="text-[10px] text-amber-600 mt-1">All applicable subjects are already assigned.</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Teacher</label>
                    <select value={newSubjectData.teacherId} onChange={(e) => handleTeacherSelection(e.target.value)} disabled={!newSubjectData.subjectId} className="w-full bg-white border border-[#caf0f8] text-[#03045e] text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077b6] disabled:opacity-50">
                      <option value="">{newSubjectData.subjectId ? "Select Teacher" : "Select subject first"}</option>
                      {eligibleTeachersForSubject.map((t) => (
                        <option key={t.id} value={t.id}>{t.metadata?.name || t.name} ({t.metadata?.designation || t.designation})</option>
                      ))}
                    </select>
                    {workloadLoading && <p className="text-[10px] text-gray-400 mt-2">Loading workload...</p>}
                    {teacherWorkload && !workloadLoading && (
                      <div className={`mt-2 p-2 rounded-lg text-[10px] ${teacherWorkload.isOverloaded ? "bg-rose-50 border border-rose-100" : teacherWorkload.utilization > 80 ? "bg-amber-50 border border-amber-100" : "bg-emerald-50 border border-emerald-100"}`}>
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${teacherWorkload.isOverloaded ? "text-rose-700" : teacherWorkload.utilization > 80 ? "text-amber-700" : "text-emerald-700"}`}>
                            {teacherWorkload.isOverloaded ? "⚠️ Overloaded" : teacherWorkload.utilization > 80 ? "⚡ High Load" : "✓ Normal Load"}
                          </span>
                          <span className="font-bold text-gray-600">{teacherWorkload.projectedPeriods}/{teacherWorkload.maxAllowed} periods</span>
                        </div>
                        <div className="mt-1 text-gray-500">
                          Currently teaching {teacherWorkload.sections} sections
                          {teacherWorkload.isOverloaded && <span className="block mt-0.5 text-rose-600 font-semibold">Will exceed max by {teacherWorkload.projectedPeriods - teacherWorkload.maxAllowed} periods</span>}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Periods / Week</label>
                    <input type="number" min={1} max={10} value={newSubjectData.periodsPerWeek} onChange={(e) => setNewSubjectData((prev) => ({ ...prev, periodsPerWeek: parseInt(e.target.value) || 6 }))} className="w-full bg-white border border-[#caf0f8] text-[#03045e] text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077b6]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Room (optional)</label>
                    <input type="text" value={newSubjectData.room} onChange={(e) => setNewSubjectData((prev) => ({ ...prev, room: e.target.value }))} placeholder={selectedClass.room || "Default room"} className="w-full bg-white border border-[#caf0f8] text-[#03045e] text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077b6]" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#caf0f8]/60 bg-gray-50/50">
              <button onClick={closeAddSubjectModal} className="px-4 py-2 rounded-xl text-[10px] font-black text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
              <button onClick={handleConfirmAddSubject} disabled={!newSubjectData.subjectId || !newSubjectData.teacherId || addModalLoading || addModalSuccess} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#03045e] text-white text-[10px] font-black hover:bg-[#0077b6] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"><Plus size={12} /> Add Subject</button>
            </div>
          </motion.div>
        </div>
      )}

      {deleteConfirmOpen && assignmentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#caf0f8]/60"><h3 className="text-sm font-black text-rose-600">Remove Subject?</h3></div>
            <div className="px-6 py-4">
              <p className="text-xs text-gray-600 mb-2">Are you sure you want to remove <span className="font-bold text-[#03045e]">{assignmentToDelete.subjectName}</span> taught by <span className="font-bold text-[#03045e]">{assignmentToDelete.teacherName}</span>?</p>
              <p className="text-[10px] text-gray-400">This action cannot be undone. Exams or timetable slots tied to this subject will prevent removal.</p>
              {deleteError && <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-100 mt-3"><AlertCircle size={14} className="text-rose-500 mt-0.5" /><p className="text-[10px] font-bold text-rose-600">{deleteError}</p></div>}
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-[#caf0f8]/60 bg-gray-50/50">
              <button onClick={closeDeleteConfirm} disabled={deleteLoading} className="px-4 py-2 rounded-xl text-[10px] font-black text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
              <button onClick={handleConfirmDelete} disabled={deleteLoading} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 text-white text-[10px] font-black hover:bg-rose-600 transition-colors disabled:opacity-40">{deleteLoading ? "Removing..." : "Remove Subject"}</button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default AdminSubjectMappingTable;
