/**
 * Students Seed Data - FLATTENED Structure (Schema v2)
 *
 * Phase 9: Consumer Migration — Field Normalization
 * Added: id, classId, streamId, admissionNo to match what services expect.
 *
 * Services that need these fields:
 *   - localProvider.getStudentById()  → needs s.id
 *   - localProvider.getStudentsByClass() → needs s.classId
 *   - getSubjectsForStudent()          → needs s.classLevel, s.streamId
 *   - examService.getExamData()        → needs s.classId, s.admissionNo
 *   - assignmentService               → needs s.streamId (via getCourses)
 *   - timetableService                → needs s.classId
 */

// ============================================================================
// CLASS → classId MAPPING
// ============================================================================

const CLASS_ID_MAP = {
  "10-A": "class-10a",
  "10-B": "class-10b",
  "10-C": "class-10c",
  "10-D": "class-10d",
  "11-A": "class-11a",
  "11-B": "class-11b",
  "11-C": "class-11c",
  "11-D": "class-11d",
};

// ============================================================================
// STREAM LABEL → streamId MAPPING (must match streamsSeed.js streamId values)
// ============================================================================

const STREAM_ID_MAP = {
  "Science Non-Medical": "SCIENCE_NON_MEDICAL",
  "Science Medical":     "SCIENCE_MEDICAL",
  "Commerce":            "COMMERCE",
  "Humanities":          "HUMANITIES",
};

// ============================================================================
// EMBEDDED DATA GENERATORS
// ============================================================================

const generateAttendance = (studentId, index) => {
  // 75-95% attendance rate per student
  const baseRate = 75 + (index % 20);
  const totalDays = 60; // ~2 months of school
  const presentDays = Math.floor((totalDays * baseRate) / 100);

  const records = [];
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(2025, 3, 1 + day); // April 2025
    if (date.getDay() === 0) continue; // Skip Sundays

    const isPresent =
      records.filter((r) => r.status === "Present").length < presentDays;
    records.push({
      date: date.toISOString().split("T")[0],
      status: isPresent ? "Present" : Math.random() > 0.5 ? "Absent" : "Late",
      remarks: isPresent ? "" : "Medical leave",
    });
  }

  return {
    studentId,
    academicYear: "2025-2026",
    overallPercentage: baseRate,
    totalDays: records.length,
    presentDays: records.filter((r) => r.status === "Present").length,
    records: records.slice(-20), // Keep last 20 records only
  };
};

const generateFees = (level, stream, index) => {
  const baseTuition = level === "10" ? 48000 : 52000;
  const streamMultiplier = stream?.includes("Science") ? 1.1 : 1.0;
  const annualFee = Math.floor(baseTuition * streamMultiplier);

  const invoice = {
    invoiceId: `INV-2025-${String(index + 1).padStart(4, "0")}`,
    academicYear: "2025-2026",
    annualTotal: annualFee,
    paidAmount: annualFee * 0.6, // 60% paid
    balance: annualFee * 0.4,
    status: "Partially Paid",
    dueDate: "2025-07-15",
    heads: [
      { head: "Tuition", annual: annualFee, paid: annualFee * 0.6 },
      { head: "Transport", annual: 12000, paid: 12000 },
      { head: "Activity", annual: 6000, paid: 3000 },
    ],
  };

  return invoice;
};

