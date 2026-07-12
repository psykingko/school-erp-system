import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { useStudent } from "../../context/StudentContext";
import ChildScopeSwitcher from "../../components/parent/ChildScopeSwitcher";
import HelperButton from "../../components/HelperButton";
import HelperPopup from "../../components/HelperPopup";
import MainCard from "../../components/MainCard";
import {
  Wallet,
  FileText,
  Receipt,
  Award,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
  Printer,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  Layers,
  Info
} from "lucide-react";
import { getFeeDetails } from "../../services/financeService";
import { useService } from "../../hooks/useService";

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.15, ease: "easeIn" } },
};

const HELPER_CONTENT_EN = "This module provides a mathematically consistent breakdown of your school billing cycles and invoices. 'Total Planned Billing' represents the sum of all 12 monthly invoices across the April-March academic session. Your 'Outstanding Balance' is calculated in real-time as the sum of active pending or overdue invoices, excluding future upcoming cycles.";
const HELPER_HI = "यह मॉड्यूल आपके स्कूल बिलिंग चक्र और इनवॉइस का गणितीय रूप से सुसंगत विवरण प्रदान करता है। 'कुल नियोजित बिलिंग' (Total Planned Billing) अप्रैल-मार्च शैक्षणिक सत्र के सभी 12 मासिक इनवॉइस के योग को दर्शाता है। आपका 'बकाया शेष' (Outstanding Balance) भविष्य के आगामी चक्रों को छोड़कर सभी सक्रिय लंबित या अतिदेय इनवॉइस के योग को दर्शाता है।";

const STATUS_STYLE = {
  "Paid": { color: "#059669", bg: "#d1fae5", icon: CheckCircle },
  "Partially Paid": { color: "#d97706", bg: "#fef3c7", icon: Clock },
  "Pending": { color: "#dc2626", bg: "#fee2e2", icon: AlertCircle },
  "Overdue": { color: "#991b1b", bg: "#fef2f2", icon: AlertCircle },
  "Upcoming": { color: "#0077b6", bg: "#caf0f8", icon: Calendar },
};

