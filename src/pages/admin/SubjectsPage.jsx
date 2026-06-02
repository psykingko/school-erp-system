import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, Trash, Edit } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminStatCard from "../../components/admin/AdminStatCard";
import AcademicFilterBar from "../../components/admin/academic/AcademicFilterBar";
import AcademicTable from "../../components/admin/academic/AcademicTable";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import SubjectBadge from "../../components/admin/academic/SubjectBadge";
import AdminEditForm from "../../components/admin/AdminEditForm";
import ConfirmationModal from "../../components/shared/ConfirmationModal";
import ToastNotification from "../../components/shared/ToastNotification";
import LoadingSkeleton from "../../components/shared/LoadingSkeleton";
import ChartWrapper from "../../components/shared/ChartWrapper";
import { getItem } from "../../persistence/storage";
import { STORAGE_KEYS } from "../../persistence/storageKeys";
import {
  addSubject,
  updateSubject,
  deleteSubject,
  getSubjectDependencies,
} from "../../services/academicsService";

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [streams, setStreams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [loading, setLoading] = useState(true);

  // CRUD state
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [editSubject, setEditSubject] = useState(null);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    subjectId: null,
    subjectName: "",
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
      const allSubjects = getItem(STORAGE_KEYS.SUBJECTS, []);
      const allStreams = getItem(STORAGE_KEYS.STREAMS, []);
      setSubjects(allSubjects || []);
      setStreams(allStreams || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (formData) => {
    try {
      const newSubject = await addSubject(formData);
      // Optimistic update
      setSubjects((prev) => [...prev, newSubject]);
      setAddSubjectOpen(false);
      setToast({
        show: true,
        message: "Subject added successfully",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      setToast({ show: true, message: "Failed to add subject", type: "error" });
    }
  };

  const handleUpdateSubject = async (formData) => {
    if (!editSubject) return;
    try {
      const updated = await updateSubject(editSubject.id, formData);
      // Optimistic update
      setSubjects((prev) =>
        prev.map((s) => (s.id === editSubject.id ? { ...s, ...updated } : s)),
      );
      setEditSubject(null);
      setToast({
        show: true,
        message: "Subject updated successfully",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Failed to update subject",
        type: "error",
      });
    }
  };

  const handleDeleteClick = async (subject) => {
    const dependencies = await getSubjectDependencies(subject.id);
    const warnings = [];
    if (dependencies.hasAssignments)
      warnings.push("This subject has teacher assignments.");

    setDeleteConfirm({
      isOpen: true,
      subjectId: subject.id,
      subjectName: subject.name,
      warning: warnings.length > 0 ? warnings.join(" ") : "",
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteSubject(deleteConfirm.subjectId);
      // Optimistic update (hard delete)
      setSubjects((prev) =>
        prev.filter((s) => s.id !== deleteConfirm.subjectId),
      );
      setDeleteConfirm({
        isOpen: false,
        subjectId: null,
        subjectName: "",
        warning: "",
      });
      setToast({
        show: true,
        message: "Subject deleted successfully",
        type: "success",
      });
    } catch (e) {
      console.error(e);
      setToast({
        show: true,
        message: "Failed to delete subject",
        type: "error",
      });
    }
  };

  // Form defaults (in page, NOT separate utils file)
  const subjectFormDefaults = {
    name: "",
    code: "",
    type: "core",
    schedule: true,
    room: "Room 101",
  };

  // Helper: Find which stream supports this subject
  const getSubjectStreamsStr = (subjectId) => {
    const matched = streams.filter((str) => str.subjectIds.includes(subjectId));
    if (matched.length === 0) return "General Elective";
    return matched.map((m) => m.name.split(" ")[0]).join(", ");
  };

  const filteredSubjects = subjects.filter((sub) => {
    const streamStr = getSubjectStreamsStr(sub.id);
    const matchesSearch =
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      streamStr.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === "" ||
      sub.type.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesType;
  });

  // Component-level analytics (no service, read-only derivation)
  const analytics = useMemo(() => {
    const coreSubjects = subjects.filter((s) => s.type === "core");
    const electiveSubjects = subjects.filter((s) => s.type === "elective");
    const labSubjects = subjects.filter((s) => s.isLab);
    const nonLabSubjects = subjects.filter((s) => !s.isLab);

    // Type distribution
    const typeCounts = subjects.reduce((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1;
      return acc;
    }, {});

    // Period distribution
    const totalPeriods = subjects.reduce(
      (sum, s) => sum + (s.weeklyPeriods || 0),
      0,
    );
    const avgPeriods =
      subjects.length > 0 ? Math.round(totalPeriods / subjects.length) : 0;

    return {
      total: subjects.length,
      core: coreSubjects.length,
      elective: electiveSubjects.length,
      lab: labSubjects.length,
      nonLab: nonLabSubjects.length,
      typeCounts,
      totalPeriods,
      avgPeriods,
    };
  }, [subjects]);

  // Chart data (component-level, no service)
  const typeDistributionData = useMemo(() => {
    return Object.entries(analytics.typeCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [analytics.typeCounts]);

  const labDistributionData = useMemo(
    () => [
      { name: "Lab Subjects", value: analytics.lab },
      { name: "Non-Lab Subjects", value: analytics.nonLab },
    ],
    [analytics.lab, analytics.nonLab],
  );

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 pb-12"
      >
        <AdminPageHeader
          title="Subjects & Curriculum"
          description="Monitor school syllabus, configure global catalogs, and inspect course streams compatibility."
          breadcrumbs={["Admin Portal", "Academic", "Subjects"]}
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
        title="Subjects & Curriculum"
        description="Monitor school syllabus, configure global catalogs, and inspect course streams compatibility."
        breadcrumbs={["Admin Portal", "Academic", "Subjects"]}
        actionButton={
          <button
            onClick={() => setAddSubjectOpen(true)}
            className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#0096c7] text-white px-5 py-2.5 rounded-2xl shadow-sm text-xs font-black transition-colors"
          >
            <Plus size={16} />
            <span>ADD COURSE CONFIGURATION</span>
          </button>
        }
      />

      {/* Roster Strengths stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <AdminStatCard
          title="Global Academic Courses"
          value={analytics.total.toString()}
          badgeText="Verified Catalog"
          badgeType="success"
          icon={BookOpen}
        />
        <AdminStatCard
          title="Core Subjects"
          value={analytics.core.toString()}
          badgeText="Class Priority"
          badgeType="success"
          icon={BookOpen}
          color="#0096c7"
          bg="#ade8f4"
        />
        <AdminStatCard
          title="Lab Subjects"
          value={analytics.lab.toString()}
          badgeText="Practical"
          badgeType="info"
          icon={BookOpen}
          color="#03045e"
          bg="#e0f2fe"
        />
      </div>



      {/* Roster List in Section */}
      <AdminSectionCard>
        <AcademicFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search subjects by name, code or stream..."
          filterElements={
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none"
            >
              <option value="">Filter Course Type...</option>
              <option value="core">Core Subjects</option>
              <option value="elective">Elective Subjects</option>
            </select>
          }
        />

        <div className="mt-6">
          <AcademicTable
            headers={[
              "Subject Code",
              "Subject Title",
              "Academic Classification",
              "Weekly Periods",
              "Compatible Streams",
              "Room Lab Mapped",
              "Course Status",
            ]}
            items={filteredSubjects}
            isEmpty={filteredSubjects.length === 0}
            emptyTitle="No subjects matched search criteria"
            renderRow={(sub) => (
              <tr
                key={sub.id}
                className="hover:bg-[#caf0f8]/10 transition-colors text-xs text-gray-700 font-bold border-b border-[#caf0f8]/40"
              >
                <td className="py-4 px-3 text-[#03045e] font-black first:pl-2">
                  {sub.code}
                </td>
                <td className="py-4 px-3 text-gray-900 font-extrabold">
                  {sub.name}
                </td>
                <td className="py-4 px-3">
                  <SubjectBadge type={sub.type} name={sub.type} />
                </td>
                <td className="py-4 px-3 text-center">
                  {sub.schedule ? "5 Periods" : "4 Periods"}
                </td>
                <td className="py-4 px-3 text-gray-500 font-semibold">
                  {getSubjectStreamsStr(sub.id)}
                </td>
                <td className="py-4 px-3 text-[#0077b6]">
                  {sub.room || "Room 101"}
                </td>
                <td className="py-4 px-3 last:pr-2">
                  <div className="flex items-center justify-end gap-2">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 uppercase tracking-wider">
                      ACTIVE
                    </span>
                    <button
                      onClick={() => setEditSubject(sub)}
                      className="text-[#0077b6] hover:text-[#03045e] transition-colors p-1.5 hover:bg-[#caf0f8]/40 rounded-lg"
                      title="Edit Subject"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(sub)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                      title="Delete Subject"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          />
        </div>
      </AdminSectionCard>

      {/* Add Subject Modal */}
      <AdminEditForm
        isOpen={addSubjectOpen}
        onClose={() => setAddSubjectOpen(false)}
        title="Add New Subject"
        data={subjectFormDefaults}
        fields={[
          { name: "name", label: "Subject Name", type: "text", required: true },
          { name: "code", label: "Subject Code", type: "text", required: true },
          {
            name: "type",
            label: "Subject Type",
            type: "select",
            options: ["core", "elective"],
            required: true,
          },
          {
            name: "schedule",
            label: "Weekly Schedule",
            type: "select",
            options: [
              { label: "5 Periods", value: true },
              { label: "4 Periods", value: false },
            ],
          },
          { name: "room", label: "Room Assignment", type: "text" },
        ]}
        onSubmit={handleAddSubject}
      />

      {/* Edit Subject Modal */}
      <AdminEditForm
        isOpen={!!editSubject}
        onClose={() => setEditSubject(null)}
        title="Edit Subject"
        data={editSubject}
        fields={[
          { name: "name", label: "Subject Name", type: "text", required: true },
          { name: "code", label: "Subject Code", type: "text", required: true },
          {
            name: "type",
            label: "Subject Type",
            type: "select",
            options: ["core", "elective"],
            required: true,
          },
          {
            name: "schedule",
            label: "Weekly Schedule",
            type: "select",
            options: [
              { label: "5 Periods", value: true },
              { label: "4 Periods", value: false },
            ],
          },
          { name: "room", label: "Room Assignment", type: "text" },
        ]}
        onSubmit={handleUpdateSubject}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.isOpen}
        title="Delete Subject"
        message={`Are you sure you want to delete ${deleteConfirm.subjectName}? This action cannot be undone.`}
        warningText={deleteConfirm.warning}
        onConfirm={handleDeleteConfirm}
        onCancel={() =>
          setDeleteConfirm({
            isOpen: false,
            subjectId: null,
            subjectName: "",
            warning: "",
          })
        }
        confirmButtonText="Delete"
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

export default SubjectsPage;