const generatePerformance = (level, stream, index) => {
  // Generate marks for relevant subjects
  const baseScore = 65 + (index % 25);

  const getSubjects = () => {
    if (level === "10") {
      return [
        { subjectId: "sub-math", subject: "Mathematics", maxMarks: 100 },
        { subjectId: "sub-sci", subject: "Science", maxMarks: 100 },
        { subjectId: "sub-eng", subject: "English", maxMarks: 100 },
        { subjectId: "sub-sst", subject: "Social Studies", maxMarks: 100 },
        { subjectId: "sub-hin", subject: "Hindi", maxMarks: 100 },
      ];
    }
    if (stream?.includes("Science Non-Medical")) {
      return [
        { subjectId: "sub-phy", subject: "Physics", maxMarks: 100 },
        { subjectId: "sub-chem", subject: "Chemistry", maxMarks: 100 },
        { subjectId: "sub-math", subject: "Mathematics", maxMarks: 100 },
        { subjectId: "sub-eng", subject: "English", maxMarks: 100 },
        { subjectId: "sub-cs", subject: "Computer Science", maxMarks: 100 },
      ];
    }
    if (stream?.includes("Science Medical")) {
      return [
        { subjectId: "sub-phy", subject: "Physics", maxMarks: 100 },
        { subjectId: "sub-chem", subject: "Chemistry", maxMarks: 100 },
        { subjectId: "sub-bio", subject: "Biology", maxMarks: 100 },
        { subjectId: "sub-eng", subject: "English", maxMarks: 100 },
        { subjectId: "sub-cs", subject: "Computer Science", maxMarks: 100 },
      ];
    }
    if (stream?.includes("Commerce")) {
      return [
        { subjectId: "sub-acc", subject: "Accountancy", maxMarks: 100 },
        { subjectId: "sub-bst", subject: "Business Studies", maxMarks: 100 },
        { subjectId: "sub-eco", subject: "Economics", maxMarks: 100 },
        { subjectId: "sub-eng", subject: "English", maxMarks: 100 },
        {
          subjectId: "sub-ip",
          subject: "Informatics Practices",
          maxMarks: 100,
        },
      ];
    }
    // Humanities
    return [
      { subjectId: "sub-his", subject: "History", maxMarks: 100 },
      { subjectId: "sub-pol", subject: "Political Science", maxMarks: 100 },
      { subjectId: "sub-geo", subject: "Geography", maxMarks: 100 },
      { subjectId: "sub-eng", subject: "English", maxMarks: 100 },
      { subjectId: "sub-eco", subject: "Economics", maxMarks: 100 },
    ];
  };

  const subjects = getSubjects();
  const marks = subjects.map((subj) => {
    const score = Math.min(
      100,
      Math.max(40, baseScore + (Math.floor(Math.random() * 20) - 10)),
    );
    return {
      ...subj,
      marksObtained: score,
      percentage: score,
      grade:
        score >= 90
          ? "A1"
          : score >= 80
            ? "A2"
            : score >= 70
              ? "B1"
              : score >= 60
                ? "B2"
                : score >= 50
                  ? "C1"
                  : score >= 40
                    ? "C2"
                    : "D",
    };
  });

  const total = marks.reduce((sum, m) => sum + m.marksObtained, 0);
  const maxTotal = marks.reduce((sum, m) => sum + m.maxMarks, 0);
  const aggregate = ((total / maxTotal) * 100).toFixed(1);

  return {
    examId: "exam-halfyearly-2025",
    examName: "Half-Yearly Examination 2025",
    aggregatePercentage: parseFloat(aggregate),
    grade:
      aggregate >= 90
        ? "A1"
        : aggregate >= 80
          ? "A2"
          : aggregate >= 70
            ? "B1"
            : aggregate >= 60
              ? "B2"
              : aggregate >= 50
                ? "C1"
                : aggregate >= 40
                  ? "C2"
                  : "D",
    rank: null, // Calculated dynamically if needed
    subjectMarks: marks,
  };
};

// ============================================================================
// HELPER: Build a fully normalized student record
// ============================================================================

const makeStudent = ({ studentId, name, classLevel, section, className, stream, parentId }, index) => {
  const classId = CLASS_ID_MAP[className] || null;
  const streamId = stream ? (STREAM_ID_MAP[stream] || null) : null;
  const admissionNo = String(2024000 + index + 1); // e.g., "2024001"

  return {
    // ── Normalized fields (required by services) ───────────────────────────
    id: studentId,            // localProvider.getStudentById() looks for s.id
    studentId,                // legacy alias
    admissionNo,              // examService.getExamData() → roll number
    classId,                  // timetable, exam, attendance lookups
    streamId,                 // getCourses() → getSubjectsForStudent() for Class 11

    // ── Profile fields ────────────────────────────────────────────────────
    name,
    classLevel,
    section,
    className,                // "10-A" format — still used by some filters
    stream,                   // human-readable stream label

    // ── Relational ────────────────────────────────────────────────────────
    parentId,

    // ── Embedded data ─────────────────────────────────────────────────────
    attendance: generateAttendance(studentId, index),
    fees: generateFees(classLevel, stream, index),
    performance: generatePerformance(classLevel, stream, index),
  };
};

