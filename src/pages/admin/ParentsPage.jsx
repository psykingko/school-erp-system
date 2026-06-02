import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  UserPlus,
  Phone,
  ChevronRight,
  Users,
  GraduationCap,
  UserCircle,
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import AdminStatCard from "../../components/admin/AdminStatCard";
import AdminFilterBar from "../../components/admin/AdminFilterBar";
import AdminDataTable from "../../components/admin/AdminDataTable";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import AdminProfilePreview from "../../components/admin/AdminProfilePreview";
import AdminEditForm from "../../components/admin/AdminEditForm";
import {
  getAllParents,
  updateParentProfile,
} from "../../services/parentService";
import { getDataProvider } from "../../data";

const ParentsPage = () => {
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  // Preview & Edit states
  const [previewParent, setPreviewParent] = useState(null);
  const [editParent, setEditParent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const allParents = await getAllParents();
      const provider = getDataProvider();
      const [allStudents, allClasses] = await Promise.all([
        provider.getStudents(),
        provider.getClasses(),
      ]);
      setParents(allParents || []);
      setStudents(allStudents || []);
      setClasses(allClasses || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateParent = async (formData) => {
    if (!editParent) return;
    try {
      const updated = await updateParentProfile(editParent.id, formData);
      if (updated) {
        setParents((prev) =>
          prev.map((p) => (p.id === editParent.id ? { ...p, ...updated } : p)),
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Build student-centric rows with parent and sibling resolution
  const studentRows = useMemo(() => {
    return students.map((student) => {
      const studentParents = parents.filter((p) =>
        p.childIds?.includes(student.id),
      );
      const primaryParent = studentParents[0] || null;

      // Resolve siblings via shared parents
      const siblingIds = new Set();
      studentParents.forEach((p) => {
        p.childIds?.forEach((cid) => {
          if (cid !== student.id) siblingIds.add(cid);
        });
      });
      const siblings = Array.from(siblingIds)
        .map((id) => students.find((s) => s.id === id))
        .filter(Boolean);

      return {
        student,
        parent: primaryParent,
        allParents: studentParents,
        siblings,
      };
    });
  }, [students, parents]);

  const filteredRows = useMemo(() => {
    let result = studentRows;

    // Filter by grade
    if (selectedGrade) {
      result = result.filter((row) => {
        const studentClass = classes.find((c) => c.id === row.student.classId);
        return studentClass && studentClass.grade.toString() === selectedGrade;
      });
    }

    // Filter by section
    if (selectedSection) {
      result = result.filter((row) => {
        const studentClass = classes.find((c) => c.id === row.student.classId);
        return studentClass && studentClass.section === selectedSection;
      });
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((row) => {
        const stu = row.student;
        const par = row.parent;
        const sibNames = row.siblings
          .map((s) => s.name.toLowerCase())
          .join(" ");
        const sibAdms = row.siblings.map((s) => s.admissionNo).join(" ");

        return (
          term === "" ||
          stu.admissionNo?.toLowerCase().includes(term) ||
          stu.name?.toLowerCase().includes(term) ||
          (par?.name || "").toLowerCase().includes(term) ||
          (par?.occupation || stu.fatherOccupation || "")
            .toLowerCase()
            .includes(term) ||
          (
            par?.phoneNumber ||
            stu.phoneNumber ||
            stu.fatherPhone ||
            ""
          ).includes(term) ||
          sibNames.includes(term) ||
          sibAdms.includes(term)
        );
      });
    }

    return result;
  }, [studentRows, searchTerm, selectedGrade, selectedSection, classes]);

  const getEmptyStateMessage = () => {
    if (searchTerm || selectedGrade || selectedSection) {
      return "No students found for current filters";
    }
    return "No student-parent linkages recorded";
  };

  // Extract unique grades and sections for filters
  const uniqueGrades = useMemo(() => {
    const grades = new Set(
      classes.map((c) => c.grade?.toString()).filter(Boolean)
    );
    return Array.from(grades).sort((a, b) => {
      if (a === "0") return -1;
      if (b === "0") return 1;
      return parseInt(a) - parseInt(b);
    });
  }, [classes]);

  const uniqueSections = useMemo(() => {
    const sections = new Set(classes.map((c) => c.section));
    return Array.from(sections).sort();
  }, [classes]);

  const parentFields = [
    { name: "name", label: "Parent Full Name", type: "text", required: true },
    {
      name: "phoneNumber",
      label: "Primary Phone Number",
      type: "text",
      required: true,
    },
    { name: "email", label: "Email Address", type: "email", required: true },
    { name: "occupation", label: "Occupation / Profession", type: "text" },
    {
      name: "alternatePhone",
      label: "Alternate Emergency Contact",
      type: "text",
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
        title="Parent Mappings Directory"
        description="Monitor parental linkages, verify emergency contact information, and audit multi-child configurations."
        breadcrumbs={["Admin Portal", "User Management", "Parents"]}
        actionButton={
          <button className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#0096c7] text-white px-5 py-2.5 rounded-2xl shadow-sm text-xs font-black transition-colors">
            <UserPlus size={16} />
            <span>MAP NEW PARENT</span>
          </button>
        }
      />

      {/* Stats Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <AdminStatCard
          title="Enrolled Students"
          value={students.length.toString()}
          badgeText="Active Registry"
          badgeType="success"
          icon={Users}
        />
        <AdminStatCard
          title="Students with Siblings"
          value={studentRows
            .filter((r) => r.siblings.length > 0)
            .length.toString()}
          badgeText="Family Links"
          badgeType="info"
          icon={Users}
          color="#0096c7"
          bg="#ade8f4"
        />
        <AdminStatCard
          title="Parent Coverage"
          value={`${Math.round(
            (students.filter((s) => s.parentIds?.length > 0).length /
              Math.max(students.length, 1)) *
              100,
          )}%`}
          badgeText="Fully Mapped"
          badgeType="success"
          icon={Users}
          color="#03045e"
          bg="#e0f2fe"
        />
      </div>

      {/* Directory Table inside Section Card */}
      <AdminSectionCard>
        {/* Search bar */}
        <AdminFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by Adm No., student name, parent, contact..."
          additionalControls={
            <div className="flex items-center gap-2">
              {/* Grade Filter */}
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="px-3 py-2.5 rounded-2xl bg-[#caf0f8]/20 border border-[#caf0f8]/50 text-xs text-gray-700 font-bold focus:outline-none focus:border-[#0077b6] cursor-pointer"
              >
                <option value="">All Grades</option>
                {uniqueGrades.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade === "0" ? "Nursery/LKG/UKG" : `Class ${grade}`}
                  </option>
                ))}
              </select>

              {/* Section Filter */}
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="px-3 py-2.5 rounded-2xl bg-[#caf0f8]/20 border border-[#caf0f8]/50 text-xs text-gray-700 font-bold focus:outline-none focus:border-[#0077b6] cursor-pointer"
              >
                <option value="">All Sections</option>
                {uniqueSections.map((section) => (
                  <option key={section} value={section}>
                    Section {section}
                  </option>
                ))}
              </select>

              {/* Clear Filters Button */}
              {(selectedGrade || selectedSection) && (
                <button
                  onClick={() => {
                    setSelectedGrade("");
                    setSelectedSection("");
                  }}
                  className="px-3 py-2.5 rounded-2xl bg-[#0077b6] hover:bg-[#0096c7] text-white text-xs font-bold transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          }
        />

        {/* Modular Table Shell */}
        <div className="mt-6">
          <AdminDataTable
            headers={[
              "Admission No.",
              "Student Name",
              "Parent Name",
              "Occupation",
              "Primary Contact",
              "Actions",
            ]}
            items={filteredRows}
            isEmpty={filteredRows.length === 0}
            emptyTitle={getEmptyStateMessage()}
            renderRow={(row) => {
              const stu = row.student;
              const par = row.parent;
              const previewData = {
                name: stu.name,
                id: stu.admissionNo,
                status: "Active",
                email: par?.email,
                phone: par?.phoneNumber || stu.phoneNumber || stu.fatherPhone,
                occupation: par?.occupation || stu.fatherOccupation,
                alternatePhone: par?.alternatePhone,
                student: stu,
                parent: par,
                siblings: row.siblings,
              };
              return (
                <tr
                  key={stu.id}
                  className="hover:bg-[#caf0f8]/10 transition-colors text-xs text-gray-700 font-bold"
                >
                  <td className="py-4 px-3 first:pl-2">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-[#03045e] text-white">
                        <GraduationCap size={14} />
                      </span>
                      <span className="font-black text-[#03045e] text-sm tracking-tight">
                        {stu.admissionNo}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-[#caf0f8] text-[#03045e]">
                        <UserCircle size={14} />
                      </span>
                      <span className="font-extrabold text-[#03045e]">
                        {stu.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <button
                      onClick={() => setPreviewParent(previewData)}
                      className="hover:text-[#0077b6] text-left transition-colors font-extrabold focus:outline-none"
                    >
                      {par?.name || "—"}
                    </button>
                  </td>
                  <td className="py-4 px-3 text-gray-500 font-semibold">
                    {par?.occupation || stu.fatherOccupation || "—"}
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                      <Phone size={10} />
                      <span>
                        {par?.phoneNumber ||
                          stu.phoneNumber ||
                          stu.fatherPhone ||
                          "—"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-right last:pr-2">
                    <button
                      onClick={() => setPreviewParent(previewData)}
                      className="text-[#0077b6] hover:text-[#03045e] transition-colors p-1.5 hover:bg-[#caf0f8]/40 rounded-lg"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              );
            }}
          />
        </div>
      </AdminSectionCard>

      {/* Sliding Profile Drawer */}
      <AdminProfilePreview
        isOpen={!!previewParent}
        onClose={() => setPreviewParent(null)}
        type="parent"
        data={previewParent}
        onEdit={(parentData) => setEditParent(parentData)}
      />

      {/* Centred Edit Modal */}
      <AdminEditForm
        isOpen={!!editParent}
        onClose={() => setEditParent(null)}
        title="Edit Parent Record"
        data={editParent}
        fields={parentFields}
        onSubmit={handleUpdateParent}
      />
    </motion.div>
  );
};

export default ParentsPage;
