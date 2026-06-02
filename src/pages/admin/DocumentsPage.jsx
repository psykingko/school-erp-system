import { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Users,
  UserCircle,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  Download,
  Upload,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  MoreHorizontal,
  CheckSquare,
  X,
  ClipboardCheck,
} from "lucide-react";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import OperationsStatCard from "../../components/admin/operations/OperationsStatCard";
import AdminSectionCard from "../../components/admin/AdminSectionCard";
import { getDataProvider } from "../../data";

// ─── Teacher Document Types (Static) ─────────────────────────────────────────
const TEACHER_DOCUMENT_TYPES = [
  {
    id: "aadhaar",
    label: "Aadhaar Card",
    category: "identity",
    isMandatory: true,
  },
  {
    id: "pan_card",
    label: "PAN Card",
    category: "identity",
    isMandatory: true,
  },
  {
    id: "degree_certificate",
    label: "Degree Certificate",
    category: "academic",
    isMandatory: true,
  },
  {
    id: "b_ed_certificate",
    label: "B.Ed Certificate",
    category: "academic",
    isMandatory: true,
  },
  {
    id: "experience_certificate",
    label: "Experience Certificate",
    category: "professional",
    isMandatory: false,
  },
  {
    id: "police_verification",
    label: "Police Verification",
    category: "administrative",
    isMandatory: true,
  },
  {
    id: "medical_certificate",
    label: "Medical Fitness Certificate",
    category: "health",
    isMandatory: true,
  },
];

// ─── Student Document Type Master ────────────────────────────────────────────
const STUDENT_DOCUMENT_TYPES = [
  {
    id: "aadhaar",
    label: "Aadhaar Card",
    category: "identity",
    isMandatory: true,
  },
  {
    id: "birth_certificate",
    label: "Birth Certificate",
    category: "identity",
    isMandatory: true,
  },
  {
    id: "transfer_certificate",
    label: "Transfer Certificate (TC)",
    category: "administrative",
    isMandatory: true,
  },
  {
    id: "character_certificate",
    label: "Character Certificate",
    category: "administrative",
    isMandatory: false,
  },
  {
    id: "previous_marksheet",
    label: "Previous Class Marksheet",
    category: "academic",
    isMandatory: true,
  },
  {
    id: "passport_photo",
    label: "Passport Size Photo",
    category: "identity",
    isMandatory: true,
  },
  {
    id: "medical_certificate",
    label: "Medical Fitness Certificate",
    category: "medical",
    isMandatory: false,
  },
  {
    id: "caste_certificate",
    label: "Caste Certificate (if applicable)",
    category: "administrative",
    isMandatory: false,
  },
  {
    id: "income_certificate",
    label: "Income Certificate",
    category: "administrative",
    isMandatory: false,
  },
  {
    id: "migration_certificate",
    label: "Migration Certificate",
    category: "academic",
    isMandatory: false,
  },
];

const STUDENT_CATEGORY_LABEL = {
  identity: "Identity",
  academic: "Academic",
  administrative: "Administrative",
  medical: "Medical",
  extracurricular: "Extracurricular",
};

const TEACHER_CATEGORY_LABEL = {
  identity: "Identity",
  academic: "Academic",
  professional: "Professional",
  security: "Security",
  medical: "Medical",
  administrative: "Administrative",
  financial: "Financial",
};

const STATUS_CONFIG = {
  verified: { label: "Verified", color: "emerald", icon: CheckCircle },
  pending: { label: "Pending", color: "amber", icon: Clock },
  missing: { label: "Missing", color: "rose", icon: XCircle },
  rejected: { label: "Rejected", color: "red", icon: AlertCircle },
  expired: { label: "Expired", color: "red", icon: AlertCircle },
  reupload: { label: "Re-upload", color: "amber", icon: Clock },
};