// ============================================================================
// STUDENT DATA (16 students)
// ============================================================================

export const studentsSeed = [
  // Class 10-A
  makeStudent({ studentId: "stud-001", name: "Arjun Sharma",  classLevel: "10", section: "A", className: "10-A", stream: null, parentId: "parent-1" }, 0),
  makeStudent({ studentId: "stud-002", name: "Aarohi Verma",  classLevel: "10", section: "A", className: "10-A", stream: null, parentId: "parent-2" }, 1),

  // Class 10-B
  makeStudent({ studentId: "stud-003", name: "Aryan Gupta",   classLevel: "10", section: "B", className: "10-B", stream: null, parentId: "parent-3" }, 2),
  makeStudent({ studentId: "stud-004", name: "Ananya Singh",  classLevel: "10", section: "B", className: "10-B", stream: null, parentId: "parent-4" }, 3),

  // Class 10-C
  makeStudent({ studentId: "stud-005", name: "Rohan Kumar",   classLevel: "10", section: "C", className: "10-C", stream: null, parentId: "parent-5" }, 4),
  makeStudent({ studentId: "stud-006", name: "Diya Patel",    classLevel: "10", section: "C", className: "10-C", stream: null, parentId: "parent-6" }, 5),

  // Class 10-D
  makeStudent({ studentId: "stud-007", name: "Aditya Reddy",  classLevel: "10", section: "D", className: "10-D", stream: null, parentId: "parent-7" }, 6),
  makeStudent({ studentId: "stud-008", name: "Ishita Nair",   classLevel: "10", section: "D", className: "10-D", stream: null, parentId: "parent-8" }, 7),

  // Class 11-A: Science Non-Medical
  makeStudent({ studentId: "stud-009", name: "Vihaan Sharma", classLevel: "11", section: "A", className: "11-A", stream: "Science Non-Medical", parentId: "parent-9"  }, 8),
  makeStudent({ studentId: "stud-010", name: "Kavya Verma",   classLevel: "11", section: "A", className: "11-A", stream: "Science Non-Medical", parentId: "parent-10" }, 9),

  // Class 11-B: Science Medical
  makeStudent({ studentId: "stud-011", name: "Kabir Gupta",   classLevel: "11", section: "B", className: "11-B", stream: "Science Medical",     parentId: "parent-11" }, 10),
  makeStudent({ studentId: "stud-012", name: "Myra Singh",    classLevel: "11", section: "B", className: "11-B", stream: "Science Medical",     parentId: "parent-12" }, 11),

  // Class 11-C: Commerce
  makeStudent({ studentId: "stud-013", name: "Aarav Kumar",   classLevel: "11", section: "C", className: "11-C", stream: "Commerce",            parentId: "parent-13" }, 12),
  makeStudent({ studentId: "stud-014", name: "Navya Patel",   classLevel: "11", section: "C", className: "11-C", stream: "Commerce",            parentId: "parent-14" }, 13),

  // Class 11-D: Humanities
  makeStudent({ studentId: "stud-015", name: "Reyansh Reddy", classLevel: "11", section: "D", className: "11-D", stream: "Humanities",          parentId: "parent-15" }, 14),
  makeStudent({ studentId: "stud-016", name: "Prisha Nair",   classLevel: "11", section: "D", className: "11-D", stream: "Humanities",          parentId: "parent-16" }, 15),
];

// ============================================================================
// PARENTS (Minimal - referenced only)
// ============================================================================

export const parentsSeed = studentsSeed.map((s, i) => ({
  id: `parent-${i + 1}`,
  parentId: `parent-${i + 1}`,
  name: s.name,
  childIds: [s.studentId],
  phoneNumber: `+91 98765 ${String(60000 + i).padStart(5, "0")}`,
  email: `${s.name.toLowerCase().replace(" ", ".")}@school.edu`,
}));

export default {
  studentsSeed,
  parentsSeed,
};
