/**
 * Exams Seed Data - FLATTENED Structure
 * 
 * Phase 6: Embedded Results Model
 * - Only 2 exams: UT1 and Half Yearly
 * - Only Class 10 and 11
 * - Marks, grades, percentages STORED STATICALLY
 * - NO runtime calculation
 */

// ============================================================================
// SUBJECT CONFIGURATIONS BY CLASS/STREAM
// ============================================================================

const SUBJECTS_10 = [
  { subjectId: "sub-math", subjectName: "Mathematics", maxMarks: 100 },
  { subjectId: "sub-sci", subjectName: "Science", maxMarks: 100 },
  { subjectId: "sub-eng", subjectName: "English", maxMarks: 100 },
  { subjectId: "sub-sst", subjectName: "Social Studies", maxMarks: 100 },
  { subjectId: "sub-hin", subjectName: "Hindi", maxMarks: 100 },
];

const SUBJECTS_11_SCIENCE_NM = [
  { subjectId: "sub-phy", subjectName: "Physics", maxMarks: 100 },
  { subjectId: "sub-chem", subjectName: "Chemistry", maxMarks: 100 },
  { subjectId: "sub-math", subjectName: "Mathematics", maxMarks: 100 },
  { subjectId: "sub-eng", subjectName: "English", maxMarks: 100 },
  { subjectId: "sub-cs", subjectName: "Computer Science", maxMarks: 100 },
];

const SUBJECTS_11_SCIENCE_MED = [
  { subjectId: "sub-phy", subjectName: "Physics", maxMarks: 100 },
  { subjectId: "sub-chem", subjectName: "Chemistry", maxMarks: 100 },
  { subjectId: "sub-bio", subjectName: "Biology", maxMarks: 100 },
  { subjectId: "sub-eng", subjectName: "English", maxMarks: 100 },
  { subjectId: "sub-cs", subjectName: "Computer Science", maxMarks: 100 },
];

const SUBJECTS_11_COMMERCE = [
  { subjectId: "sub-acc", subjectName: "Accountancy", maxMarks: 100 },
  { subjectId: "sub-bst", subjectName: "Business Studies", maxMarks: 100 },
  { subjectId: "sub-eco", subjectName: "Economics", maxMarks: 100 },
  { subjectId: "sub-eng", subjectName: "English", maxMarks: 100 },
  { subjectId: "sub-ip", subjectName: "Informatics Practices", maxMarks: 100 },
];

const SUBJECTS_11_HUMANITIES = [
  { subjectId: "sub-his", subjectName: "History", maxMarks: 100 },
  { subjectId: "sub-pol", subjectName: "Political Science", maxMarks: 100 },
  { subjectId: "sub-geo", subjectName: "Geography", maxMarks: 100 },
  { subjectId: "sub-eng", subjectName: "English", maxMarks: 100 },
  { subjectId: "sub-eco", subjectName: "Economics", maxMarks: 100 },
];

// ============================================================================
// STATIC RESULTS DATA (Pre-calculated)
// ============================================================================

// Class 10-A Results
const RESULTS_10A_UT1 = {
  "stud-001": { marks: [78, 82, 75, 80, 72], total: 387, percentage: 77.4, grade: "B1" },
  "stud-002": { marks: [85, 88, 90, 86, 84], total: 433, percentage: 86.6, grade: "A2" },
};

const RESULTS_10A_HALFYEARLY = {
  "stud-001": { marks: [82, 85, 78, 84, 76], total: 405, percentage: 81.0, grade: "A2" },
  "stud-002": { marks: [88, 90, 85, 89, 87], total: 439, percentage: 87.8, grade: "A2" },
};

// Class 10-B Results
const RESULTS_10B_UT1 = {
  "stud-003": { marks: [75, 78, 82, 76, 80], total: 391, percentage: 78.2, grade: "B1" },
  "stud-004": { marks: [92, 88, 90, 85, 87], total: 442, percentage: 88.4, grade: "A2" },
};

const RESULTS_10B_HALFYEARLY = {
  "stud-003": { marks: [80, 82, 85, 78, 81], total: 406, percentage: 81.2, grade: "A2" },
  "stud-004": { marks: [94, 90, 92, 88, 89], total: 453, percentage: 90.6, grade: "A1" },
};

// Class 10-C Results
const RESULTS_10C_UT1 = {
  "stud-005": { marks: [70, 75, 78, 72, 74], total: 369, percentage: 73.8, grade: "B2" },
  "stud-006": { marks: [88, 85, 90, 86, 84], total: 433, percentage: 86.6, grade: "A2" },
};

const RESULTS_10C_HALFYEARLY = {
  "stud-005": { marks: [76, 78, 82, 75, 77], total: 388, percentage: 77.6, grade: "B1" },
  "stud-006": { marks: [90, 88, 92, 89, 87], total: 446, percentage: 89.2, grade: "A2" },
};

// Class 10-D Results
const RESULTS_10D_UT1 = {
  "stud-007": { marks: [82, 80, 78, 85, 76], total: 401, percentage: 80.2, grade: "A2" },
  "stud-008": { marks: [75, 78, 72, 76, 80], total: 381, percentage: 76.2, grade: "B1" },
};

