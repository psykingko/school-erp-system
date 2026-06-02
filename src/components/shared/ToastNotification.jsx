import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, AlertTriangle, X } from "lucide-react";
import PropTypes from "prop-types";

const ToastNotification = ({ show, message, type = "success", onClose }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
  };

  const colors = {
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-800",
      iconBg: "bg-emerald-200/50",
      iconText: "text-emerald-700",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      iconBg: "bg-red-200/50",
      iconText: "text-red-700",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      iconBg: "bg-amber-200/50",
      iconText: "text-amber-700",
    },
  };

  const Icon = icons[type] || CheckCircle;
  const color = colors[type] || colors.success;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border ${color.bg} ${color.border} ${color.text} z-[100]`}
        >
          <div className={`p-2 rounded-xl ${color.iconBg} ${color.iconText}`}>
            <Icon size={18} />
          </div>
          <p className="text-xs font-black">{message}</p>
          <button
            onClick={onClose}
            className="ml-2 p-1.5 rounded-lg hover:bg-black/5 opacity-60 hover:opacity-100 transition-all"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

ToastNotification.propTypes = {
  show: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["success", "error", "warning"]),
  onClose: PropTypes.func.isRequired,
};

export default ToastNotification;
