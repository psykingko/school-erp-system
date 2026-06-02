import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  ChevronRight,
  Briefcase,
  Users,
  GraduationCap,
  Trash,
  Eye,
  EyeOff,
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminStatCard from "../../components/admin/AdminStatCard";
import AdminFilterBar from "../../components/admin/AdminFilterBar";
import AdminDataTable from "../../components/admin/AdminDataTable";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import AdminProfilePreview from "../../components/admin/AdminProfilePreview";
import AdminEditForm from "../../components/admin/AdminEditForm";
import ConfirmationModal from "../../components/shared/ConfirmationModal";
import ToastNotification from "../../components/shared/ToastNotification";
import LoadingSkeleton from "../../components/shared/LoadingSkeleton";
import ChartWrapper from "../../components/shared/ChartWrapper";
import ActivityFeed from "../../components/shared/ActivityFeed";
import {
  getAllTeachers,
  updateTeacherProfile,
  addTeacher,
  softDeleteTeacher,
  getTeacherDependencies,
} from "../../services/teacherService";
import { getItem } from "../../persistence/storage";
import { STORAGE_KEYS } from "../../persistence/storageKeys";

// Class levels supported by the institution
const CLASS_LEVELS = [
  "Nursery",
  "LKG",
  "UKG",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];
const SECTIONS = ["A", "B", "C", "D"];

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  // Manual activity feed (no auto-sync, human language only)
  const [activities] = useState([
    {
      type: "teacher",
      description: "New teacher appointed to Science Department",
      timestamp: Date.now() - 1000 * 60 * 45,
      user: "Admin",
    },
    {
      type: "teacher",
      description: "Teacher profile updated for T-012",
      timestamp: Date.now() - 1000 * 60 * 180,
      user: "Admin",
    },
    {
      type: "teacher",
      description: "Class teacher assigned to Class 9-A",
      timestamp: Date.now() - 1000 * 60 * 300,
      user: "Admin",
    },
  ]);

  // Preview & Edit states
  const [previewTeacher, setPreviewTeacher] = useState(null);
  const [editTeacher, setEditTeacher] = useState(null);
  const [addTeacherOpen, setAddTeacherOpen] = useState(false);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    teacherId: null,
    teacherName: "",
    warning: "",
  });

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const allTeachers = await getAllTeachers();
      const allClasses = getItem(STORAGE_KEYS.CLASSES, []);
      const allAssignments = getItem(
        STORAGE_KEYS.TEACHER_SUBJECT_ASSIGNMENTS,
        [],
      );
      const allSubjects = getItem(STORAGE_KEYS.SUBJECTS, []);

      setTeachers(allTeachers || []);
      setClasses(allClasses || []);
      setAssignments(allAssignments || []);
      setSubjectsList(allSubjects || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeacher = async (formData) => {
    if (!editTeacher) return;
    try {
      const updated = await updateTeacherProfile(editTeacher.id, formData);
      if (updated) {
        // Optimistic update
        setTeachers((prev) =>
          prev.map((t) => (t.id === editTeacher.id ? { ...t, ...updated } : t)),
        );
        setToast({
          show: true,
          message: "Teacher updated successfully",
          type: "success",
        });
      }
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Failed to update teacher",
        type: "error",
      });
    }
  };

  const handleAddTeacher = async (formData) => {
    try {
      const newTeacher = await addTeacher(formData);
      // Optimistic update
      setTeachers((prev) => [...prev, newTeacher]);
      setAddTeacherOpen(false);
      setToast({
        show: true,
        message: "Teacher added successfully",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      setToast({ show: true, message: "Failed to add teacher", type: "error" });
    }
  };

  const handleDeleteClick = async (teacher) => {
    const dependencies = await getTeacherDependencies(teacher.id);
    const warnings = [];
    if (dependencies.hasAssignments)
      warnings.push("This teacher has subject assignments.");
    if (dependencies.isClassTeacher)
      warnings.push("This teacher is a class teacher.");

    setDeleteConfirm({
      isOpen: true,
      teacherId: teacher.id,
      teacherName: teacher.name,
      warning: warnings.length > 0 ? warnings.join(" ") : "",
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await softDeleteTeacher(deleteConfirm.teacherId);
      // Optimistic update
      setTeachers((prev) =>
        prev.map((t) =>
          t.id === deleteConfirm.teacherId ? { ...t, isActive: false } : t,
        ),
      );
      setDeleteConfirm({
        isOpen: false,
        teacherId: null,
        teacherName: "",
        warning: "",
      });
      setToast({
        show: true,
        message: "Teacher deactivated successfully",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Failed to deactivate teacher",
        type: "error",
      });
    }
  };

  // Form defaults (in page, NOT separate utils file)
  const teacherFormDefaults = {
    name: "",
    phoneNumber: "",
    email: "",
    department: "Science",
    qualification: "",
    experience: "",
  };

  // Helper to resolve subjects taught by a teacher relationally
  const getTeacherSubjects = useCallback(
    (teacherId) => {
      const teacherAssignments = assignments.filter(
        (a) => a.teacherId === teacherId,
      );
      const resolved = teacherAssignments.map((a) => {
        const sub = subjectsList.find((s) => s.id === a.subjectId);
        return sub ? sub.name : null;
      });
      return [...new Set(resolved.filter(Boolean))];
    },
    [assignments, subjectsList],
  );

  // Helper to resolve class-section assignments for a teacher (academic operational view)
  const getTeacherClassSections = useCallback(
    (teacherId) => {
      const teacherAssignments = assignments.filter(
        (a) => a.teacherId === teacherId,
      );
      const classSectionMap = new Map();

      teacherAssignments.forEach((a) => {
        const cls = classes.find((c) => c.id === a.classId);
        if (cls) {
          const key = `${cls.name}`;
          if (!classSectionMap.has(key)) {
            classSectionMap.set(key, {
              className: cls.name,
              section: cls.section,
              classId: cls.id,
              subjects: [],
            });
          }
          const sub = subjectsList.find((s) => s.id === a.subjectId);
          if (sub) {
            classSectionMap.get(key).subjects.push(sub.name);
          }
        }
      });

      return Array.from(classSectionMap.values());
    },
    [assignments, classes, subjectsList],
  );

  // Helper to resolve Class Teacher authority (Indian Institutional Terminology)
  const getClassTeacherAssignment = useCallback(
    (teacherId) => {
      const ownedClass = classes.find((c) => c.classTeacherId === teacherId);
      return ownedClass
        ? {
            name: ownedClass.name,
            section: ownedClass.section,
            id: ownedClass.id,
          }
        : null;
    },
    [classes],
  );

  // Check if teacher is associated with selected class-section
  const isTeacherAssociatedWithClassSection = useCallback(
    (teacherId, classLevel, section) => {
      if (!classLevel || !section) return true;

      // Check if class teacher of this class-section
      const ownedClass = classes.find(
        (c) =>
          c.classTeacherId === teacherId &&
          c.name === `${classLevel}-${section}`,
      );
      if (ownedClass) return true;

      // Check if teaches any subject in this class-section
      const targetClassId = `class-${classLevel.toLowerCase()}${section.toLowerCase()}`;
      const teachesInClass = assignments.some(
        (a) => a.teacherId === teacherId && a.classId === targetClassId,
      );

      return teachesInClass;
    },
    [classes, assignments],
  );

  // Get contextual empty state message
  const getEmptyStateMessage = () => {
    if (selectedClass && selectedSection) {
      return `No teachers currently assigned to Class ${selectedClass} Section ${selectedSection}`;
    }
    if (selectedClass) {
      return `No teachers found for Class ${selectedClass}. Try selecting a specific section.`;
    }
    return "No faculty found matching search terms";
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter((tch) => {
      // Exclude inactive by default unless showInactive is true
      if (!showInactive && tch.isActive === false) return false;

      const subjects = getTeacherSubjects(tch.id).join(" ");
      const classSections = getTeacherClassSections(tch.id);
      const classSectionNames = classSections
        .map((cs) => cs.className)
        .join(" ");

      const matchesSearch =
        searchTerm === "" ||
        tch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tch.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tch.department || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        subjects.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classSectionNames.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesClassSection = (() => {
        if (selectedClass === "") return true;
        if (selectedSection !== "") {
          return isTeacherAssociatedWithClassSection(
            tch.id,
            selectedClass,
            selectedSection,
          );
        }
        // Class selected + All Sections → match any section of that class
        return SECTIONS.some((sec) =>
          isTeacherAssociatedWithClassSection(tch.id, selectedClass, sec),
        );
      })();

      return matchesSearch && matchesClassSection;
    });
  }, [
    teachers,
    searchTerm,
    selectedClass,
    selectedSection,
    showInactive,
    assignments,
    classes,
  ]);

  // Component-level analytics (no service, read-only derivation)
  const analytics = useMemo(() => {
    const activeTeachers = teachers.filter((t) => t.isActive !== false);
    const inactiveTeachers = teachers.filter((t) => t.isActive === false);
    const classTeachers = activeTeachers.filter((t) =>
      classes.some((c) => c.classTeacherId === t.id),
    );
    const subjectTeachers = activeTeachers.filter((t) =>
      assignments.some((a) => a.teacherId === t.id),
    );

    // Department distribution
    const deptCounts = activeTeachers.reduce((acc, t) => {
      const dept = t.department || "Unassigned";
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    // Designation distribution
    const designationCounts = activeTeachers.reduce((acc, t) => {
      const designation = t.designation || "Teacher";
      acc[designation] = (acc[designation] || 0) + 1;
      return acc;
    }, {});

    return {
      total: activeTeachers.length,
      inactive: inactiveTeachers.length,
      classTeachers: classTeachers.length,
      subjectTeachers: subjectTeachers.length,
      departmentCounts: deptCounts,
      designationCounts: designationCounts,
    };
  }, [teachers, classes, assignments]);

  // Chart data (component-level, no service)
  const departmentDistributionData = useMemo(() => {
    return Object.entries(analytics.departmentCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [analytics.departmentCounts]);

  const designationDistributionData = useMemo(() => {
    return Object.entries(analytics.designationCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [analytics.designationCounts]);

  const roleDistributionData = useMemo(
    () => [
      { name: "Class Teachers", value: analytics.classTeachers },
      { name: "Subject Teachers", value: analytics.subjectTeachers },
    ],
    [analytics.classTeachers, analytics.subjectTeachers],
  );

  const teacherFields = [
    { name: "name", label: "Faculty Full Name", type: "text", required: true },
    {
      name: "phoneNumber",
      label: "Primary Contact Number",
      type: "text",
      required: true,
    },
    {
      name: "email",
      label: "Institutional Email",
      type: "email",
      required: true,
    },
    {
      name: "department",
      label: "Department",
      type: "select",
      options: [
        "Science",
        "Mathematics",
        "Humanities",
        "Commerce",
        "Languages",
      ],
    },
    {
      name: "qualification",
      label: "Professional Qualification",
      type: "text",
    },
    { name: "experience", label: "Years of Experience", type: "text" },
  ];

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 pb-12"
      >
        <AdminPageHeader
          title="Faculty & Staff Directory"
          description="Manage institutional teacher records, class teacher mappings, and academic assignments."
          breadcrumbs={["Admin Portal", "User Management", "Teachers"]}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <LoadingSkeleton variant="stat-card" />
          <LoadingSkeleton variant="stat-card" />
          <LoadingSkeleton variant="stat-card" />
        </div>
        <AdminSectionCard>
          <LoadingSkeleton variant="table-row" count={5} />
        </AdminSectionCard>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Faculty & Staff Directory"
        description="Manage institutional teacher records, class teacher mappings, and academic assignments."
        breadcrumbs={["Admin Portal", "User Management", "Teachers"]}
        actionButton={
          <button
            onClick={() => setAddTeacherOpen(true)}
            className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#0096c7] text-white px-5 py-2.5 rounded-2xl shadow-sm text-xs font-black transition-colors"
          >
            <UserPlus size={16} />
            <span>ADD FACULTY MEMBER</span>
          </button>
        }
      />

      {/* Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <AdminStatCard
          title="Active Faculty"
          value={analytics.total.toString()}
          badgeText="Fully Staffed"
          badgeType="success"
          icon={Briefcase}
        />
        <AdminStatCard
          title="Class Teachers Mapped"
          value={analytics.classTeachers.toString()}
          badgeText="Class Charge"
          badgeType="success"
          icon={GraduationCap}
          color="#0096c7"
          bg="#ade8f4"
        />
        <AdminStatCard
          title="Inactive Faculty"
          value={analytics.inactive.toString()}
          badgeText="Deactivated"
          badgeType="warning"
          icon={EyeOff}
          color="#f59e0b"
          bg="#fef3c7"
        />
      </div>



      {/* Directory Table inside Section Card */}
      <AdminSectionCard>
        {/* Search and filter bar */}
        <AdminFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search faculty by name, employee ID, subject, class..."
          filterButton={
            <div className="flex items-center gap-2">
              {/* Class Filter */}
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedSection(""); // Reset section when class changes
                }}
                className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none cursor-pointer"
              >
                <option value="">All Classes</option>
                {CLASS_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    Class {level}
                  </option>
                ))}
              </select>

              {/* Section Filter */}
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                disabled={!selectedClass}
                className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">All Sections</option>
                {SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    Section {sec}
                  </option>
                ))}
              </select>

              {/* Show Inactive Toggle */}
              <button
                onClick={() => setShowInactive(!showInactive)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-colors outline-none ${
                  showInactive
                    ? "bg-[#03045e] text-white"
                    : "bg-white border border-[#caf0f8] hover:border-[#00b4d8] text-[#03045e]"
                }`}
              >
                {showInactive ? <EyeOff size={14} /> : <Eye size={14} />}
                <span>{showInactive ? "Hide Inactive" : "Show Inactive"}</span>
              </button>
            </div>
          }
        />

        {/* Modular Table Shell */}
        <div className="mt-6">
          <AdminDataTable
            headers={[
              "Employee ID",
              "Faculty Name",
              "Teaching Assignments",
              "Class Teacher",
              "Subjects",
              "Status",
              "Actions",
            ]}
            items={filteredTeachers}
            isEmpty={filteredTeachers.length === 0}
            emptyTitle={getEmptyStateMessage()}
            renderRow={(tch) => {
              const subjects = getTeacherSubjects(tch.id);
              const classSections = getTeacherClassSections(tch.id);
              const classTeacherRole = getClassTeacherAssignment(tch.id);

              return (
                <tr
                  key={tch.id}
                  className="hover:bg-[#caf0f8]/10 transition-colors text-xs text-gray-700 font-bold"
                >
                  <td className="py-4 px-3 text-[#03045e] font-black first:pl-2">
                    {tch.id}
                  </td>
                  <td className="py-4 px-3">
                    <button
                      onClick={() =>
                        setPreviewTeacher({
                          ...tch,
                          subjects,
                          isClassTeacher: !!classTeacherRole,
                          classAssigned: classTeacherRole?.name,
                          dept: tch.department,
                          phone: tch.phoneNumber,
                        })
                      }
                      className="hover:text-[#0077b6] text-left transition-colors font-extrabold focus:outline-none"
                    >
                      {tch.name}
                    </button>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                      {classSections.length > 0 ? (
                        classSections.slice(0, 3).map((cs, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#caf0f8]/60 text-[#03045e] text-[10px] font-black border border-[#caf0f8]"
                            title={cs.subjects.join(", ")}
                          >
                            <GraduationCap size={10} />
                            {cs.className}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-[10px]">—</span>
                      )}
                      {classSections.length > 3 && (
                        <span className="px-2 py-0.5 rounded-lg bg-gray-100 text-gray-500 text-[10px] font-black">
                          +{classSections.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    {classTeacherRole ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 uppercase tracking-wider">
                        <Users size={10} />
                        {classTeacherRole.name}
                      </span>
                    ) : (
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold text-gray-400 bg-gray-50 uppercase tracking-wider">
                        None Assigned
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {subjects.slice(0, 4).map((sub, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-[#caf0f8] text-[#03045e] text-[10px] font-black"
                        >
                          {sub}
                        </span>
                      ))}
                      {subjects.length > 4 && (
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-black">
                          +{subjects.length - 4}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                        tch.isActive === false
                          ? "text-gray-500 bg-gray-50 border-gray-200"
                          : "text-emerald-600 bg-emerald-50 border-emerald-100"
                      }`}
                    >
                      {tch.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right last:pr-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() =>
                          setPreviewTeacher({
                            ...tch,
                            subjects,
                            isClassTeacher: !!classTeacherRole,
                            classAssigned: classTeacherRole?.name,
                            dept: tch.department,
                            phone: tch.phoneNumber,
                          })
                        }
                        className="text-[#0077b6] hover:text-[#03045e] transition-colors p-1.5 hover:bg-[#caf0f8]/40 rounded-lg"
                      >
                        <ChevronRight size={16} />
                      </button>
                      {tch.isActive !== false && (
                        <button
                          onClick={() => handleDeleteClick(tch)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                          title="Deactivate Teacher"
                        >
                          <Trash size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }}
          />
        </div>
      </AdminSectionCard>

      {/* Sliding Profile Drawer */}
      <AdminProfilePreview
        isOpen={!!previewTeacher}
        onClose={() => setPreviewTeacher(null)}
        type="teacher"
        data={previewTeacher}
        onEdit={(teacherData) => setEditTeacher(teacherData)}
      />

      {/* Centred Edit Modal */}
      <AdminEditForm
        isOpen={!!editTeacher}
        onClose={() => setEditTeacher(null)}
        title="Edit Faculty Record"
        data={editTeacher}
        fields={teacherFields}
        onSubmit={handleUpdateTeacher}
      />

      {/* Add Teacher Modal */}
      <AdminEditForm
        isOpen={addTeacherOpen}
        onClose={() => setAddTeacherOpen(false)}
        title="Add New Faculty Member"
        data={teacherFormDefaults}
        fields={teacherFields}
        onSubmit={handleAddTeacher}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        title="Deactivate Teacher"
        message={`Are you sure you want to deactivate ${deleteConfirm.teacherName}? This will hide the teacher from active listings.`}
        warningText={deleteConfirm.warning}
        onConfirm={handleDeleteConfirm}
        onCancel={() =>
          setDeleteConfirm({
            isOpen: false,
            teacherId: null,
            teacherName: "",
            warning: "",
          })
        }
        confirmButtonText="Deactivate"
        cancelButtonText="Cancel"
      />

      {/* Toast Notification */}
      <ToastNotification
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </motion.div>
  );
};

export default TeachersPage;
