/**
 * Teachers Seed Data - FLATTENED Structure
 *
 * Phase 4: Embedded Data Model
 * - 18 teachers total (1 per subject + class teachers)
 * - teacherName, subjectName, className STORED DIRECTLY
 * - NO runtime derivation
 * - Flattened presentation-friendly data
 */

// ============================================================================
// 18 TEACHERS - 1 PER SUBJECT + CLASS TEACHERS
// ============================================================================

export const teachersSeed = [
  // === CLASS 10 TEACHERS (4 teachers for 4 sections) ===

  {
    id: "teach-001",
    teacherId: "teach-001",
    teacherName: "Mr. Rajesh Sharma",
    subjectName: "Mathematics",
    subjectId: "sub-math",
    className: "10-A",
    classLevel: "10",
    section: "A",
    isClassTeacher: true,

    // Profile (embedded)
    designation: "PGT Mathematics",
    department: "Mathematics",
    phone: "+91 98765 43001",
    email: "rajesh.sharma@school.edu",
    qualification: "M.Sc. Mathematics, B.Ed.",
    experience: "15 Years",
  },

  {
    id: "teach-002",
    teacherId: "teach-002",
    teacherName: "Mrs. Priya Verma",
    subjectName: "Science",
    subjectId: "sub-sci",
    className: "10-B",
    classLevel: "10",
    section: "B",
    isClassTeacher: true,

    designation: "PGT Science",
    department: "Science",
    phone: "+91 98765 43002",
    email: "priya.verma@school.edu",
    qualification: "M.Sc. Physics, B.Ed.",
    experience: "12 Years",
  },

  {
    id: "teach-003",
    teacherId: "teach-003",
    teacherName: "Mr. Amit Kumar",
    subjectName: "English",
    subjectId: "sub-eng",
    className: "10-C",
    classLevel: "10",
    section: "C",
    isClassTeacher: true,

    designation: "PGT English",
    department: "Languages",
    phone: "+91 98765 43003",
    email: "amit.kumar@school.edu",
    qualification: "M.A. English, B.Ed.",
    experience: "10 Years",
  },

  {
    id: "teach-004",
    teacherId: "teach-004",
    teacherName: "Mrs. Sunita Gupta",
    subjectName: "Social Studies",
    subjectId: "sub-sst",
    className: "10-D",
    classLevel: "10",
    section: "D",
    isClassTeacher: true,

    designation: "PGT Social Science",
    department: "Social Sciences",
    phone: "+91 98765 43004",
    email: "sunita.gupta@school.edu",
    qualification: "M.A. History, B.Ed.",
    experience: "14 Years",
  },

  // === CLASS 11 TEACHERS - SCIENCE STREAMS (A & B) ===

  {
    id: "teach-005",
    teacherId: "teach-005",
    teacherName: "Dr. Vikram Singh",
    subjectName: "Physics",
    subjectId: "sub-phy",
    className: "11-A",
    classLevel: "11",
    section: "A",
    stream: "Science Non-Medical",
    isClassTeacher: true,

    designation: "Senior PGT Physics",
    department: "Science",
    phone: "+91 98765 43005",
    email: "vikram.singh@school.edu",
    qualification: "Ph.D. Physics, M.Sc., B.Ed.",
    experience: "18 Years",
  },

  {
    id: "teach-006",
    teacherId: "teach-006",
    teacherName: "Dr. Ananya Patel",
    subjectName: "Chemistry",
    subjectId: "sub-chem",
    className: "11-B",
    classLevel: "11",
    section: "B",
    stream: "Science Medical",
    isClassTeacher: true,

    designation: "Senior PGT Chemistry",
    department: "Science",
    phone: "+91 98765 43006",
    email: "ananya.patel@school.edu",
    qualification: "Ph.D. Chemistry, M.Sc., B.Ed.",
    experience: "16 Years",
  },

  // === CLASS 11 TEACHERS - COMMERCE & HUMANITIES (C & D) ===

  {
    id: "teach-007",
    teacherId: "teach-007",
    teacherName: "Mr. Arun Khanna",
    subjectName: "Accountancy",
    subjectId: "sub-acc",
    className: "11-C",
    classLevel: "11",
    section: "C",
    stream: "Commerce",
    isClassTeacher: true,

    designation: "Senior PGT Commerce",
    department: "Commerce",
    phone: "+91 98765 43007",
    email: "arun.khanna@school.edu",
    qualification: "M.Com, CA Inter, B.Ed.",
    experience: "13 Years",
  },

  // === ADDITIONAL SUBJECT TEACHERS (1 per subject) ===

  // Hindi Teacher (Class 10)
  {
    id: "teach-009",
    teacherId: "teach-009",
    teacherName: "Mrs. Meena Joshi",
    subjectName: "Hindi",
    subjectId: "sub-hin",
    className: "10",
    classLevel: "10",
    section: null,
    isClassTeacher: false,

    designation: "PGT Hindi",
    department: "Languages",
    phone: "+91 98765 43009",
    email: "meena.joshi@school.edu",
    qualification: "M.A. Hindi, B.Ed.",
    experience: "12 Years",
  },

  // Biology Teacher (11-B Science Medical)
  {
    id: "teach-010",
    teacherId: "teach-010",
    teacherName: "Dr. Suresh Nair",
    subjectName: "Biology",
    subjectId: "sub-bio",
    className: "11-B",
    classLevel: "11",
    section: "B",
    stream: "Science Medical",
    isClassTeacher: false,

    designation: "Senior PGT Biology",
    department: "Science",
    phone: "+91 98765 43010",
    email: "suresh.nair@school.edu",
    qualification: "Ph.D. Biology, M.Sc., B.Ed.",
    experience: "14 Years",
  },

  // Economics Teacher (Commerce & Humanities)
  {
    id: "teach-011",
    teacherId: "teach-011",
    teacherName: "Mr. Deepak Chopra",
    subjectName: "Economics",
    subjectId: "sub-eco",
    className: "11-C, 11-D",
    classLevel: "11",
    section: null,
    stream: "Commerce, Humanities",
    isClassTeacher: false,

    designation: "PGT Economics",
    department: "Social Sciences",
    phone: "+91 98765 43011",
    email: "deepak.chopra@school.edu",
    qualification: "M.A. Economics, B.Ed.",
    experience: "11 Years",
  },

  // Computer Science Teacher (All 11th Streams)
  {
    id: "teach-012",
    teacherId: "teach-012",
    teacherName: "Mr. Alok Mishra",
    subjectName: "Computer Science",
    subjectId: "sub-cs",
    className: "11-A, 11-B, 11-C",
    classLevel: "11",
    section: null,
    stream: "Science, Commerce",
    isClassTeacher: false,

    designation: "PGT Computer Science",
    department: "Computer Science",
    phone: "+91 98765 43012",
    email: "alok.mishra@school.edu",
    qualification: "M.Tech, B.Tech, B.Ed.",
    experience: "9 Years",
  },

  // History Teacher (11-D Humanities)
  {
    id: "teach-013",
    teacherId: "teach-013",
    teacherName: "Dr. Kavita Menon",
    subjectName: "History",
    subjectId: "sub-his",
    className: "11-D",
    classLevel: "11",
    section: "D",
    stream: "Humanities",
    isClassTeacher: false,

    designation: "PGT History",
    department: "Social Sciences",
    phone: "+91 98765 43013",
    email: "kavita.menon@school.edu",
    qualification: "Ph.D. History, M.A., B.Ed.",
    experience: "13 Years",
  },

  // Political Science Teacher (11-D Humanities)
  {
    id: "teach-014",
    teacherId: "teach-014",
    teacherName: "Mr. Farhan Qureshi",
    subjectName: "Political Science",
    subjectId: "sub-pol",
    className: "11-D",
    classLevel: "11",
    section: "D",
    stream: "Humanities",
    isClassTeacher: false,

    designation: "PGT Political Science",
    department: "Social Sciences",
    phone: "+91 98765 43014",
    email: "farhan.qureshi@school.edu",
    qualification: "M.A. Political Science, B.Ed.",
    experience: "8 Years",
  },

  // Geography Teacher (11-D Humanities)
  {
    id: "teach-015",
    teacherId: "teach-015",
    teacherName: "Mrs. Leela Krishnan",
    subjectName: "Geography",
    subjectId: "sub-geo",
    className: "11-D",
    classLevel: "11",
    section: "D",
    stream: "Humanities",
    isClassTeacher: false,

    designation: "PGT Geography",
    department: "Social Sciences",
    phone: "+91 98765 43015",
    email: "leela.krishnan@school.edu",
    qualification: "M.Sc. Geography, B.Ed.",
    experience: "10 Years",
  },

  // Business Studies Teacher (11-C Commerce)
  {
    id: "teach-016",
    teacherId: "teach-016",
    teacherName: "Mr. Sanjay Malhotra",
    subjectName: "Business Studies",
    subjectId: "sub-bst",
    className: "11-C",
    classLevel: "11",
    section: "C",
    stream: "Commerce",
    isClassTeacher: false,

    designation: "PGT Commerce",
    department: "Commerce",
    phone: "+91 98765 43016",
    email: "sanjay.malhotra@school.edu",
    qualification: "M.Com, MBA, B.Ed.",
    experience: "12 Years",
  },

  // Physical Education Teacher (All Classes)
  {
    id: "teach-017",
    teacherId: "teach-017",
    teacherName: "Mr. Ramesh Iyer",
    subjectName: "Physical Education",
    subjectId: "act-games",
    className: "All Classes",
    classLevel: null,
    section: null,
    isClassTeacher: false,

    designation: "Activity Teacher",
    department: "Physical Education",
    phone: "+91 98765 43017",
    email: "ramesh.iyer@school.edu",
    qualification: "M.P.Ed, B.P.Ed",
    experience: "10 Years",
  },

  // Art/Music Teacher (All Classes)
  {
    id: "teach-018",
    teacherId: "teach-018",
    teacherName: "Mrs. Padma Desai",
    subjectName: "Art & Music",
    subjectId: "act-art",
    className: "All Classes",
    classLevel: null,
    section: null,
    isClassTeacher: false,

    designation: "Activity Teacher",
    department: "Arts",
    phone: "+91 98765 43018",
    email: "padma.desai@school.edu",
    qualification: "M.F.A, B.F.A",
    experience: "8 Years",
  },
  
  // Library Teacher (All Classes)
  {
    id: "teach-019",
    teacherId: "teach-019",
    teacherName: "Mr. Rohan Sharma",
    subjectName: "Library",
    subjectId: "act-library",
    className: "All Classes",
    classLevel: null,
    section: null,
    isClassTeacher: false,

    designation: "Librarian",
    department: "Library",
    phone: "+91 98765 43019",
    email: "rohan.sharma@school.edu",
    qualification: "B.Lib, M.Lib",
    experience: "5 Years",
  },

  // IP Teacher (Class 11)
  {
    id: "teach-020",
    teacherId: "teach-020",
    teacherName: "Mrs. Sneha Patil",
    subjectName: "Informatics Practices",
    subjectId: "sub-ip",
    className: "11-C",
    classLevel: "11",
    section: "C",
    isClassTeacher: false,

    designation: "PGT IP",
    department: "Computer Science",
    phone: "+91 98765 43020",
    email: "sneha.patil@school.edu",
    qualification: "MCA, B.Ed",
    experience: "7 Years",
  },
];

// ============================================================================
// QUICK LOOKUP HELPERS (Optional utilities)
// ============================================================================

export const getTeacherById = (id) =>
  teachersSeed.find((t) => t.teacherId === id);

export const getTeachersByClass = (level, section) =>
  teachersSeed.filter((t) => t.classLevel === level && t.section === section);

export const getClassTeacher = (level, section) =>
  teachersSeed.find(
    (t) => t.classLevel === level && t.section === section && t.isClassTeacher,
  );

export default {
  teachersSeed,
  getTeacherById,
  getTeachersByClass,
  getClassTeacher,
};
