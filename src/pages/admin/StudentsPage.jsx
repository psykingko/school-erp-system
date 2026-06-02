import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Phone,
  ChevronRight,
  Users,
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
  getAllStudents,
  updateStudentProfile,
  addStudent,
  softDeleteStudent,
  getStudentDependencies,
} from "../../services/studentService";
import { formatClassName, isSeniorSecondary } from "../../utils/classIdentity";

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterStream, setFilterStream] = useState("");
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);

  // Manual activity feed (no auto-sync, human language only)
  const [activities] = useState([
    {
      type: "student",
      description: "New student admitted to Class 10-A",
      timestamp: Date.now() - 1000 * 60 * 30,
      user: "Admin",
    },
    {
      type: "student",
      description: "Student profile updated for admission STU-045",
      timestamp: Date.now() - 1000 * 60 * 120,
      user: "Admin",
    },
    {
      type: "student",
      description: "Student deactivated from Class 12-B",
      timestamp: Date.now() - 1000 * 60 * 240,
      user: "Admin",
    },
  ]);

  // Preview & Edit states
  const [previewStudent, setPreviewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);
  const [addStudentOpen, setAddStudentOpen] = useState(false);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    studentId: null,
    studentName: "",
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
      const data = await getAllStudents();
      setStudents(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStudent = async (formData) => {
    if (!editStudent) return;
    try {
      const updated = await updateStudentProfile(editStudent.id, formData);
      if (updated) {
        // Optimistic update
        setStudents((prev) =>
          prev.map((s) => (s.id === editStudent.id ? { ...s, ...updated } : s)),
        );
        setToast({
          show: true,
          message: "Student updated successfully",
          type: "success",
        });
      }
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Failed to update student",
        type: "error",
      });
    }
  };

  const handleAddStudent = async (formData) => {
    try {
      const newStudent = await addStudent(formData);
      // Optimistic update
      setStudents((prev) => [...prev, newStudent]);
      setAddStudentOpen(false);
      setToast({
        show: true,
        message: "Student admitted successfully",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Failed to admit student",
        type: "error",
      });
    }
  };

  const handleDeleteClick = async (student) => {
    const dependencies = await getStudentDependencies(student.id);
    const warnings = [];
    if (dependencies.hasFees) warnings.push("This student has fee records.");
    if (dependencies.hasAttendance)
      warnings.push("This student has attendance records.");
    if (dependencies.hasResults)
      warnings.push("This student has exam results.");

    setDeleteConfirm({
      isOpen: true,
      studentId: student.id,
      studentName: student.name,
      warning: warnings.length > 0 ? warnings.join(" ") : "",
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await softDeleteStudent(deleteConfirm.studentId);
      // Optimistic update
      setStudents((prev) =>
        prev.map((s) =>
          s.id === deleteConfirm.studentId ? { ...s, isActive: false } : s,
        ),
      );
      setDeleteConfirm({
        isOpen: false,
        studentId: null,
        studentName: "",
        warning: "",
      });
      setToast({
        show: true,
        message: "Student deactivated successfully",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Failed to deactivate student",
        type: "error",
      });
    }
  };

  // Form defaults (in page, NOT separate utils file)
  const studentFormDefaults = {
    name: "",
    classLevel: "1",
    section: "A",
    stream: "",
    phoneNumber: "",
    gender: "Male",
    category: "General",
    nationality: "Indian",
    dob: "",
  };

  const sectionToStream = {
    A: "Science Non-Medical",
    B: "Science Medical",
    C: "Commerce",
    D: "Humanities",
  };

  const handleClassChange = (cls) => {
    setFilterClass(cls);
    if ((cls === "11" || cls === "12") && filterSection) {
      setFilterStream(sectionToStream[filterSection] || "");
    } else {
      setFilterStream("");
    }
  };

  const handleSectionChange = (sec) => {
    setFilterSection(sec);
    if ((filterClass === "11" || filterClass === "12") && sec) {
      setFilterStream(sectionToStream[sec] || "");
    }
  };

  const filteredStudents = students.filter((stu) => {
    // Exclude inactive by default unless showInactive is true
    if (!showInactive && stu.isActive === false) return false;

    const matchesSearch =
      stu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stu.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stu.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = filterClass === "" || stu.classLevel === filterClass;
    const matchesSection =
      filterSection === "" || stu.section === filterSection;
    const matchesStream =
      !isSeniorSecondary(stu.classLevel) ||
      filterStream === "" ||
      stu.stream === filterStream;

    return matchesSearch && matchesClass && matchesSection && matchesStream;
  });

  // Component-level analytics (no service, read-only derivation)
  const analytics = useMemo(() => {
    const activeStudents = students.filter((s) => s.isActive !== false);
    const inactiveStudents = students.filter((s) => s.isActive === false);
    const seniorSecondary = activeStudents.filter((s) =>
      isSeniorSecondary(s.classLevel),
    );
    const foundation = activeStudents.filter((s) =>
      ["Nursery", "LKG", "UKG"].includes(s.classLevel),
    );
    const primary = activeStudents.filter((s) => {
      const level = parseInt(s.classLevel);
      return level >= 1 && level <= 5;
    });
    const middle = activeStudents.filter((s) => {
      const level = parseInt(s.classLevel);
      return level >= 6 && level <= 8;
    });
    const secondary = activeStudents.filter((s) => {
      const level = parseInt(s.classLevel);
      return level >= 9 && level <= 10;
    });

    // Gender distribution
    const maleCount = activeStudents.filter((s) => s.gender === "Male").length;
    const femaleCount = activeStudents.filter(
      (s) => s.gender === "Female",
    ).length;
    const otherCount = activeStudents.filter(
      (s) => s.gender === "Other",
    ).length;

    // Category distribution
    const generalCount = activeStudents.filter(
      (s) => s.category === "General",
    ).length;
    const obcCount = activeStudents.filter((s) => s.category === "OBC").length;
    const scCount = activeStudents.filter((s) => s.category === "SC").length;
    const stCount = activeStudents.filter((s) => s.category === "ST").length;

    return {
      total: activeStudents.length,
      inactive: inactiveStudents.length,
      seniorSecondary: seniorSecondary.length,
      foundation: foundation.length,
      primary: primary.length,
      middle: middle.length,
      secondary: secondary.length,
      male: maleCount,
      female: femaleCount,
      other: otherCount,
      general: generalCount,
      obc: obcCount,
      sc: scCount,
      st: stCount,
    };
  }, [students]);

  // Chart data (component-level, no service)
  const classDistributionData = useMemo(
    () => [
      { name: "Foundation", value: analytics.foundation },
      { name: "Primary", value: analytics.primary },
      { name: "Middle", value: analytics.middle },
      { name: "Secondary", value: analytics.secondary },
      { name: "Senior Secondary", value: analytics.seniorSecondary },
    ],
    [analytics],
  );

  const genderDistributionData = useMemo(
    () => [
      { name: "Male", value: analytics.male },
      { name: "Female", value: analytics.female },
      { name: "Other", value: analytics.other },
    ],
    [analytics],
  );

  const categoryDistributionData = useMemo(
    () => [
      { name: "General", value: analytics.general },
      { name: "OBC", value: analytics.obc },
      { name: "SC", value: analytics.sc },
      { name: "ST", value: analytics.st },
    ],
    [analytics],
  );

  const studentFields = [
    { name: "name", label: "Student Full Name", type: "text", required: true },
    {
      name: "classLevel",
      label: "Class",
      type: "select",
      options: [
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
      ],
      required: true,
    },
    {
      name: "section",
      label: "Section",
      type: "select",
      options: ["A", "B", "C", "D"],
      required: true,
    },
    {
      name: "stream",
      label: "Academic Stream (Classes 11 & 12 only)",
      type: "select",
      options: [
        "Science Non-Medical",
        "Science Medical",
        "Commerce",
        "Humanities",
      ],
      hidden: (formState) => !isSeniorSecondary(formState.classLevel),
    },
    {
      name: "phoneNumber",
      label: "Primary Contact Number",
      type: "text",
      required: true,
    },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: ["Male", "Female", "Other"],
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: ["General", "OBC", "SC", "ST"],
    },
    { name: "nationality", label: "Nationality", type: "text" },
    { name: "dob", label: "Date of Birth (YYYY-MM-DD)", type: "text" },
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
          title="Student Directory"
          description="Manage institutional student records, admission statuses, and parent mappings."
          breadcrumbs={["Admin Portal", "User Management", "Students"]}
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
        title="Student Directory"
        description="Manage institutional student records, admission statuses, and parent mappings."
        breadcrumbs={["Admin Portal", "User Management", "Students"]}
        actionButton={
          <button
            onClick={() => setAddStudentOpen(true)}
            className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#0096c7] text-white px-5 py-2.5 rounded-2xl shadow-sm text-xs font-black transition-colors"
          >
            <UserPlus size={16} />
            <span>ADMIT STUDENT</span>
          </button>
        }
      />

      {/* Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <AdminStatCard
          title="Active Admissions"
          value={analytics.total.toString()}
          badgeText="All Clear"
          badgeType="success"
          icon={Users}
        />
        <AdminStatCard
          title="Senior Secondary Students"
          value={analytics.seniorSecondary.toString()}
          badgeText="Class 11 & 12"
          badgeType="info"
          icon={Users}
          color="#0096c7"
          bg="#ade8f4"
        />
        <AdminStatCard
          title="Inactive Students"
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
          placeholder="Search by name, admission no or id..."
          filterButton={
            <div className="flex flex-wrap gap-2">
              <select
                value={filterClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none"
              >
                <option value="">All Classes</option>
                <option value="Nursery">Nursery</option>
                <option value="LKG">LKG</option>
                <option value="UKG">UKG</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num.toString()}>
                    {num === 11
                      ? "Class 11"
                      : num === 12
                        ? "Class 12"
                        : `Class ${num}`}
                  </option>
                ))}
              </select>

              <select
                value={filterSection}
                onChange={(e) => handleSectionChange(e.target.value)}
                className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none"
              >
                <option value="">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
                <option value="D">Section D</option>
              </select>

              {(filterClass === "11" || filterClass === "12") && (
                <select
                  value={filterStream}
                  onChange={(e) => setFilterStream(e.target.value)}
                  className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none"
                >
                  <option value="">All Streams</option>
                  <option value="Science Non-Medical">
                    Science Non-Medical
                  </option>
                  <option value="Science Medical">Science Medical</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Humanities">Humanities</option>
                </select>
              )}

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
              "Adm No.",
              "Student Name",
              "Class & Section",
              "Contact Info",
              "Status",
              "Actions",
            ]}
            items={filteredStudents}
            isEmpty={filteredStudents.length === 0}
            emptyTitle="No students found matching current query"
            renderRow={(stu) => {
              const displayClassSec = formatClassName(
                stu.classLevel,
                stu.section,
              );
              return (
                <tr
                  key={stu.id}
                  className="hover:bg-[#caf0f8]/10 transition-colors text-xs text-gray-700 font-bold"
                >
                  <td className="py-4 px-3 text-[#03045e] font-black first:pl-2">
                    {stu.admissionNo}
                  </td>
                  <td className="py-4 px-3">
                    <button
                      onClick={() => setPreviewStudent(stu)}
                      className="hover:text-[#0077b6] text-left transition-colors font-extrabold focus:outline-none"
                    >
                      {stu.name}
                    </button>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#caf0f8]/70 text-[#03045e] border border-[#caf0f8]">
                        {displayClassSec}
                      </span>
                      {isSeniorSecondary(stu.classLevel) && stu.stream && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                          {stu.stream}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="space-y-1 text-[10px] text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Phone size={10} />
                        <span>{stu.phoneNumber || "+91 98765 43210"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${
                        stu.isActive === false
                          ? "text-gray-500 bg-gray-50 border-gray-200"
                          : "text-emerald-600 bg-emerald-50 border-emerald-100"
                      }`}
                    >
                      {stu.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right last:pr-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setPreviewStudent(stu)}
                        className="text-[#0077b6] hover:text-[#03045e] transition-colors p-1.5 hover:bg-[#caf0f8]/40 rounded-lg"
                      >
                        <ChevronRight size={16} />
                      </button>
                      {stu.isActive !== false && (
                        <button
                          onClick={() => handleDeleteClick(stu)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                          title="Deactivate Student"
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
        isOpen={!!previewStudent}
        onClose={() => setPreviewStudent(null)}
        type="student"
        data={previewStudent}
        onEdit={(studentData) => setEditStudent(studentData)}
      />

      {/* Centred Edit Modal */}
      <AdminEditForm
        isOpen={!!editStudent}
        onClose={() => setEditStudent(null)}
        title="Edit Student Record"
        data={editStudent}
        fields={studentFields}
        onChange={(name, value, currentState) => {
          const updated = { ...currentState };
          // If classLevel changes to anything other than 11 or 12, clear stream
          if (name === "classLevel") {
            if (value !== "11" && value !== "12") {
              updated.stream = "";
            } else if (updated.section) {
              // Auto-suggest stream based on section if changing to 11/12
              updated.stream = sectionToStream[updated.section] || "";
            }
          }
          // If section changes and classLevel is 11 or 12, auto-populate stream
          if (
            name === "section" &&
            (updated.classLevel === "11" || updated.classLevel === "12")
          ) {
            updated.stream = sectionToStream[value] || "";
          }
          return updated;
        }}
        onSubmit={handleUpdateStudent}
      />

      {/* Add Student Modal */}
      <AdminEditForm
        isOpen={addStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        title="Admit New Student"
        data={studentFormDefaults}
        fields={studentFields}
        onChange={(name, value, currentState) => {
          const updated = { ...currentState };
          if (name === "classLevel") {
            if (value !== "11" && value !== "12") {
              updated.stream = "";
            } else if (updated.section) {
              updated.stream = sectionToStream[updated.section] || "";
            }
          }
          if (
            name === "section" &&
            (updated.classLevel === "11" || updated.classLevel === "12")
          ) {
            updated.stream = sectionToStream[value] || "";
          }
          return updated;
        }}
        onSubmit={handleAddStudent}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        title="Deactivate Student"
        message={`Are you sure you want to deactivate ${deleteConfirm.studentName}? This will hide the student from active listings.`}
        warningText={deleteConfirm.warning}
        onConfirm={handleDeleteConfirm}
        onCancel={() =>
          setDeleteConfirm({
            isOpen: false,
            studentId: null,
            studentName: "",
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

export default StudentsPage;
