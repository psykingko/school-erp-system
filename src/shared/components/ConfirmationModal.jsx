import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import PropTypes from "prop-types";
import { useLanguage } from "../../context/LanguageContext";

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  warningText,
  onConfirm,
  onCancel,
  confirmButtonText,
  cancelButtonText,
}) => {
  const { t } = useLanguage();
  
  const confirmText = confirmButtonText || t("btn.confirm");
  const cancelText = cancelButtonText || t("btn.cancel");
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && onCancel()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl w-full w-[95vw] md:w-[90vw] lg:max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#03045e] px-6 py-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 rounded-xl">
                  <AlertTriangle size={20} className="text-amber-400" />
                </div>
                <h3 className="text-base font-black text-white">{title}</h3>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-gray-700 font-semibold leading-relaxed">
                {message}
              </p>

              {warningText && (
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50 border border-amber-200">
                  <AlertTriangle
                    size={16}
                    className="text-amber-500 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-xs font-bold text-amber-700 leading-relaxed">
                    {warningText}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex items-center gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-2xl text-xs font-black border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 rounded-2xl text-xs font-black bg-[#0077b6] text-white hover:bg-[#03045e] transition-colors"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  warningText: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmButtonText: PropTypes.string,
  cancelButtonText: PropTypes.string,
};

export default ConfirmationModal;