const RESULTS_10D_HALFYEARLY = {
  "stud-007": { marks: [86, 84, 82, 88, 80], total: 420, percentage: 84.0, grade: "A2" },
  "stud-008": { marks: [80, 82, 78, 80, 84], total: 404, percentage: 80.8, grade: "A2" },
};

// Class 11-A (Science Non-Medical) Results
const RESULTS_11A_UT1 = {
  "stud-009": { marks: [82, 78, 85, 88, 80], total: 413, percentage: 82.6, grade: "A2" },
  "stud-010": { marks: [90, 88, 92, 85, 87], total: 442, percentage: 88.4, grade: "A2" },
};

const RESULTS_11A_HALFYEARLY = {
  "stud-009": { marks: [86, 82, 88, 90, 84], total: 430, percentage: 86.0, grade: "A2" },
  "stud-010": { marks: [92, 90, 94, 88, 89], total: 453, percentage: 90.6, grade: "A1" },
};

// Class 11-B (Science Medical) Results
const RESULTS_11B_UT1 = {
  "stud-011": { marks: [78, 82, 80, 85, 76], total: 401, percentage: 80.2, grade: "A2" },
  "stud-012": { marks: [88, 90, 85, 87, 84], total: 434, percentage: 86.8, grade: "A2" },
};

const RESULTS_11B_HALFYEARLY = {
  "stud-011": { marks: [84, 86, 82, 88, 80], total: 420, percentage: 84.0, grade: "A2" },
  "stud-012": { marks: [90, 92, 88, 89, 87], total: 446, percentage: 89.2, grade: "A2" },
};

// Class 11-C (Commerce) Results
const RESULTS_11C_UT1 = {
  "stud-013": { marks: [80, 82, 78, 85, 76], total: 401, percentage: 80.2, grade: "A2" },
  "stud-014": { marks: [88, 85, 90, 82, 84], total: 429, percentage: 85.8, grade: "A2" },
};

const RESULTS_11C_HALFYEARLY = {
  "stud-013": { marks: [85, 86, 82, 88, 80], total: 421, percentage: 84.2, grade: "A2" },
  "stud-014": { marks: [90, 88, 92, 86, 88], total: 444, percentage: 88.8, grade: "A2" },
};

// Class 11-D (Humanities) Results
const RESULTS_11D_UT1 = {
  "stud-015": { marks: [76, 80, 78, 82, 74], total: 390, percentage: 78.0, grade: "B1" },
  "stud-016": { marks: [85, 88, 82, 86, 84], total: 425, percentage: 85.0, grade: "A2" },
};

const RESULTS_11D_HALFYEARLY = {
  "stud-015": { marks: [82, 84, 80, 86, 78], total: 410, percentage: 82.0, grade: "A2" },
  "stud-016": { marks: [88, 90, 86, 89, 87], total: 440, percentage: 88.0, grade: "A2" },
};

// ============================================================================
// HELPER: Build student results with subject details
// ============================================================================

const buildStudentResults = (resultMap, subjects) => {
  return Object.entries(resultMap).map(([studentId, data]) => ({
    studentId,
    subjectMarks: subjects.map((subj, idx) => ({
      subjectId: subj.subjectId,
      subjectName: subj.subjectName,
      maxMarks: subj.maxMarks,
      marksObtained: data.marks[idx],
      percentage: data.marks[idx],
      grade: data.marks[idx] >= 90 ? "A1" : 
             data.marks[idx] >= 80 ? "A2" : 
             data.marks[idx] >= 70 ? "B1" : 
             data.marks[idx] >= 60 ? "B2" : 
             data.marks[idx] >= 50 ? "C1" : 
             data.marks[idx] >= 40 ? "C2" : "D",
    })),
    totalMarks: data.total,
    maxTotal: subjects.length * 100,
    aggregatePercentage: data.percentage,
    grade: data.grade,
  }));
};

// ============================================================================
// EXAM RECORDS - STATIC & FLATTENED
// ============================================================================

