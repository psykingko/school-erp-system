// src/utils/attendanceHelpers.js
// Palette: #03045e deep-twilight | #0077b6 bright-teal-blue | #00b4d8 turquoise-surf | #caf0f8 light-cyan

export function getAttendanceStatus(percentage) {
  if (percentage >= 85) {
    return {
      status: "excellent",
      colorClass: "text-[#00b4d8]",
      bgClass: "bg-[#00b4d8]/20",
      barClass: "bg-[#00b4d8]",
      strokeColor: "#00b4d8",
      message: "Excellent! Keep it up",
    };
  } else if (percentage >= 75) {
    return {
      status: "moderate",
      colorClass: "text-[#0077b6]",
      bgClass: "bg-[#0077b6]/20",
      barClass: "bg-[#0077b6]",
      strokeColor: "#0077b6",
      message: "Getting there! Push a bit more",
    };
  } else {
    return {
      status: "warning",
      colorClass: "text-red-500",
      bgClass: "bg-red-100",
      barClass: "bg-red-400",
      strokeColor: "#EF4444",
      message: "Attendance low! Attend more classes",
    };
  }
}

export function getFeeStatusStyle(status) {
  const map = {
    paid: { bgClass: "bg-[#00b4d8]/20", textClass: "text-[#00b4d8]" },
    unpaid: { bgClass: "bg-[#0077b6]/20", textClass: "text-[#0077b6]" },
    overdue: { bgClass: "bg-red-100", textClass: "text-red-600" },
  };
  return map[status] ?? map.unpaid;
}

export function getNoticePriorityStyle(priority) {
  const map = {
    high: { bgClass: "bg-red-100", textClass: "text-red-600" },
    medium: { bgClass: "bg-[#0077b6]/20", textClass: "text-[#0077b6]" },
    low: { bgClass: "bg-[#00b4d8]/20", textClass: "text-[#00b4d8]" },
  };
  return map[priority] ?? map.low;
}

export function formatDate(date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getFeeProgress(amountPaid, totalAmount) {
  if (totalAmount <= 0) return 0;
  return Math.min(100, Math.round((amountPaid / totalAmount) * 100));
}
