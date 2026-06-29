/**
 * Defines the standard access levels for employees.
 * This prevents arbitrary strings and ensures consistency across the Administrative Reference module.
 */
export const ACCESS_LEVELS = [
  "Super Admin",
  "Admin",
];

// Helper to determine badge colors based on access level
export const getAccessLevelBadgeColor = (level) => {
  switch (level) {
    case "Super Admin":
      return "bg-red-50 text-red-700 border-red-200";
    case "Admin":
      return "bg-[#03045e]/10 text-[#03045e] border-[#03045e]/20";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};