export const examsSeed = [
  // === UT1 EXAMS ===
  {
    examId: "exam-ut1-2025",
    examName: "Unit Test 1 (UT1)",
    examType: "Unit Test",
    academicYear: "2025-2026",
    startDate: "2025-07-15",
    endDate: "2025-07-20",
    status: "Completed",
    
    // Class 10 UT1
    classes: [
      {
        classId: "class-10a",
        className: "10-A",
        classLevel: "10",
        section: "A",
        subjects: SUBJECTS_10,
        studentResults: buildStudentResults(RESULTS_10A_UT1, SUBJECTS_10),
      },
      {
        classId: "class-10b",
        className: "10-B",
        classLevel: "10",
        section: "B",
        subjects: SUBJECTS_10,
        studentResults: buildStudentResults(RESULTS_10B_UT1, SUBJECTS_10),
      },
      {
        classId: "class-10c",
        className: "10-C",
        classLevel: "10",
        section: "C",
        subjects: SUBJECTS_10,
        studentResults: buildStudentResults(RESULTS_10C_UT1, SUBJECTS_10),
      },
      {
        classId: "class-10d",
        className: "10-D",
        classLevel: "10",
        section: "D",
        subjects: SUBJECTS_10,
        studentResults: buildStudentResults(RESULTS_10D_UT1, SUBJECTS_10),
      },
      
      // Class 11 UT1
      {
        classId: "class-11a",
        className: "11-A",
        classLevel: "11",
        section: "A",
        stream: "Science Non-Medical",
        subjects: SUBJECTS_11_SCIENCE_NM,
        studentResults: buildStudentResults(RESULTS_11A_UT1, SUBJECTS_11_SCIENCE_NM),
      },
      {
        classId: "class-11b",
        className: "11-B",
        classLevel: "11",
        section: "B",
        stream: "Science Medical",
        subjects: SUBJECTS_11_SCIENCE_MED,
        studentResults: buildStudentResults(RESULTS_11B_UT1, SUBJECTS_11_SCIENCE_MED),
      },
      {
        classId: "class-11c",
        className: "11-C",
        classLevel: "11",
        section: "C",
        stream: "Commerce",
        subjects: SUBJECTS_11_COMMERCE,
        studentResults: buildStudentResults(RESULTS_11C_UT1, SUBJECTS_11_COMMERCE),
      },
      {
        classId: "class-11d",
        className: "11-D",
        classLevel: "11",
        section: "D",
        stream: "Humanities",
        subjects: SUBJECTS_11_HUMANITIES,
        studentResults: buildStudentResults(RESULTS_11D_UT1, SUBJECTS_11_HUMANITIES),
      },
    ],
  },
  
  // === HALF YEARLY EXAMS ===
  {
    examId: "exam-halfyearly-2025",
    examName: "Half-Yearly Examination",
    examType: "Half-Yearly",
    academicYear: "2025-2026",
    startDate: "2025-09-15",
    endDate: "2025-09-25",
    status: "Completed",
    
    // Class 10 Half-Yearly
    classes: [
      {
        classId: "class-10a",
        className: "10-A",
        classLevel: "10",
        section: "A",
        subjects: SUBJECTS_10,
        studentResults: buildStudentResults(RESULTS_10A_HALFYEARLY, SUBJECTS_10),
      },
      {
        classId: "class-10b",
        className: "10-B",
        classLevel: "10",
        section: "B",
        subjects: SUBJECTS_10,
        studentResults: buildStudentResults(RESULTS_10B_HALFYEARLY, SUBJECTS_10),
      },
      {
        classId: "class-10c",
        className: "10-C",
        classLevel: "10",
        section: "C",
        subjects: SUBJECTS_10,
        studentResults: buildStudentResults(RESULTS_10C_HALFYEARLY, SUBJECTS_10),
      },
      {
        classId: "class-10d",
        className: "10-D",
        classLevel: "10",
        section: "D",
        subjects: SUBJECTS_10,
        studentResults: buildStudentResults(RESULTS_10D_HALFYEARLY, SUBJECTS_10),
      },
      
      // Class 11 Half-Yearly
      {
        classId: "class-11a",
        className: "11-A",
        classLevel: "11",
        section: "A",
        stream: "Science Non-Medical",
        subjects: SUBJECTS_11_SCIENCE_NM,
        studentResults: buildStudentResults(RESULTS_11A_HALFYEARLY, SUBJECTS_11_SCIENCE_NM),
      },
      {
        classId: "class-11b",
        className: "11-B",
        classLevel: "11",
        section: "B",
        stream: "Science Medical",
        subjects: SUBJECTS_11_SCIENCE_MED,
        studentResults: buildStudentResults(RESULTS_11B_HALFYEARLY, SUBJECTS_11_SCIENCE_MED),
      },
      {
        classId: "class-11c",
        className: "11-C",
        classLevel: "11",
        section: "C",
        stream: "Commerce",
        subjects: SUBJECTS_11_COMMERCE,
        studentResults: buildStudentResults(RESULTS_11C_HALFYEARLY, SUBJECTS_11_COMMERCE),
      },
      {
        classId: "class-11d",
        className: "11-D",
        classLevel: "11",
        section: "D",
        stream: "Humanities",
        subjects: SUBJECTS_11_HUMANITIES,
        studentResults: buildStudentResults(RESULTS_11D_HALFYEARLY, SUBJECTS_11_HUMANITIES),
      },
    ],
  },
];

// ============================================================================
// QUICK LOOKUP HELPERS
// ============================================================================

export const getExamById = (examId) => examsSeed.find(e => e.examId === examId);

export const getStudentResult = (examId, studentId) => {
  const exam = getExamById(examId);
  if (!exam) return null;
  
  for (const cls of exam.classes) {
    const result = cls.studentResults.find(r => r.studentId === studentId);
    if (result) return { ...result, classId: cls.classId, className: cls.className };
  }
  return null;
};

export const getClassResults = (examId, classId) => {
  const exam = getExamById(examId);
  if (!exam) return null;
  
  const cls = exam.classes.find(c => c.classId === classId);
  return cls ? cls.studentResults : null;
};

export default {
  examsSeed,
  getExamById,
  getStudentResult,
  getClassResults,
};
