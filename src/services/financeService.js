import { getDataProvider } from "../data";

/**
 * Fetches the overall financial details for a student
 */
export const getStudentFinanceSummary = async (studentId) => {
  const id = studentId || "stud-001";
  const provider = getDataProvider();

  const [students, invoices, receipts] = await Promise.all([
    provider.getStudents(),
    provider.getInvoicesByStudent(id),
    provider.getReceiptsByStudent(id),
  ]);

  const student = students.find((s) => s.id === id);
  if (!student) return null;

  // Compute direct totals
  const totalFees = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const totalPaid = invoices.reduce(
    (sum, inv) => sum + (inv.paidAmount || 0),
    0,
  );

  const outstandingBalance = invoices
    .filter(
      (inv) =>
        inv.status === "Pending" ||
        inv.status === "Overdue" ||
        inv.status === "Partially Paid",
    )
    .reduce((sum, inv) => sum + (inv.amount - (inv.paidAmount || 0)), 0);

  const pendingInvoices = invoices
    .filter(
      (inv) =>
        inv.status === "Pending" ||
        inv.status === "Overdue" ||
        inv.status === "Partially Paid",
    )
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const summary = {
    totalFees,
    totalPaid,
    outstandingBalance,
    currency: "₹",
    dueDate: pendingInvoices[0]?.dueDate || "N/A",
    status:
      outstandingBalance === 0
        ? "Paid"
        : totalPaid > 0
          ? "Partially Paid"
          : "Pending",
    releasedSettledCount: invoices.filter((inv) => inv.status === "Paid")
      .length,
    upcomingCount: invoices.filter((inv) => inv.status === "Upcoming").length,
    totalInvoicesCount: invoices.length,
    activeDuesCount: pendingInvoices.length,
  };

  const structure = invoices
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .map((inv) => ({
      id: inv.id,
      label: inv.targetLabel || `${inv.billingMonth} Invoice`,
      total: inv.amount,
      paidAmount: inv.paidAmount || 0,
      remainingAmount: inv.amount - (inv.paidAmount || 0),
      status: inv.status,
      dueDate: inv.dueDate,
      invoiceNo: inv.invoiceNo,
      isVacationMonth: inv.isVacationMonth,
      vacationType: inv.vacationType,
      components: (inv.lineItems || []).map((item) => ({
        head: item.label,
        amount: item.amount,
      })),
    }));

  return {
    summary,
    structure,
    pendingBills: pendingInvoices.map((inv) => ({
      id: inv.id,
      invoiceNo: inv.invoiceNo,
      amount: inv.amount,
      paidAmount: inv.paidAmount || 0,
      remainingAmount: inv.amount - (inv.paidAmount || 0),
      dueDate: inv.dueDate,
      status: inv.status,
      targetLabel: inv.targetLabel || `${inv.billingMonth} Invoice`,
    })),
    receipts: receipts
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map((rcp) => ({
        ...rcp,
        receiptNo: rcp.receiptNo || `REC-2025-${rcp.id.split("-").pop()}`,
      })),
    itCertificate: {
      studentName: student.name,
      rollNo: student.admissionNo,
      year: "2025-2026",
      dateGenerated: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      totalPaid: totalPaid,
      taxExemptionLimit: 150000,
    },
  };
};

export const getFeeDetails = getStudentFinanceSummary;

/**
 * ADD FEE - Simple CRUD helper
 */
export const addFee = async (feeData) => {
  const provider = getDataProvider();
  const newFee = {
    ...feeData,
    id: `fee-${Date.now()}`,
    paidAmount: 0,
    status: "Unpaid",
    createdAt: new Date().toISOString(),
  };
  return await provider.addFee(newFee);
};

/**
 * DELETE FEE - Hard delete with safety warning
 */
export const deleteFee = async (feeId) => {
  const provider = getDataProvider();
  return await provider.deleteFee(feeId);
};

/**
 * CHECK DEPENDENCIES - Visual warning only (NO cascade)
 */
export const getFeeDependencies = async (feeId) => {
  const provider = getDataProvider();
  const fee = await provider.getFeeById(feeId);

  return {
    hasPayment: fee && fee.paidAmount > 0,
  };
};
