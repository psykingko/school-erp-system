/**
 * Fees Seed Data - FLATTENED Structure
 * 
 * Phase 7: Static Fee Records
 * - 16 students (Class 10 & 11 only)
 * - STATIC data only
 * - NO engines, NO generators
 * - Flattened presentation-friendly format
 */

// ============================================================================
// STATIC FEE RECORDS - 16 STUDENTS
// ============================================================================

export const feesSeed = [
  // Class 10-A
  {
    studentId: "stud-001",
    studentName: "Arjun Sharma",
    className: "10-A",
    annualTotal: 48000,
    paidAmount: 28800,
    balance: 19200,
    feeStatus: "Pending",
    dueDate: "2025-07-15",
  },
  {
    studentId: "stud-002",
    studentName: "Aarohi Verma",
    className: "10-A",
    annualTotal: 48000,
    paidAmount: 38400,
    balance: 9600,
    feeStatus: "Partially Paid",
    dueDate: "2025-07-15",
  },
  
  // Class 10-B
  {
    studentId: "stud-003",
    studentName: "Aryan Gupta",
    className: "10-B",
    annualTotal: 48000,
    paidAmount: 48000,
    balance: 0,
    feeStatus: "Paid",
    dueDate: "2025-07-15",
  },
  {
    studentId: "stud-004",
    studentName: "Ananya Singh",
    className: "10-B",
    annualTotal: 48000,
    paidAmount: 24000,
    balance: 24000,
    feeStatus: "Pending",
    dueDate: "2025-07-15",
  },
  
  // Class 10-C
  {
    studentId: "stud-005",
    studentName: "Rohan Kumar",
    className: "10-C",
    annualTotal: 48000,
    paidAmount: 33600,
    balance: 14400,
    feeStatus: "Partially Paid",
    dueDate: "2025-07-15",
  },
  {
    studentId: "stud-006",
    studentName: "Diya Patel",
    className: "10-C",
    annualTotal: 48000,
    paidAmount: 48000,
    balance: 0,
    feeStatus: "Paid",
    dueDate: "2025-07-15",
  },
  
  // Class 10-D
  {
    studentId: "stud-007",
    studentName: "Aditya Reddy",
    className: "10-D",
    annualTotal: 48000,
    paidAmount: 19200,
    balance: 28800,
    feeStatus: "Pending",
    dueDate: "2025-07-15",
  },
  {
    studentId: "stud-008",
    studentName: "Ishita Nair",
    className: "10-D",
    annualTotal: 48000,
    paidAmount: 43200,
    balance: 4800,
    feeStatus: "Partially Paid",
    dueDate: "2025-07-15",
  },
  
  // Class 11-A (Science Non-Medical - higher fees)
  {
    studentId: "stud-009",
    studentName: "Vihaan Sharma",
    className: "11-A",
    annualTotal: 52000,
    paidAmount: 31200,
    balance: 20800,
    feeStatus: "Pending",
    dueDate: "2025-07-15",
  },
  {
    studentId: "stud-010",
    studentName: "Kavya Verma",
    className: "11-A",
    annualTotal: 52000,
    paidAmount: 52000,
    balance: 0,
    feeStatus: "Paid",
    dueDate: "2025-07-15",
  },
  
  // Class 11-B (Science Medical - higher fees)
  {
    studentId: "stud-011",
    studentName: "Kabir Gupta",
    className: "11-B",
    annualTotal: 52000,
    paidAmount: 41600,
    balance: 10400,
    feeStatus: "Partially Paid",
    dueDate: "2025-07-15",
  },
  {
    studentId: "stud-012",
    studentName: "Myra Singh",
    className: "11-B",
    annualTotal: 52000,
    paidAmount: 26000,
    balance: 26000,
    feeStatus: "Pending",
    dueDate: "2025-07-15",
  },
  
  // Class 11-C (Commerce)
  {
    studentId: "stud-013",
    studentName: "Aarav Kumar",
    className: "11-C",
    annualTotal: 50000,
    paidAmount: 50000,
    balance: 0,
    feeStatus: "Paid",
    dueDate: "2025-07-15",
  },
  {
    studentId: "stud-014",
    studentName: "Navya Patel",
    className: "11-C",
    annualTotal: 50000,
    paidAmount: 30000,
    balance: 20000,
    feeStatus: "Pending",
    dueDate: "2025-07-15",
  },
  
  // Class 11-D (Humanities)
  {
    studentId: "stud-015",
    studentName: "Reyansh Reddy",
    className: "11-D",
    annualTotal: 50000,
    paidAmount: 35000,
    balance: 15000,
    feeStatus: "Partially Paid",
    dueDate: "2025-07-15",
  },
  {
    studentId: "stud-016",
    studentName: "Prisha Nair",
    className: "11-D",
    annualTotal: 50000,
    paidAmount: 40000,
    balance: 10000,
    feeStatus: "Partially Paid",
    dueDate: "2025-07-15",
  },
];

// ============================================================================
// QUICK LOOKUP HELPERS
// ============================================================================

export const getFeesByStudentId = (studentId) => 
  feesSeed.find(f => f.studentId === studentId);

export const getFeesByClass = (className) => 
  feesSeed.filter(f => f.className === className);

export const getClassFeeStats = (className) => {
  const classFees = getFeesByClass(className);
  if (classFees.length === 0) return null;
  
  const totalExpected = classFees.reduce((sum, f) => sum + f.annualTotal, 0);
  const totalPaid = classFees.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalPending = classFees.reduce((sum, f) => sum + f.balance, 0);
  
  return {
    className,
    studentCount: classFees.length,
    totalExpected,
    totalPaid,
    totalPending,
    paidCount: classFees.filter(f => f.feeStatus === "Paid").length,
    pendingCount: classFees.filter(f => f.feeStatus === "Pending").length,
    partialCount: classFees.filter(f => f.feeStatus === "Partially Paid").length,
  };
};

export const getOverallFeeStats = () => {
  const totalExpected = feesSeed.reduce((sum, f) => sum + f.annualTotal, 0);
  const totalPaid = feesSeed.reduce((sum, f) => sum + f.paidAmount, 0);
  const totalPending = feesSeed.reduce((sum, f) => sum + f.balance, 0);
  
  return {
    studentCount: feesSeed.length,
    totalExpected,
    totalPaid,
    totalPending,
    collectionPercentage: ((totalPaid / totalExpected) * 100).toFixed(1),
    paidCount: feesSeed.filter(f => f.feeStatus === "Paid").length,
    pendingCount: feesSeed.filter(f => f.feeStatus === "Pending").length,
    partialCount: feesSeed.filter(f => f.feeStatus === "Partially Paid").length,
  };
};

export default {
  feesSeed,
  getFeesByStudentId,
  getFeesByClass,
  getClassFeeStats,
  getOverallFeeStats,
};
