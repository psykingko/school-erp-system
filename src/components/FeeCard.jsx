import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Wallet,
  CheckCircle,
  AlertOctagon,
  AlertTriangle,
} from "lucide-react";
import { getFeeStatusStyle, getFeeProgress } from "../utils/attendanceHelpers";
import { useLanguage } from "../context/LanguageContext";
import { useViewMode } from "../context/ViewModeContext";
import HelperPopup from "./HelperPopup";
import HelperButton from "./HelperButton";

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const HELPER_CONTENT_EN =
  "This section shows the fee payment status for the semester. Fees must be paid by the due date to avoid penalties or academic holds.";
const HELPER_CONTENT_HI =
  "यह अनुभाग सेमेस्टर की फीस भुगतान स्थिति दिखाता है। जुर्माने या शैक्षणिक रोक से बचने के लिए नियत तारीख तक फीस का भुगतान करना आवश्यक है।";

const FEE_COLOR_LEGEND = [
  {
    color: "#00b4d8",
    labelEn: "Green — Fees have been paid. No action needed.",
    labelHi: "हरा — फीस का भुगतान हो गया है। कोई कार्रवाई आवश्यक नहीं।",
  },
  {
    color: "#F59E0B",
    labelEn: "Yellow — Fees are pending. Please pay before the due date.",
    labelHi: "पीला — फीस बकाया है। कृपया नियत तारीख से पहले भुगतान करें।",
  },
  {
    color: "#EF4444",
    labelEn: "Red — Fees are overdue. Immediate payment required.",
    labelHi: "लाल — फीस की अंतिम तिथि निकल गई है। तुरंत भुगतान आवश्यक है।",
  },
];

const TRAFFIC_COLOR = {
  paid: "#00b4d8",
  unpaid: "#F59E0B",
  overdue: "#EF4444",
};

function TrafficLight({ status }) {
  const color = TRAFFIC_COLOR[status] ?? TRAFFIC_COLOR.unpaid;
  return (
    <div
      className="w-4 h-4 rounded-full flex-shrink-0"
      style={{ backgroundColor: color }}
      aria-hidden="true"
    />
  );
}

function FeeCard({
  amount,
  currency = "₹",
  dueDate,
  status,
  amountPaid,
  totalAmount,
}) {
  const { t, lang } = useLanguage();
  const { isParentMode } = useViewMode();
  const [showHelper, setShowHelper] = useState(false);

  const { bgClass, textClass } = getFeeStatusStyle(status);
  const progress = getFeeProgress(amountPaid, totalAmount);
  const isPaid = status === "paid";

  const amountColorMap = {
    paid: "text-[#00b4d8]",
    unpaid: "text-[#0077b6]",
    overdue: "text-red-500",
  };
  const amountColor = amountColorMap[status] ?? "text-[#0077b6]";

  const barColorMap = {
    paid: "bg-[#00b4d8]",
    unpaid: "bg-[#0077b6]",
    overdue: "bg-red-400",
  };
  const barColor = barColorMap[status] ?? "bg-[#0077b6]";

  const glowMap = {
    paid: "2px solid #00b4d8",
    unpaid: "2px solid #0077b6",
    overdue: "2px solid #EF4444",
  };

  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const formatAmount = (n) => n.toLocaleString("en-IN");
  const StatusIcon = isPaid
    ? CheckCircle
    : status === "overdue"
      ? AlertOctagon
      : AlertTriangle;

  const parentMsgKey = {
    paid: "fees.parentPaid",
    unpaid: "fees.parentUnpaid",
    overdue: "fees.parentOverdue",
  };

  const parentStatusLabel = {
    paid: t("fees.paid"),
    unpaid: t("fees.actionNeeded"),
    overdue: t("fees.actionNeeded"),
  };

  return (
    <>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white rounded-3xl p-6 shadow-md flex flex-col gap-4 cursor-default select-none relative overflow-hidden"
        style={{ outline: glowMap[status] ?? glowMap.unpaid }}
        role="region"
        aria-label={`Fee status: ${statusLabel}. Amount due: ${currency}${formatAmount(amount)}`}
      >
        {/* Helper button */}
        <HelperButton onClick={() => setShowHelper(true)} />

        {/* Header */}
        <div className="flex items-center gap-2">
          <div
            className="p-2 rounded-xl"
            style={{ backgroundColor: "#caf0f8" }}
          >
            <Wallet size={26} style={{ color: "#03045e" }} aria-hidden="true" />
          </div>
          <h2 className="text-lg font-bold" style={{ color: "#03045e" }}>
            {t("fees.title")}
          </h2>
        </div>

        {/* Pulsing warning — shown below header, not competing with HelperButton */}
        {!isPaid && (
          <span
            className="flex items-center gap-1.5 self-start"
            aria-label="Payment pending"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-xs font-semibold text-red-500">
              {t("fees.actionNeeded")}
            </span>
          </span>
        )}

        {/* Amount */}
        <div className="flex items-baseline gap-1">
          <motion.span
            className={`text-5xl font-black ${amountColor} leading-none`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          >
            {currency}
            {formatAmount(amount)}
          </motion.span>
          <span className="text-sm text-gray-400 font-medium ml-1">
            {t("fees.outstanding")}
          </span>
        </div>

        {/* Due date */}
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar size={21} className="flex-shrink-0" aria-hidden="true" />
          <span className="text-sm font-semibold">
            {t("fees.due")}: {dueDate}
          </span>
        </div>

        {/* Status badge */}
        <motion.div
          className={`self-start flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold ${bgClass} ${textClass}`}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          aria-label={`Payment status: ${statusLabel}`}
        >
          <StatusIcon size={18} aria-hidden="true" />
          {statusLabel}
        </motion.div>

        {/* Parent-friendly message */}
        {isParentMode && (
          <motion.div
            className="flex flex-col gap-2"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <TrafficLight status={status} />
              <span
                className="text-sm font-bold"
                style={{ color: TRAFFIC_COLOR[status] }}
              >
                {parentStatusLabel[status]}
              </span>
            </div>
            <p
              className="text-sm font-semibold leading-snug rounded-2xl px-4 py-2"
              style={{ backgroundColor: "#caf0f8", color: "#03045e" }}
            >
              {t(parentMsgKey[status])}
            </p>
          </motion.div>
        )}

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-gray-500">
            <span>
              {t("fees.paid")}: {currency}
              {formatAmount(amountPaid)}
            </span>
            <span>
              {t("fees.total")}: {currency}
              {formatAmount(totalAmount)}
            </span>
          </div>
          <div
            className="w-full h-3 rounded-full overflow-hidden"
            style={{ backgroundColor: "#caf0f8" }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Payment progress: ${progress}%`}
          >
            <motion.div
              className={`h-full rounded-full ${barColor}`}
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
            />
          </div>
          <p className="text-xs text-gray-400 text-right font-medium">
            {progress}% {t("fees.paid").toLowerCase()}
          </p>
        </div>
      </motion.div>

      <HelperPopup
        isOpen={showHelper}
        onClose={() => setShowHelper(false)}
        titleKey="fees.title"
        contentEn={HELPER_CONTENT_EN}
        contentHi={HELPER_CONTENT_HI}
        colorLegend={FEE_COLOR_LEGEND}
      />
    </>
  );
}

export default FeeCard;