// ─── Helper: Build student checklist from documents ───────────────────────────
const buildStudentChecklist = (students, documents, classes) => {
  return students.map((student) => {
    const cls = classes.find((c) => c.id === student.classId);
    const studentDocs = documents.filter((d) => d.studentId === student.id);

    const checklist = STUDENT_DOCUMENT_TYPES.map((type) => {
      const doc = studentDocs.find((d) => d.documentTypeId === type.id);
      return {
        ...type,
        status: doc?.status || "missing",
        uploadDate: doc?.uploadDate || null,
        fileSize: doc?.fileSize || null,
        docId: doc?.id || null,
        remarks: doc?.remarks || "",
      };
    });

    const totalRequired = checklist.filter((c) => c.isMandatory).length;
    const verifiedRequired = checklist.filter(
      (c) => c.isMandatory && c.status === "verified",
    ).length;
    const totalDocs = checklist.length;
    const verifiedDocs = checklist.filter(
      (c) => c.status === "verified",
    ).length;
    const pendingDocs = checklist.filter((c) => c.status === "pending").length;
    const missingDocs = checklist.filter((c) => c.status === "missing").length;

    return {
      studentId: student.id,
      admissionNo: student.admissionNo || student.id,
      studentName: student.name,
      className: cls ? `${cls.level}-${cls.section}` : "N/A",
      classLevel: cls?.level || "",
      section: cls?.section || "",
      checklist,
      stats: {
        totalRequired,
        verifiedRequired,
        totalDocs,
        verifiedDocs,
        pendingDocs,
        missingDocs,
        completionRate:
          totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0,
        isComplete: verifiedRequired >= totalRequired && totalRequired > 0,
      },
    };
  });
};

// ─── StatusBadge Component ───────────────────────────────────────────────────
const StatusBadge = ({ status, size = "sm" }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.missing;
  const Icon = config.icon;
  const sizeClasses =
    size === "xs" ? "px-1.5 py-0.5 text-[9px]" : "px-2.5 py-1 text-[10px]";

  const colorClasses = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
    red: "bg-red-50 border-red-200 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 border rounded-md font-black uppercase tracking-wide ${sizeClasses} ${colorClasses[config.color]}`}
    >
      <Icon size={size === "xs" ? 10 : 12} />
      {config.label}
    </span>
  );
};