function FeeStructure({ structure }) {
  const { t, lang } = useLanguage();
  const [expandedId, setExpandedId] = useState(structure[0]?.id);

  const getActivationDate = (label) => {
    if (!label) return "";
    const monthYear = label.replace(" Invoice", "");
    const parts = monthYear.split(" ");
    if (parts.length < 2) return monthYear;
    const [month, year] = parts;
    const shortMonth = month.substring(0, 3);
    return `1 ${shortMonth} ${year}`;
  };

  return (
    <div className="space-y-4">
      {(structure || []).map((item) => {
        const isExpanded = expandedId === item.id;
        const style = STATUS_STYLE[item.status] || STATUS_STYLE.Upcoming;
        const Icon = style.icon;

        return (
          <motion.div
            key={item.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden"
            style={{ outline: "1px solid #caf0f8" }}
            initial={false}
            animate={{ backgroundColor: isExpanded ? "#f8fafc" : "#ffffff" }}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              className="w-full px-5 py-5 flex items-center justify-between focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: style.bg }}>
                  <Icon size={22} style={{ color: style.color }} />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-extrabold text-[#03045e]">{item.label}</h3>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <div 
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide self-start w-fit"
                      style={{ backgroundColor: `${style.color}15`, color: style.color }}
                    >
                      {t(`feeDetails.billStatus_${(item.status || "").replace(/\s+/g, "")}`, { fallback: item.status })}
                    </div>
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                        {t("feeDetails.vacationMonth", { fallback: "Vacation month" })}
                      </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block mr-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t("feeDetails.plannedTotal", { fallback: "Planned Total" })}</p>
                  <p className="font-black text-sm text-[#03045e]">₹{(item.total || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</p>
                </div>
                {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
              </div>
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-5 pb-5 pt-1"
                >
                  <div className="space-y-3">
                    {/* Upcoming schedule note */}
                    {item.status === "Upcoming" && (
                      <div className="bg-[#caf0f8]/30 border border-[#00b4d8]/20 rounded-xl p-3 text-xs text-[#0077b6] flex items-center gap-2 font-bold">
                        <Calendar size={14} />
                        <span>{t("feeDetails.plannedBillingCycle", { fallback: "Planned Billing Cycle — Invoice will activate on" })} {getActivationDate(item.label)}</span>
                      </div>
                    )}

                    {/* Vacation Adjustment note */}
                    {item.isVacationMonth && (
                      <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-3 text-xs text-emerald-700 flex flex-col gap-1 font-bold">
                        <span className="flex items-center gap-1.5 uppercase tracking-wide text-[9px] text-emerald-600 font-extrabold">
                          🌴 {item.vacationType === "SUMMER" ? t("feeDetails.summerVacationBreak", { fallback: "Summer Vacation Break" }) : t("feeDetails.winterVacationAdj", { fallback: "Winter Vacation Adjustment" })}
                        </span>
                        <span>
                          {item.vacationType === "SUMMER" 
                            ? t("feeDetails.summerVacationDesc", { fallback: "Tuition and tech core services remain fully active for academic continuity. Optional charges (Transport, Activity) are waived." })
                            : t("feeDetails.winterVacationDesc", { fallback: "Winter vacation partial adjustment. Optional charges (Transport, Activity) are discounted by 50%." })}
                        </span>
                      </div>
                    )}

                    <div className="bg-white rounded-xl p-4 shadow-inner border border-gray-50 space-y-3">
                      {(item.components || []).map((comp, idx) => (
                        <div key={idx} className="flex justify-between items-center pb-2 border-b border-gray-50 last:border-0">
                          <span className="text-sm font-semibold text-gray-600">{t(`feeDetails.components.${(comp.head || "").toLowerCase().replace(/\s+/g, "")}`, { fallback: comp.head })}</span>
                          <span className="font-bold text-[#03045e]">
                            {comp.amount === 0 ? `${t("feeDetails.waived", { fallback: "Waived" })} / ₹0` : `₹${(comp.amount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}`}
                          </span>
                        </div>
                      ))}
                      <div className="pt-3 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-400 uppercase">{t("feeDetails.amountAlreadyPaid", { fallback: "Amount Already Paid" })}</span>
                          <span className="text-sm font-bold text-emerald-600">₹{(item.paidAmount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-dashed border-gray-200">
                          <span className="text-base font-bold text-[#03045e]">{t("feeDetails.structure.total", { fallback: "Total Invoice Amount" })}</span>
                          <span className="text-lg font-black text-[#00b4d8]">₹{(item.total || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

function FeeBill({ bills }) {
  const { t, lang } = useLanguage();
  return (
    <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 gap-4">
      {(bills || []).map(bill => {
        const isPaid = bill.status === "Paid";
        const style = STATUS_STYLE[bill.status] || STATUS_STYLE.Pending;
        
        return (
          <MainCard key={bill.id} className="p-5 flex flex-col gap-4 relative">
            {isPaid && (
              <div className="absolute top-0 right-0 bg-[#059669] text-white text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase">
                {t(`feeDetails.billStatus_${bill.status.replace(/\\s+/g, '')}`, { fallback: bill.status })}
              </div>
            )}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-[#03045e] text-sm">{bill.targetLabel}</h3>
                <p className="text-[10px] font-black text-gray-400 mt-0.5 uppercase tracking-widest">{bill.invoiceNo}</p>
                <div className="flex items-center gap-1.5 mt-2">
                   <Clock size={12} className="text-gray-400" />
                   <p className="text-[11px] font-bold text-gray-500">{t("feeDetails.bill.dueDate", { fallback: "Due Date" })}: {bill.dueDate}</p>
                </div>
              </div>
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${style.color}15`, color: style.color }}>
                {isPaid ? <CheckCircle size={22} /> : <AlertCircle size={22} />}
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black text-gray-400 uppercase">{t("feeDetails.invoiceAmount", { fallback: "Invoice Amount" })}</span>
              <span className="text-3xl font-black text-[#03045e]">₹{(bill.amount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
              <div className="flex-1">
                <span className="block text-[10px] font-black text-gray-400 uppercase mb-0.5">{t("feeDetails.amountPaid", { fallback: "Amount Paid" })}</span>
                <span className="text-emerald-600 font-black">₹{(bill.paidAmount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="flex-1 text-right">
                <span className="block text-[10px] font-black text-gray-400 uppercase mb-0.5">{t("feeDetails.outstanding", { fallback: "Outstanding" })}</span>
                <span className={`font-black ${isPaid ? "text-gray-400" : "text-[#dc2626]"}`}>₹{(bill.remainingAmount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
              </div>
            </div>

            {!isPaid && (
              <button className="w-full bg-[#03045e] hover:bg-[#0077b6] text-white text-sm font-black py-3 rounded-xl transition-all shadow-lg shadow-[#03045e]/10 mt-1">
                {t("feeDetails.bill.payNow", { fallback: "Pay Outstanding Amount" })}
              </button>
            )}
          </MainCard>
        );
      })}
    </div>
  );
}

function FeeReceipt({ receipts }) {
  const { t, lang } = useLanguage();
  return (
    <div className="space-y-3">
      {(receipts || []).map(receipt => (
        <MainCard key={receipt.id} className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#059669]/10 rounded-xl text-[#059669]">
              <Receipt size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[#03045e] text-sm">{receipt.receiptNo}</h3>
              <p className="text-[11px] font-bold text-gray-500 mt-0.5">{receipt.date} • {receipt.targetLabel} • {receipt.mode}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between w-full sm:w-auto gap-6">
            <div className="text-left sm:text-right">
              <p className="text-lg font-black text-[#059669]">₹{(receipt.amount || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{receipt.transactionId}</p>
            </div>
            <button className="flex items-center justify-center w-10 h-10 rounded-xl bg-gray-50 hover:bg-[#caf0f8] text-[#0077b6] transition-colors shadow-sm" aria-label={t("feeDetails.receipt.download")}>
              <Download size={18} />
            </button>
          </div>
        </MainCard>
      ))}
    </div>
  );
}

function ITCertificate({ cert }) {
  const { t, lang } = useLanguage();
  if (!cert || !cert.studentName) return null;
  return (
    <div className="flex justify-center">
      <motion.div 
        className="bg-white max-w-2xl w-full rounded-3xl p-6 md:p-8 shadow-md border border-gray-100 relative overflow-hidden"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
      >
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#caf0f8] rounded-full blur-2xl opacity-50"></div>
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#0077b6] rounded-full blur-2xl opacity-10"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center border-b-2 border-dashed border-gray-100 pb-6 mb-6">
          <div className="p-3 bg-[#03045e] rounded-2xl text-white mb-4 shadow-lg shadow-[#03045e]/20">
            <Award size={32} />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-[#03045e]">{t("feeDetails.tab.itCertificate", { fallback: "Fee Payment Certificate" })}</h2>
          <p className="text-sm font-semibold text-gray-500 mt-1">{t("feeDetails.itCertificate.desc", { fallback: "Generated for Income Tax declaration under Section 80C" })}</p>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4 mb-8 text-left">
          <div>
            <p className="text-xs font-black text-gray-400 mb-1 uppercase tracking-tighter">{t("feeDetails.itCertificate.studentName", { fallback: "Student Name" })}</p>
            <p className="font-bold text-[#03045e]">{cert.studentName}</p>
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 mb-1 uppercase tracking-tighter">{t("feeDetails.itCertificate.rollNo", { fallback: "Roll No" })}</p>
            <p className="font-bold text-[#03045e]">{cert.rollNo}</p>
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 mb-1 uppercase tracking-tighter">{t("feeDetails.itCertificate.year", { fallback: "Financial Year" })}</p>
            <p className="font-bold text-[#03045e]">{cert.year}</p>
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 mb-1 uppercase tracking-tighter">{t("feeDetails.itCertificate.dateGenerated", { fallback: "Date Generated" })}</p>
            <p className="font-bold text-[#03045e]">{cert.dateGenerated}</p>
          </div>
        </div>

        <div className="relative z-10 bg-[#f8fafc] rounded-2xl p-5 flex justify-between items-center mb-8 border border-gray-100">
          <span className="font-bold text-[#03045e] uppercase text-sm tracking-tight">{t("feeDetails.itCertificate.totalPaid", { fallback: "Total Amount Paid" })}</span>
          <span className="text-2xl font-black text-[#059669]">₹{(cert.totalPaid || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}</span>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-3">
          <button className="flex-1 bg-[#00b4d8] hover:bg-[#0077b6] text-white font-black py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#00b4d8]/20">
            <Download size={20} />
            {t("feeDetails.itCertificate.download", { fallback: "Download PDF" })}
          </button>
          <button className="flex-1 bg-white hover:bg-gray-50 text-[#03045e] border-2 border-[#03045e]/10 font-black py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            <Printer size={20} />
            {t("feeDetails.itCertificate.print", { fallback: "Print Certificate" })}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function FeeDetailsPage() {
  const { t, lang } = useLanguage();
  const { activeStudentId } = useStudent();
  const [activeTab, setActiveTab] = useState("structure");
  const [showHelper, setShowHelper] = useState(false);
  const { data: feeDetails, loading, error } = useService(getFeeDetails, [activeStudentId], [activeStudentId]);

  if (error) throw error;

  const { isParent: isParentMode } = useAuth();

  const tabs = [
    { id: "structure", label: t("feeDetails.tab.structure", { fallback: "Billing Cycles" }), icon: Layers },
    { id: "bill", label: t("feeDetails.tab.bill", { fallback: "Pending Bills" }), icon: FileText },
    { id: "receipt", label: t("feeDetails.tab.receipt", { fallback: "Fee Receipts" }), icon: Receipt },
    { id: "itCertificate", label: t("feeDetails.tab.itCertificate", { fallback: "Fee Payment Certificate" }), icon: Award },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#00b4d8] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "structure": return <FeeStructure structure={feeDetails?.structure || []} />;
      case "bill": return <FeeBill bills={feeDetails?.pendingBills || []} />;
      case "receipt": return <FeeReceipt receipts={feeDetails?.receipts || []} />;
      case "itCertificate": return <ITCertificate cert={feeDetails?.itCertificate || {}} />;
      default: return null;
    }
  };

  const summary = feeDetails?.summary || { totalFees: 0, totalPaid: 0, outstandingBalance: 0 };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: "#03045e" }}>
            <Wallet size={31} className="text-white" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black truncate" style={{ color: "#03045e" }}>
              {t("feeDetails.title")}
            </h1>
            <p className="text-sm text-gray-500 truncate">
              {isParentMode 
                ? t("feeDetails.desc.parent")
                : t("feeDetails.desc.student")}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 ml-auto">
          <HelperButton onClick={() => setShowHelper(true)} />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-5 mb-6 border border-gray-100" style={{ outline: "1px solid #caf0f8" }}>
        {/* Metric Row with thin responsive separators */}
        <div className="grid grid-cols-1 md:grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 items-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
          
          {/* Metric 1: Total Planned Billing */}
          <div className="flex items-center gap-4 pb-4 md:pb-0">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#f1f5f9" }}>
              <Layers size={24} style={{ color: "#475569" }} />
            </div>
            <div className="text-left">
              <span className="text-xl font-black block leading-none text-[#03045e]">
                ₹{(summary.totalFees || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}
              </span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mt-1.5">
                {t("feeDetails.summary.totalPlannedBilling") || "Total Planned Billing"}
              </span>
              <span className="text-[10px] font-bold text-gray-400 block mt-1">
                {lang === "hi" 
                  ? `${summary.totalInvoicesCount || 12} ${t("feeDetails.billingCyclesConfigured", { fallback: "बिलिंग चक्र नियोजित" })}`
                  : `${summary.totalInvoicesCount || 12} ${t("feeDetails.billingCyclesConfigured", { fallback: "billing cycles configured" })}`}
              </span>
            </div>
          </div>

          {/* Metric 2: Total Paid To Date */}
          <div className="flex items-center gap-4 py-4 md:py-0 md:pl-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#d1fae5" }}>
              <CheckCircle size={24} style={{ color: "#059669" }} />
            </div>
            <div className="text-left">
              <span className="text-xl font-black block leading-none text-[#059669]">
                ₹{(summary.totalPaid || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}
              </span>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mt-1.5">
                {t("feeDetails.summary.totalPaid") || "Total Paid to Date"}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 block mt-1">
                {lang === "hi" 
                  ? `${summary.releasedSettledCount || 0} ${t("feeDetails.releasedInvoicesSettled", { fallback: "सक्रिय इनवॉइस चुकता" })}`
                  : `${summary.releasedSettledCount || 0} ${t("feeDetails.releasedInvoicesSettled", { fallback: "released invoices settled" })}`}
              </span>
            </div>
          </div>

          {/* Metric 3: Active Liability Status */}
          {(() => {
            const outstandingIsZero = (summary.outstandingBalance || 0) === 0;
            const outstandingIconBg = outstandingIsZero ? "#d1fae5" : "#fee2e2";
            const outstandingIconColor = outstandingIsZero ? "#059669" : "#dc2626";
            const OutstandingIcon = outstandingIsZero ? CheckCircle : AlertCircle;
            const outstandingTextColor = outstandingIsZero ? "text-emerald-600" : "text-[#dc2626]";

            return (
              <div className="flex items-center gap-4 pt-4 md:pt-0 md:pl-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: outstandingIconBg }}>
                  <OutstandingIcon size={24} style={{ color: outstandingIconColor }} />
                </div>
                <div className="text-left">
                  <span className={`text-xl font-black block leading-none ${outstandingTextColor}`}>
                    ₹{(summary.outstandingBalance || 0).toLocaleString(lang === "hi" ? "hi-IN" : "en-IN")}
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest block mt-1.5 ${outstandingTextColor}`}>
                    {outstandingIsZero 
                      ? t("feeDetails.summary.allPaymentsCleared", { fallback: "All Active Payments Cleared" }) 
                      : t("feeDetails.summary.outstandingBalance", { fallback: "Outstanding Balance" })}
                  </span>
                  <span className={`text-[10px] font-bold block mt-1 ${outstandingIsZero ? "text-emerald-600" : "text-red-500"}`}>
                    {outstandingIsZero ? (
                      t("feeDetails.noActiveLiabilities", { fallback: "No active liabilities" })
                    ) : (
                      lang === "hi" 
                        ? `${summary.activeDuesCount || 0} ${t("feeDetails.invoicesAwaitingPayment", { fallback: "इनवॉइस भुगतान लंबित" })}`
                        : `${summary.activeDuesCount || 0} ${t("feeDetails.invoicesAwaitingPayment", { fallback: "invoices awaiting payment" })}`
                    )}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-black text-[11px] uppercase tracking-wider transition-all ${
                  isActive 
                  ? "bg-[#03045e] text-white shadow-lg shadow-[#03045e]/20" 
                  : "bg-white text-gray-500 hover:bg-[#caf0f8] hover:text-[#0077b6] border border-gray-100"
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabContentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="min-h-[400px]"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="feeDetails.title"
        contentEn={HELPER_CONTENT_EN}
        contentHi={HELPER_HI}
      />
    </motion.div>
  );
}

