import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Filter, ClipboardList } from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminStatCard from "../../components/admin/AdminStatCard";
import AcademicFilterBar from "../../components/admin/academic/AcademicFilterBar";
import AllocationTable from "../../components/admin/academic/AllocationTable";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import AdminEditForm from "../../components/admin/AdminEditForm";
import { getDataProvider } from "../../data";

const SubjectAllocationPage = () => {
  const [allocations, setAllocations] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editAllocation, setEditAllocation] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const provider = getDataProvider();
      const [allAllocations, allTeachers, allSubjects, allClasses] =
        await Promise.all([
          provider.getTeacherSubjectAssignments(),
          provider.getTeachers(),
          provider.getSubjects(),
          provider.getClasses(),
        ]);

      setAllocations(allAllocations || []);
      setTeachers(allTeachers || []);
      setSubjects(allSubjects || []);
      setClasses(allClasses || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAllocation = async (formData) => {
    if (!editAllocation) return;
    try {
      const allocId = editAllocation.id;
      const provider = getDataProvider();
      await provider.updateTeacherSubjectAssignment(allocId, formData);
      const updatedAllocs = await provider.getTeacherSubjectAssignments();
      setAllocations(updatedAllocs || []);
    } catch (e) {
      console.error(e);
    }
  };

  // Helper resolvers for displaying table cells
  const resolvedAllocations = allocations.map((alloc) => {
    const cls = classes.find((c) => c.id === alloc.classId);
    const sub = subjects.find((s) => s.id === alloc.subjectId);
    const teach = teachers.find((t) => t.id === alloc.teacherId);

    return {
      ...alloc,
      className: cls ? cls.name : "Class 11",
      subjectName: sub ? sub.name : "Subject",
      teacherName: teach?.metadata?.name || teach?.name || "Unassigned Faculty",
      room: alloc.room || sub?.room || cls?.room || "Room 101",
    };
  });

  const filteredAllocations = resolvedAllocations.filter((alloc) => {
    const matchesSearch =
      (alloc.teacherName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (alloc.subjectName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesClass =
      selectedClass === "" || alloc.classId === selectedClass;

    return matchesSearch && matchesClass;
  });

  const allocationFields = [
    {
      name: "teacherId",
      label: "Faculty Member Mapped",
      type: "select",
      options: teachers.map((t) => t.id),
    },
    {
      name: "room",
      label: "Assigned Room Location",
      type: "text",
      required: true,
    },
    {
      name: "schedule",
      label: "Teaching Hours Details",
      type: "text",
      required: true,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Subject Teacher Allocation"
        description="Map subject-teaching assignments to specific sections, configure faculty locations, and balance classroom hours."
        breadcrumbs={["Admin Portal", "Academic", "Subject Allocation"]}
        actionButton={
          <button className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#0096c7] text-white px-5 py-2.5 rounded-2xl shadow-sm text-xs font-black transition-colors">
            <Plus size={16} />
            <span>CREATE ALLOCATION</span>
          </button>
        }
      />

      {/* Roster Strengths stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <AdminStatCard
          title="Total Subject Allocations"
          value={allocations.length.toString()}
          badgeText="Active Load"
          badgeType="success"
          icon={ClipboardList}
        />
        <AdminStatCard
          title="Optimal Workload Ratio"
          value="100%"
          badgeText="All Matched"
          badgeType="success"
          icon={ClipboardList}
          color="#0096c7"
          bg="#ade8f4"
        />
        <AdminStatCard
          title="Unassigned Lessons"
          value={allocations.filter((a) => !a.teacherId).length.toString()}
          badgeText="Verification Needed"
          badgeType="neutral"
          icon={ClipboardList}
          color="#03045e"
          bg="#e0f2fe"
        />
      </div>

      {/* Allocations Table */}
      <AdminSectionCard>
        <AcademicFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by teacher name or subject..."
          filterElements={
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="flex items-center gap-2 border border-[#caf0f8] hover:border-[#00b4d8] px-4 py-2.5 rounded-2xl text-xs font-bold text-[#03045e] transition-colors bg-white outline-none"
            >
              <option value="">Filter Section...</option>
              <option value="class-11a">Class 11-A</option>
              <option value="class-11b">Class 11-B</option>
              <option value="class-11c">Class 11-C</option>
              <option value="class-11d">Class 11-D</option>
            </select>
          }
        />

        <div className="mt-6">
          <AllocationTable
            allocations={filteredAllocations}
            onEditAllocation={(alloc) => setEditAllocation(alloc)}
            isEmpty={filteredAllocations.length === 0}
          />
        </div>
      </AdminSectionCard>

      {/* Edit Allocation Modal */}
      <AdminEditForm
        isOpen={!!editAllocation}
        onClose={() => setEditAllocation(null)}
        title="Reallocate Subject Teacher"
        data={editAllocation}
        fields={allocationFields}
        onSubmit={handleUpdateAllocation}
      />
    </motion.div>
  );
};

export default SubjectAllocationPage;