// ─── StudentRow Component (Collapsible) ──────────────────────────────────────
const StudentChecklistRow = ({
  student,
  onVerify,
  onReject,
  selected,
  onSelect,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-2 border-slate-100 rounded-2xl overflow-hidden mb-3">
      {/* Header Row */}
      <div
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
          expanded ? "bg-sky-50/50" : "bg-white hover:bg-slate-50"
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(!selected);
          }}
          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            selected
              ? "bg-[#0077b6] border-[#0077b6]"
              : "border-slate-300 hover:border-[#0077b6]"
          }`}
        >
          {selected && <CheckSquare size={12} className="text-white" />}
        </button>

        <div className="flex-shrink-0">
          {expanded ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-black text-[#03045e] truncate">
              {student.studentName}
            </h4>
            <span className="text-[10px] font-bold text-slate-400">
              {student.admissionNo}
            </span>
            {student.stats.isComplete ? (
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Complete
              </span>
            ) : (
              <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                {student.stats.missingDocs} Missing
              </span>
            )}
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">
            Class {student.className} · {student.stats.verifiedRequired}/
            {student.stats.totalRequired} Required ·{" "}
            {student.stats.completionRate}% Complete
          </p>
        </div>

        {/* Progress Bar */}
        <div className="hidden sm:flex items-center gap-2 w-48">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                student.stats.completionRate === 100
                  ? "bg-emerald-500"
                  : "bg-[#0077b6]"
              }`}
              style={{ width: `${student.stats.completionRate}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-slate-500 w-8 text-right">
            {student.stats.completionRate}%
          </span>
        </div>
      </div>

      {/* Expanded Checklist */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {student.checklist.map((doc) => (
              <div
                key={doc.id}
                className={`bg-white border-2 rounded-xl p-3 ${
                  doc.status === "missing"
                    ? "border-rose-200"
                    : doc.status === "verified"
                      ? "border-emerald-200"
                      : "border-amber-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wide">
                      {STUDENT_CATEGORY_LABEL[doc.category]}
                    </p>
                    <h5
                      className="text-xs font-black text-[#03045e] mt-0.5 truncate"
                      title={doc.label}
                    >
                      {doc.label}
                    </h5>
                    {doc.isMandatory && (
                      <span className="inline-block mt-1 text-[8px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
                        REQUIRED
                      </span>
                    )}
                  </div>
                  <StatusBadge status={doc.status} size="xs" />
                </div>

                {doc.status !== "missing" && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold">
                      {doc.fileSize || "—"}
                    </p>
                    {doc.uploadDate && (
                      <p className="text-[9px] text-slate-400">
                        {doc.uploadDate}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-2 flex items-center gap-2">
                  {doc.status === "pending" && (
                    <>
                      <button
                        onClick={() => onVerify(student.studentId, doc.id)}
                        className="flex-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-2 py-1 rounded-lg text-[9px] font-black transition-colors"
                      >
                        <CheckCircle size={10} className="inline mr-1" /> Verify
                      </button>
                      <button
                        onClick={() => onReject(student.studentId, doc.id)}
                        className="flex-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-2 py-1 rounded-lg text-[9px] font-black transition-colors"
                      >
                        <XCircle size={10} className="inline mr-1" /> Reject
                      </button>
                    </>
                  )}
                  {doc.status === "verified" && (
                    <button className="w-full flex items-center justify-center gap-1 text-[9px] font-black text-[#0077b6] hover:bg-sky-50 border border-transparent hover:border-sky-200 px-2 py-1 rounded-lg transition-colors">
                      <Download size={10} /> Download
                    </button>
                  )}
                  {doc.status === "missing" && (
                    <button className="w-full flex items-center justify-center gap-1 text-[9px] font-black text-slate-500 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg transition-colors">
                      <Upload size={10} /> Upload
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── TeacherChecklistRow Component (for Employee/Teacher documents) ────────────
const TeacherChecklistRow = ({
  teacher,
  onVerify,
  onReject,
  selected,
  onSelect,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-2 border-slate-100 rounded-2xl overflow-hidden mb-3">
      {/* Header Row */}
      <div
        className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
          expanded ? "bg-sky-50/50" : "bg-white hover:bg-slate-50"
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(!selected);
          }}
          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            selected
              ? "bg-[#0077b6] border-[#0077b6]"
              : "border-slate-300 hover:border-[#0077b6]"
          }`}
        >
          {selected && <CheckSquare size={12} className="text-white" />}
        </button>

        <div className="flex-shrink-0">
          {expanded ? (
            <ChevronUp size={16} className="text-slate-400" />
          ) : (
            <ChevronDown size={16} className="text-slate-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-black text-[#03045e] truncate">
              {teacher.teacherName}
            </h4>
            <span className="text-[10px] font-bold text-slate-400">
              {teacher.employeeId}
            </span>
            {teacher.stats.isComplete ? (
              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Complete
              </span>
            ) : (
              <span className="text-[9px] font-black text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                {teacher.stats.missingDocs} Missing
              </span>
            )}
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-0.5">
            {teacher.designation} · {teacher.department} ·{" "}
            {teacher.stats.verifiedRequired}/{teacher.stats.totalRequired}{" "}
            Required · {teacher.stats.completionRate}% Complete
          </p>
        </div>

        {/* Progress Bar */}
        <div className="hidden sm:flex items-center gap-2 w-48">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                teacher.stats.completionRate === 100
                  ? "bg-emerald-500"
                  : "bg-[#0077b6]"
              }`}
              style={{ width: `${teacher.stats.completionRate}%` }}
            />
          </div>
          <span className="text-[10px] font-black text-slate-500 w-8 text-right">
            {teacher.stats.completionRate}%
          </span>
        </div>
      </div>

      {/* Expanded Checklist */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-3 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {teacher.checklist.map((doc) => (
              <div
                key={doc.id}
                className={`bg-white border-2 rounded-xl p-3 ${
                  doc.status === "missing"
                    ? "border-rose-200"
                    : doc.status === "verified"
                      ? "border-emerald-200"
                      : "border-amber-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wide">
                      {TEACHER_CATEGORY_LABEL[doc.category]}
                    </p>
                    <h5
                      className="text-xs font-black text-[#03045e] mt-0.5 truncate"
                      title={doc.label}
                    >
                      {doc.label}
                    </h5>
                    {doc.isMandatory && (
                      <span className="inline-block mt-1 text-[8px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
                        REQUIRED
                      </span>
                    )}
                  </div>
                  <StatusBadge status={doc.status} size="xs" />
                </div>

                {doc.status !== "missing" && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <p className="text-[9px] text-slate-400 font-bold">
                      {doc.fileSize || "—"}
                    </p>
                    {doc.uploadDate && (
                      <p className="text-[9px] text-slate-400">
                        {doc.uploadDate}
                      </p>
                    )}
                  </div>
                )}

                <div className="mt-2 flex items-center gap-2">
                  {doc.status === "pending" && (
                    <>
                      <button
                        onClick={() => onVerify(teacher.teacherId, doc.id)}
                        className="flex-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-2 py-1 rounded-lg text-[9px] font-black transition-colors"
                      >
                        <CheckCircle size={10} className="inline mr-1" /> Verify
                      </button>
                      <button
                        onClick={() => onReject(teacher.teacherId, doc.id)}
                        className="flex-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 px-2 py-1 rounded-lg text-[9px] font-black transition-colors"
                      >
                        <XCircle size={10} className="inline mr-1" /> Reject
                      </button>
                    </>
                  )}
                  {doc.status === "verified" && (
                    <button className="w-full flex items-center justify-center gap-1 text-[9px] font-black text-[#0077b6] hover:bg-sky-50 border border-transparent hover:border-sky-200 px-2 py-1 rounded-lg transition-colors">
                      <Download size={10} /> Download
                    </button>
                  )}
                  {doc.status === "missing" && (
                    <button className="w-full flex items-center justify-center gap-1 text-[9px] font-black text-slate-500 hover:bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg transition-colors">
                      <Upload size={10} /> Upload
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Helper: Build teacher checklist from documents ───────────────────────────
const buildTeacherChecklist = (teachers, documents) => {
  return teachers.map((teacher) => {
    const teacherDocs = documents.filter((d) => d.teacherId === teacher.id);

    const checklist = TEACHER_DOCUMENT_TYPES.map((type) => {
      const doc = teacherDocs.find((d) => d.documentTypeId === type.id);
      return {
        ...type,
        status: doc?.status || "missing",
        uploadDate: doc?.uploadDate || null,
        fileSize: doc?.fileSize || null,
        docId: doc?.id || null,
        remarks: doc?.remarks || "",
      };
    });

    const totalRequired = checklist.filter((c) => c.isMandatory).length;
    const verifiedRequired = checklist.filter(
      (c) => c.isMandatory && c.status === "verified",
    ).length;
    const totalDocs = checklist.length;
    const verifiedDocs = checklist.filter(
      (c) => c.status === "verified",
    ).length;
    const pendingDocs = checklist.filter((c) => c.status === "pending").length;
    const missingDocs = checklist.filter((c) => c.status === "missing").length;

    return {
      teacherId: teacher.id,
      employeeId: teacher.employeeId || teacher.id,
      teacherName: teacher.name,
      designation: teacher.designation || "Teacher",
      department: teacher.department || "Academic",
      checklist,
      stats: {
        totalRequired,
        verifiedRequired,
        totalDocs,
        verifiedDocs,
        pendingDocs,
        missingDocs,
        completionRate:
          totalDocs > 0 ? Math.round((verifiedDocs / totalDocs) * 100) : 0,
        isComplete: verifiedRequired >= totalRequired && totalRequired > 0,
      },
    };
  });
};

// ─── Missing Documents Report Component ──────────────────────────────────────
const MissingDocsReport = ({ checklist, onClose, entityType = "students" }) => {
  const isStudents = entityType === "students";
  const missingItems = useMemo(() => {
    const items = [];
    checklist.forEach((item) => {
      item.checklist
        .filter((c) => c.status === "missing" && c.isMandatory)
        .forEach((doc) => {
          items.push({
            id: isStudents ? item.studentId : item.teacherId,
            name: isStudents ? item.studentName : item.teacherName,
            idLabel: isStudents ? item.admissionNo : item.employeeId,
            group: isStudents ? item.className : item.department || "General",
            documentType: doc.label,
            category: doc.category,
          });
        });
    });
    return items.sort(
      (a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name),
    );
  }, [checklist, isStudents]);

  const byGroup = useMemo(() => {
    const map = {};
    missingItems.forEach((item) => {
      if (!map[item.group]) map[item.group] = [];
      map[item.group].push(item);
    });
    return map;
  }, [missingItems]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-[#03045e]">
              Missing Required Documents
            </h3>
            <p className="text-xs text-slate-400 font-bold">
              {missingItems.length} items pending across{" "}
              {Object.keys(byGroup).length}{" "}
              {isStudents ? "classes" : "departments"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {missingItems.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle
                size={48}
                className="mx-auto text-emerald-500 mb-3"
              />
              <h4 className="text-sm font-black text-[#03045e]">
                All Caught Up!
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                No missing required documents found.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(byGroup).map(([groupName, items]) => (
                <div key={groupName}>
                  <h4 className="text-xs font-black text-[#0077b6] uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="bg-[#0077b6]/10 px-2 py-1 rounded">
                      {isStudents ? "Class" : "Dept"} {groupName}
                    </span>
                    <span className="text-slate-400">({items.length})</span>
                  </h4>
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100/50">
                        <tr>
                          <th className="text-left px-4 py-2 font-black text-slate-500">
                            {isStudents ? "Student" : "Employee"}
                          </th>
                          <th className="text-left px-4 py-2 font-black text-slate-500">
                            Document Required
                          </th>
                          <th className="text-left px-4 py-2 font-black text-slate-500">
                            Category
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map((item, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-white transition-colors"
                          >
                            <td className="px-4 py-2">
                              <p className="font-bold text-[#03045e]">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {item.idLabel}
                              </p>
                            </td>
                            <td className="px-4 py-2">
                              <span className="inline-flex items-center gap-1 text-rose-600 font-bold">
                                <AlertCircle size={12} /> {item.documentType}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-100 px-2 py-1 rounded">
                                {
                                  (isStudents
                                    ? STUDENT_CATEGORY_LABEL
                                    : TEACHER_CATEGORY_LABEL)[item.category]
                                }
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t border-slate-100 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#0077b6] hover:bg-[#0096c7] text-white px-6 py-2.5 rounded-xl text-xs font-black transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Documents Page ─────────────────────────────────────────────────────
const DocumentsPage = () => {
  // Entity Type: 'students' or 'teachers'
  const [entityType, setEntityType] = useState("students");

  // Student Data
  const [documents, setDocuments] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  // Teacher Data
  const [teacherDocuments, setTeacherDocuments] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [loading, setLoading] = useState(true);

  // View State
  const [activeView, setActiveView] = useState("checklist"); // checklist | bytype | recent
  const [showMissingReport, setShowMissingReport] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Success Notification
  const [successBanner, setSuccessBanner] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const provider = getDataProvider();
      const [allDocs, allStudents, allClasses, allTeacherDocs, allTeachers] =
        await Promise.all([
          provider.getDocuments(),
          provider.getStudents(),
          provider.getClasses(),
          provider.getTeacherDocuments(),
          provider.getTeachers(),
        ]);
      setDocuments(allDocs || []);
      setStudents(allStudents || []);
      setClasses(allClasses || []);
      setTeacherDocuments(allTeacherDocs || []);
      setTeachers(allTeachers || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Build checklists based on entity type
  const studentChecklist = useMemo(
    () => buildStudentChecklist(students, documents, classes),
    [students, documents, classes],
  );

  const teacherChecklist = useMemo(
    () => buildTeacherChecklist(teachers, teacherDocuments),
    [teachers, teacherDocuments],
  );

  const currentChecklist =
    entityType === "students" ? studentChecklist : teacherChecklist;
  const currentDocuments =
    entityType === "students" ? documents : teacherDocuments;
  const currentEntityCount =
    entityType === "students" ? students.length : teachers.length;

  // Filtered checklist
  const filteredChecklist = useMemo(() => {
    return currentChecklist.filter((item) => {
      const nameField =
        entityType === "students" ? item.studentName : item.teacherName;
      const idField =
        entityType === "students" ? item.admissionNo : item.employeeId;
      const matchesSearch =
        nameField.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idField.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass =
        entityType === "teachers" ||
        selectedClass === "" ||
        item.className === selectedClass;
      const matchesStatus =
        selectedStatus === "" ||
        (selectedStatus === "complete" && item.stats.isComplete) ||
        (selectedStatus === "incomplete" && !item.stats.isComplete) ||
        (selectedStatus === "missing" && item.stats.missingDocs > 0) ||
        (selectedStatus === "pending" && item.stats.pendingDocs > 0);
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [currentChecklist, searchTerm, selectedClass, selectedStatus, entityType]);

  // Stats
  const stats = useMemo(() => {
    const totalEntities =
      entityType === "students" ? students.length : teachers.length;
    const completeEntities = currentChecklist.filter(
      (s) => s.stats.isComplete,
    ).length;
    const totalDocs = currentDocuments.filter(
      (d) => d.status !== "missing",
    ).length;
    const verifiedDocs = currentDocuments.filter(
      (d) => d.status === "verified",
    ).length;
    const pendingDocs = currentDocuments.filter(
      (d) => d.status === "pending",
    ).length;
    const missingMandatory = currentChecklist.reduce(
      (sum, s) =>
        sum +
        s.checklist.filter((c) => c.isMandatory && c.status === "missing")
          .length,
      0,
    );
    return {
      totalEntities,
      completeEntities,
      completionRate:
        totalEntities > 0
          ? Math.round((completeEntities / totalEntities) * 100)
          : 0,
      totalDocs,
      verifiedDocs,
      pendingDocs,
      missingMandatory,
    };
  }, [students, teachers, currentChecklist, currentDocuments, entityType]);

  // Handlers
  const handleVerify = useCallback((_studentId, _docTypeId) => {
    setSuccessBanner("Document verified successfully");
    setTimeout(() => setSuccessBanner(""), 3000);
  }, []);

  const handleReject = useCallback((_studentId, _docTypeId) => {
    setSuccessBanner("Document rejected with remarks");
    setTimeout(() => setSuccessBanner(""), 3000);
  }, []);

  const handleSelectItem = useCallback((itemId, selected) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (selected) next.add(itemId);
      else next.delete(itemId);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    const idField = entityType === "students" ? "studentId" : "teacherId";
    if (selectedItems.size === filteredChecklist.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredChecklist.map((s) => s[idField])));
    }
  }, [filteredChecklist, selectedItems.size, entityType]);

  // Available classes for filter
  const availableClasses = useMemo(() => {
    if (entityType === "teachers") return [];
    const seen = new Set(studentChecklist.map((s) => s.className));
    return [...seen].sort();
  }, [studentChecklist, entityType]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-12"
    >
      <AdminPageHeader
        title="Document Management Center"
        description="Track student document checklists, verify uploads, and manage institutional records."
        breadcrumbs={["Admin Portal", "Operations", "Documents"]}
        actionButton={
          <button
            onClick={() => setShowMissingReport(true)}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-2xl shadow-sm text-xs font-black transition-colors"
          >
            <AlertCircle size={16} />
            <span>Missing Docs Report ({stats.missingMandatory})</span>
          </button>
        }
      />

      {/* Success Banner */}
      {successBanner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-xs font-black shadow-sm flex items-center gap-2"
        >
          <CheckCircle size={16} /> {successBanner}
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OperationsStatCard
          title="Document Completion"
          value={`${stats.completionRate}%`}
          description={`${stats.completeEntities}/${stats.totalEntities} ${entityType === "students" ? "students" : "teachers"} complete`}
          icon={ClipboardCheck}
          color="#0077b6"
          bg="#caf0f8"
        />
        <OperationsStatCard
          title="Verified Documents"
          value={stats.verifiedDocs.toString()}
          description={`${Math.round((stats.verifiedDocs / Math.max(stats.totalDocs, 1)) * 100)}% of uploaded`}
          icon={CheckCircle}
          color="#10b981"
          bg="#d1fae5"
        />
        <OperationsStatCard
          title="Pending Verification"
          value={stats.pendingDocs.toString()}
          description="Awaiting admin review"
          icon={Clock}
          color="#f59e0b"
          bg="#fef3c7"
        />
        <OperationsStatCard
          title="Missing Required"
          value={stats.missingMandatory.toString()}
          description="Documents not uploaded"
          icon={AlertCircle}
          color="#ef4444"
          bg="#fee2e2"
        />
      </div>

      {/* Entity Type Switcher */}
      <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => {
            setEntityType("students");
            setSelectedItems(new Set());
            setSearchTerm("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            entityType === "students"
              ? "bg-[#0077b6] text-white shadow-sm"
              : "text-slate-500 hover:text-[#0077b6] hover:bg-white"
          }`}
        >
          <Users size={14} />
          Student Documents
        </button>
        <button
          onClick={() => {
            setEntityType("teachers");
            setSelectedItems(new Set());
            setSearchTerm("");
            setSelectedClass("");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            entityType === "teachers"
              ? "bg-[#0077b6] text-white shadow-sm"
              : "text-slate-500 hover:text-[#0077b6] hover:bg-white"
          }`}
        >
          <UserCircle size={14} />
          Teacher/Employee Documents
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-slate-100">
        {[
          {
            id: "checklist",
            label:
              entityType === "students"
                ? "Student Checklist"
                : "Employee Checklist",
            icon: Users,
          },
          { id: "bytype", label: "By Document Type", icon: FileText },
          { id: "recent", label: "Recent Uploads", icon: Clock },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-black transition-colors border-b-2 -mb-0.5 ${
              activeView === tab.id
                ? "border-[#0077b6] text-[#0077b6]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters Bar */}
      <AdminSectionCard>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                entityType === "students"
                  ? "Search by student name or admission no..."
                  : "Search by employee name or ID..."
              }
              className="w-full pl-9 pr-4 py-2.5 border-2 border-slate-100 rounded-xl text-xs font-bold text-[#03045e] placeholder:text-slate-400 outline-none focus:border-[#0077b6] transition-colors"
            />
          </div>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="border-2 border-slate-100 hover:border-[#0077b6] px-4 py-2.5 rounded-xl text-xs font-bold text-[#03045e] outline-none transition-colors bg-white"
          >
            <option value="">All Classes</option>
            {availableClasses.map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border-2 border-slate-100 hover:border-[#0077b6] px-4 py-2.5 rounded-xl text-xs font-bold text-[#03045e] outline-none transition-colors bg-white"
          >
            <option value="">All Status</option>
            <option value="complete">Complete</option>
            <option value="incomplete">Incomplete</option>
            <option value="missing">Has Missing Docs</option>
            <option value="pending">Has Pending Review</option>
          </select>

          {(searchTerm || selectedClass || selectedStatus) && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedClass("");
                setSelectedStatus("");
              }}
              className="flex items-center gap-1.5 text-rose-500 hover:bg-rose-50 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
            >
              <X size={14} /> Clear Filters
            </button>
          )}

          <div className="flex-1" />

          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 border-2 border-[#0077b6]/20 hover:border-[#0077b6] hover:bg-[#caf0f8]/30 text-[#0077b6] px-4 py-2.5 rounded-xl text-xs font-black transition-colors"
          >
            {selectedItems.size === filteredChecklist.length &&
            filteredChecklist.length > 0 ? (
              <>
                <CheckSquare size={14} /> Deselect All
              </>
            ) : (
              <>
                <ClipboardCheck size={14} /> Select All (
                {filteredChecklist.length})
              </>
            )}
          </button>

          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2 bg-[#0077b6]/10 px-3 py-2 rounded-xl">
              <span className="text-xs font-black text-[#0077b6]">
                {selectedItems.size} selected
              </span>
              <button className="text-[10px] font-black text-white bg-[#0077b6] hover:bg-[#0096c7] px-2 py-1 rounded transition-colors">
                Bulk Verify
              </button>
              <button className="text-[10px] font-black text-white bg-slate-400 hover:bg-slate-500 px-2 py-1 rounded transition-colors">
                Download
              </button>
            </div>
          )}
        </div>
      </AdminSectionCard>

      {/* Content Area */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-3 border-[#0077b6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-400">
            Loading document records...
          </p>
        </div>
      ) : activeView === "checklist" ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-400">
              Showing {filteredChecklist.length} of {currentChecklist.length}{" "}
              {entityType === "students" ? "students" : "employees"}
            </p>
          </div>

          {filteredChecklist.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-slate-100">
              <FileText size={48} className="mx-auto text-slate-300 mb-3" />
              <h4 className="text-sm font-black text-[#03045e]">
                {entityType === "students"
                  ? "No Students Found"
                  : "No Employees Found"}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Adjust filters to see more results.
              </p>
            </div>
          ) : (
            <div>
              {entityType === "students"
                ? filteredChecklist.map((student) => (
                    <StudentChecklistRow
                      key={student.studentId}
                      student={student}
                      selected={selectedItems.has(student.studentId)}
                      onSelect={(sel) =>
                        handleSelectItem(student.studentId, sel)
                      }
                      onVerify={handleVerify}
                      onReject={handleReject}
                    />
                  ))
                : filteredChecklist.map((teacher) => (
                    <TeacherChecklistRow
                      key={teacher.teacherId}
                      teacher={teacher}
                      selected={selectedItems.has(teacher.teacherId)}
                      onSelect={(sel) =>
                        handleSelectItem(teacher.teacherId, sel)
                      }
                      onVerify={handleVerify}
                      onReject={handleReject}
                    />
                  ))}
            </div>
          )}
        </div>
      ) : activeView === "bytype" ? (
        <AdminSectionCard>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(entityType === "students"
              ? STUDENT_DOCUMENT_TYPES
              : TEACHER_DOCUMENT_TYPES
            ).map((type) => {
              const count = currentDocuments.filter(
                (d) => d.documentTypeId === type.id,
              ).length;
              const verified = currentDocuments.filter(
                (d) => d.documentTypeId === type.id && d.status === "verified",
              ).length;
              const pending = currentDocuments.filter(
                (d) => d.documentTypeId === type.id && d.status === "pending",
              ).length;
              const missing = currentEntityCount - count;
              const categoryLabel =
                entityType === "students"
                  ? STUDENT_CATEGORY_LABEL[type.category]
                  : TEACHER_CATEGORY_LABEL[type.category];

              return (
                <div
                  key={type.id}
                  className="border-2 border-slate-100 rounded-2xl p-4 hover:border-[#0077b6]/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wide">
                        {categoryLabel}
                      </p>
                      <h4 className="text-sm font-black text-[#03045e] mt-0.5">
                        {type.label}
                      </h4>
                      {type.isMandatory && (
                        <span className="inline-block mt-1 text-[8px] font-black text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
                          REQUIRED
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-[#0077b6]">
                        {count}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400">
                        uploaded
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[10px]">
                    <span className="flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle size={10} /> {verified}
                    </span>
                    <span className="flex items-center gap-1 text-amber-600 font-bold">
                      <Clock size={10} /> {pending}
                    </span>
                    <span className="flex items-center gap-1 text-rose-600 font-bold">
                      <XCircle size={10} /> {missing} missing
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <button className="w-full flex items-center justify-center gap-1.5 text-xs font-black text-[#0077b6] hover:bg-sky-50 py-2 rounded-xl transition-colors">
                      <Eye size={12} /> View All ({count})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </AdminSectionCard>
      ) : (
        <AdminSectionCard>
          <h3 className="text-sm font-black text-[#03045e] mb-4">
            Recent Uploads
          </h3>
          <div className="space-y-2">
            {currentDocuments
              .filter((d) => d.uploadDate && d.status !== "missing")
              .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
              .slice(0, 20)
              .map((doc) => {
                const entityList =
                  entityType === "students" ? students : teachers;
                const idField =
                  entityType === "students" ? "studentId" : "teacherId";
                const entity = entityList.find((e) => e.id === doc[idField]);
                const docTypes =
                  entityType === "students"
                    ? STUDENT_DOCUMENT_TYPES
                    : TEACHER_DOCUMENT_TYPES;
                const type = docTypes.find((t) => t.id === doc.documentTypeId);
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-[#0077b6]/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#caf0f8] flex items-center justify-center flex-shrink-0">
                      <FileText size={20} className="text-[#0077b6]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-[#03045e] truncate">
                        {type?.label || doc.titleEn}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {entity?.name || "Unknown"} · {doc.uploadDate} ·{" "}
                        {doc.fileSize || "—"}
                      </p>
                    </div>
                    <StatusBadge status={doc.status} />
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreHorizontal size={16} className="text-slate-400" />
                    </button>
                  </div>
                );
              })}
          </div>
        </AdminSectionCard>
      )}

      {/* Missing Documents Report Modal */}
      {showMissingReport && (
        <MissingDocsReport
          checklist={currentChecklist}
          entityType={entityType}
          onClose={() => setShowMissingReport(false)}
        />
      )}
    </motion.div>
  );
};

export default DocumentsPage;
