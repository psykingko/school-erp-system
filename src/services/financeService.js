import { getDataProvider } from "../data";

/**
 * Fetches the overall financial details for a student
 */
export const getStudentFinanceSummary = async (studentId) => {
  const id = studentId || "stud-001";
  const provider = getDataProvider();

  const [students, invoices, receipts, feeConfig] = await Promise.all([
    provider.getStudents(),
    provider.getInvoicesByStudent(id),
    provider.getReceiptsByStudent(id),
    provider.getFeeConfiguration(),
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

  let totalAdjustmentsGlobal = 0;
  let totalWaiversGlobal = 0;
  let totalOriginalGlobal = 0;

  invoices.forEach(inv => {
    (inv.lineItems || []).forEach(item => {
      totalOriginalGlobal += (item.originalAmount || 0);
      totalAdjustmentsGlobal += (item.adjustmentAmount || 0);
      totalWaiversGlobal += (item.waivedAmount || 0);
    });
  });

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
    totalAdjustments: totalAdjustmentsGlobal,
    totalWaivers: totalWaiversGlobal,
    totalGrossAmount: totalOriginalGlobal,
  };

  const structure = invoices
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .map((inv) => {
      const monthPrefix = inv.billingMonth ? inv.billingMonth.substring(0, 3).toLowerCase() : "";
      const derivedIsVacationMonth = (feeConfig.vacationMonths || []).includes(monthPrefix);

      const invOriginalTotal = (inv.lineItems || []).reduce((sum, item) => sum + (item.originalAmount || 0), 0);
      const invAdjustmentsTotal = (inv.lineItems || []).reduce((sum, item) => sum + (item.adjustmentAmount || 0), 0);
      const invWaiversTotal = (inv.lineItems || []).reduce((sum, item) => sum + (item.waivedAmount || 0), 0);

      return {
        id: inv.id,
        label: inv.targetLabel || `${inv.billingMonth} Invoice`,
        total: inv.amount,
        grossAmount: invOriginalTotal,
        totalAdjustments: invAdjustmentsTotal,
        totalWaivers: invWaiversTotal,
        paidAmount: inv.paidAmount || 0,
        remainingAmount: inv.amount - (inv.paidAmount || 0),
        status: inv.status,
        dueDate: inv.dueDate,
        invoiceNo: inv.invoiceNo,
        isVacationMonth: derivedIsVacationMonth,
        vacationType: derivedIsVacationMonth ? "VACATION" : null,
        components: (inv.lineItems || []).map((item) => ({
          head: item.label,
          amount: item.amount,
          ...item
        })),
      };
    });

  return {
    summary,
    structure,
    pendingBills: pendingInvoices.map((inv) => {
      const invOriginalTotal = (inv.lineItems || []).reduce((sum, item) => sum + (item.originalAmount || 0), 0);
      const invAdjustmentsTotal = (inv.lineItems || []).reduce((sum, item) => sum + (item.adjustmentAmount || 0), 0);
      const invWaiversTotal = (inv.lineItems || []).reduce((sum, item) => sum + (item.waivedAmount || 0), 0);
      
      return {
        id: inv.id,
        invoiceNo: inv.invoiceNo,
        amount: inv.amount,
        grossAmount: invOriginalTotal,
        totalAdjustments: invAdjustmentsTotal,
        totalWaivers: invWaiversTotal,
        paidAmount: inv.paidAmount || 0,
        remainingAmount: inv.amount - (inv.paidAmount || 0),
        dueDate: inv.dueDate,
        status: inv.status,
        targetLabel: inv.targetLabel || `${inv.billingMonth} Invoice`,
      };
    }),
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
    paidAmount: feeData.paidAmount || 0,
    status: feeData.status || "Pending",
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
