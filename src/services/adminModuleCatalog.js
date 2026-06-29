import { ADMIN_SECTIONS } from "../auth/navigation";
import { useLanguage } from "../context/LanguageContext"; // Not purely a React component, but typically translated strings would be here. Let's just output raw keys/labels.

// We will map over ADMIN_SECTIONS to extract modules.
// Currently the "label" is not stored in navigation.js, it relies on translation keys `nav.${item.id}`.
// For the admin backend module catalog, we will provide a readable default label.

/**
 * Derives a readable label from an ID like "admin_academic_performance" -> "Academic Performance"
 */
const deriveLabelFromId = (id) => {
  return id
    .replace(/^admin_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Service to provide the catalog of assignable admin modules dynamically
 * derived from the main navigation configuration.
 */
const adminModuleCatalog = {
  /**
   * Returns a flat array of all admin modules.
   */
  getAllModules: () => {
    const modules = [];
    ADMIN_SECTIONS.forEach((section) => {
      section.items.forEach((item) => {
        // Exclude pure structural/personal items like home or logout
        if (item.id === "admin_home" || item.id === "logout" || item.id === "admin_profile") {
          return;
        }
        modules.push({
          id: item.id,
          label: deriveLabelFromId(item.id),
          section: section.titleKey || section.title,
        });
      });
    });
    return modules;
  },

  /**
   * Returns a specific module by ID.
   */
  getModuleById: (moduleId) => {
    const all = adminModuleCatalog.getAllModules();
    return all.find((m) => m.id === moduleId) || null;
  },

  /**
   * Returns modules grouped by their section title.
   * e.g., { "User Management": [{ id, label, section }, ...], ... }
   */
  groupModulesBySection: () => {
    const groups = {};
    const all = adminModuleCatalog.getAllModules();
    all.forEach((module) => {
      if (!groups[module.section]) {
        groups[module.section] = [];
      }
      groups[module.section].push(module);
    });
    return groups;
  },
};

export default adminModuleCatalog;
