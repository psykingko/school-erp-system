import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save } from "lucide-react";

/**
 * AdminEditForm
 * 
 * Reusable centred modal editor for Student, Teacher, Parent, and Admin records.
 * Keeps UI components clean, modular, and extremely polished.
 */
const AdminEditForm = ({ 
  isOpen, 
  onClose, 
  title = "Edit Registry Entry", 
  data = {}, 
  fields = [], 
  onSubmit,
  onChange
}) => {
  const [formState, setFormState] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (data) {
      const initial = {};
      fields.forEach(field => {
        initial[field.name] = data[field.name] !== undefined ? data[field.name] : "";
      });
      setFormState(initial);
    }
  }, [data, fields]);

  const handleChange = (name, value) => {
    setFormState(prev => {
      const newState = { ...prev, [name]: value };
      if (onChange) {
        const customState = onChange(name, value, newState);
        if (customState) return customState;
      }
      return newState;
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formState);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 z-40 backdrop-blur-[2px]"
          />

          {/* Centered Dialog Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.form
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              onSubmit={handleFormSubmit}
              className="bg-white rounded-3xl shadow-2xl border border-[#caf0f8] w-full max-w-2xl flex flex-col pointer-events-auto overflow-hidden max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-[#caf0f8] flex items-center justify-between bg-gray-50/50">
                <div>
                  <h3 className="text-sm font-black text-[#03045e] uppercase tracking-wider">{title}</h3>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Primary administrative record mutation</p>
                </div>
                <button 
                  type="button"
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-white hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors border border-[#caf0f8]/50"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Modal Body Scroll */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {fields.map((field) => {
                  const isHidden = typeof field.hidden === 'function' ? field.hidden(formState) : !!field.hidden;
                  if (isHidden) return null;

                  return (
                    <div key={field.name} className="space-y-1.5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
                        {field.label}
                      </label>
                      {field.type === "select" ? (
                        <select
                          value={formState[field.name] || ""}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          className="w-full px-4 py-2.5 rounded-2xl bg-[#caf0f8]/10 border border-[#caf0f8]/50 text-xs text-gray-700 font-bold focus:outline-none focus:border-[#0077b6] transition-colors"
                        >
                          <option value="">Select option...</option>
                          {(field.options || []).map(opt => {
                            const val = typeof opt === 'object' ? opt.value : opt;
                            const label = typeof opt === 'object' ? opt.label : opt;
                            return <option key={val} value={val}>{label}</option>;
                          })}
                        </select>
                      ) : field.type === "checkbox" ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!formState[field.name]}
                            onChange={(e) => handleChange(field.name, e.target.checked)}
                            className="rounded text-[#0077b6] focus:ring-[#0077b6] border-[#caf0f8]"
                          />
                          <span className="text-xs text-gray-700 font-bold">Yes, Assign Authority</span>
                        </label>
                      ) : field.type === "textarea" ? (
                        <textarea
                          value={formState[field.name] || ""}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                          className="w-full px-4 py-2.5 rounded-2xl bg-[#caf0f8]/10 border border-[#caf0f8]/50 text-xs text-gray-700 font-bold focus:outline-none focus:border-[#0077b6] placeholder-gray-300 transition-colors min-h-[100px]"
                          required={field.required}
                        />
                      ) : field.type === "custom" ? (
                        field.render({
                          value: formState[field.name],
                          onChange: (val) => handleChange(field.name, val)
                        })
                      ) : (
                        <input
                          type={field.type || "text"}
                          value={formState[field.name] || ""}
                          onChange={(e) => handleChange(field.name, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}...`}
                          className="w-full px-4 py-2.5 rounded-2xl bg-[#caf0f8]/10 border border-[#caf0f8]/50 text-xs text-gray-700 font-bold focus:outline-none focus:border-[#0077b6] placeholder-gray-300 transition-colors"
                          required={field.required}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#caf0f8] bg-gray-50 flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-500 hover:bg-gray-150 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 bg-[#0077b6] hover:bg-[#03045e] text-white px-5 py-2.5 rounded-2xl text-xs font-black shadow-sm transition-all disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{submitting ? "SAVING..." : "SAVE CHANGES"}</span>
                </button>
              </div>
            </motion.form>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default React.memo(AdminEditForm);
