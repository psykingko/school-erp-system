/**
 * mockDB/seed/feeStructures.js
 *
 * Default fee structure templates for all class levels.
 * Admin can override these at runtime; they are stored in localStorage.
 *
 * Structure per template:
 *   id        : unique key e.g. "fs-nursery", "fs-xi-science-nm"
 *   label     : human-readable name
 *   level     : canonical class level ("Nursery"|"LKG"|"UKG"|"1"…"10"|"11"|"12")
 *   streamId  : for XI/XII only ("SCIENCE_NON_MEDICAL"|"SCIENCE_MEDICAL"|"COMMERCE"|"HUMANITIES") else null
 *   stage     : academic stage
 *   feeHeads  : array of { id, label, annualAmount, applicableMonths (null=all 12) }
 *   updatedAt : ISO timestamp of last admin edit
 */

const now = new Date().toISOString();

// Helper — build a standard fee heads array for a level
const heads = (
  tuition,
  transport,
  lab,
  activity,
  tech,
  admission = 0,
  security = 0,
) => [
  {
    id: "tuition",
    label: "Tuition Fee",
    annualAmount: tuition,
    applicableMonths: null,
  },
  {
    id: "transport",
    label: "Transport Fee",
    annualAmount: transport,
    applicableMonths: null,
  },
  {
    id: "lab",
    label: "Laboratory Fee",
    annualAmount: lab,
    applicableMonths: null,
  },
  {
    id: "activity",
    label: "Activity Fee",
    annualAmount: activity,
    applicableMonths: null,
  },
  {
    id: "tech",
    label: "Technology Fee",
    annualAmount: tech,
    applicableMonths: null,
  },
  {
    id: "admission",
    label: "Admission Fee",
    annualAmount: admission,
    applicableMonths: [1],
  }, // April only
  {
    id: "security",
    label: "Security Deposit",
    annualAmount: security,
    applicableMonths: [1],
  }, // April only
];

export const feeStructuresSeed = [
  // ─── Foundation ──────────────────────────────────────────────────────────
  {
    id: "fs-nursery",
    label: "Nursery",
    level: "Nursery",
    streamId: null,
    stage: "foundation",
    feeHeads: heads(36000, 9600, 0, 4800, 3600, 5000, 5000),
    updatedAt: now,
  },
  {
    id: "fs-lkg",
    label: "LKG",
    level: "LKG",
    streamId: null,
    stage: "foundation",
    feeHeads: heads(38400, 9600, 0, 4800, 3600, 5000, 5000),
    updatedAt: now,
  },
  {
    id: "fs-ukg",
    label: "UKG",
    level: "UKG",
    streamId: null,
    stage: "foundation",
    feeHeads: heads(40800, 9600, 0, 4800, 3600, 5000, 5000),
    updatedAt: now,
  },
  // ─── Primary: Class 1–5 ──────────────────────────────────────────────────
  {
    id: "fs-1",
    label: "Class 1",
    level: "1",
    streamId: null,
    stage: "primary",
    feeHeads: heads(43200, 10800, 2400, 4800, 3600, 0, 0),
    updatedAt: now,
  },
  {
    id: "fs-2",
    label: "Class 2",
    level: "2",
    streamId: null,
    stage: "primary",
    feeHeads: heads(43200, 10800, 2400, 4800, 3600, 0, 0),
    updatedAt: now,
  },
  {
    id: "fs-3",
    label: "Class 3",
    level: "3",
    streamId: null,
    stage: "primary",
    feeHeads: heads(45600, 10800, 2400, 4800, 3600, 0, 0),
    updatedAt: now,
  },
  {
    id: "fs-4",
    label: "Class 4",
    level: "4",
    streamId: null,
    stage: "primary",
    feeHeads: heads(45600, 10800, 2400, 4800, 3600, 0, 0),
    updatedAt: now,
  },
  {
    id: "fs-5",
    label: "Class 5",
    level: "5",
    streamId: null,
    stage: "primary",
    feeHeads: heads(48000, 10800, 2400, 4800, 3600, 0, 0),
    updatedAt: now,
  },
  // ─── Middle: Class 6–8 ───────────────────────────────────────────────────
  {
    id: "fs-6",
    label: "Class 6",
    level: "6",
    streamId: null,
    stage: "middle",
    feeHeads: heads(52800, 12000, 4800, 4800, 4800, 0, 0),
    updatedAt: now,
  },
  {
    id: "fs-7",
    label: "Class 7",
    level: "7",
    streamId: null,
    stage: "middle",
    feeHeads: heads(52800, 12000, 4800, 4800, 4800, 0, 0),
    updatedAt: now,
  },
  {
    id: "fs-8",
    label: "Class 8",
    level: "8",
    streamId: null,
    stage: "middle",
    feeHeads: heads(55200, 12000, 4800, 4800, 4800, 0, 0),
    updatedAt: now,
  },
  // ─── Secondary: Class 9–10 ───────────────────────────────────────────────
  {
    id: "fs-9",
    label: "Class 9",
    level: "9",
    streamId: null,
    stage: "secondary",
    feeHeads: heads(60000, 13200, 6000, 4800, 6000, 0, 0),
    updatedAt: now,
  },
  {
    id: "fs-10",
    label: "Class 10",
    level: "10",
    streamId: null,
    stage: "secondary",
    feeHeads: heads(62400, 13200, 6000, 4800, 6000, 0, 0),
    updatedAt: now,
  },
  // ─── Senior Secondary: Class 11 ─────────────────────────────────────────
  {
    id: "fs-11-science-nm",
    label: "Class 11 — Science (Non-Medical)",
    level: "11",
    streamId: "SCIENCE_NON_MEDICAL",
    stage: "senior_secondary",
    feeHeads: heads(72000, 13200, 12000, 4800, 7200, 0, 0),
    updatedAt: now,
  },
  {
    id: "fs-11-science-med",
    label: "Class 11 — Science (Medical)",
    level: "11",
    streamId: "SCIENCE_MEDICAL",
    stage: "senior_secondary",
    feeHeads: heads(72000, 13200, 12000, 4800, 7200, 0, 0),
    updatedAt: now,
  },
  {
    id: "fs-11-commerce",
    label: "Class 11 — Commerce",
    level: "11",
    streamId: "COMMERCE",
    stage: "senior_secondary",
    feeHeads: heads(67200, 13200, 4800, 4800, 7200, 0, 0),
    updatedAt: now,
  },
  {
    id: "fs-11-humanities",
    label: "Class 11 — Humanities",
    level: "11",
    streamId: "HUMANITIES",
    stage: "senior_secondary",
    feeHeads: heads(64800, 13200, 2400, 4800, 7200, 0, 0),
    updatedAt: now,
  },
  // ─── Senior Secondary: Class 12 ────────────────────────────────────────
  {
    id: "fs-12-science-nm",
    label: "Class 12 — Science (Non-Medical)",
    level: "12",
    streamId: "SCIENCE_NON_MEDICAL",
    stage: "senior_secondary",
    feeHeads: heads(74400, 13200, 12000, 4800, 7200, 0, 0),
    updatedAt: now,
  },
  {
    id: "fs-12-science-med",
    label: "Class 12 — Science (Medical)",
    level: "12",
    streamId: "SCIENCE_MEDICAL",
    stage: "senior_secondary",
    feeHeads: heads(74400, 13200, 12000, 4800, 7200, 0, 0),
    updatedAt: now,
  },
  {
    id: "fs-12-commerce",
    label: "Class 12 — Commerce",
    level: "12",
    streamId: "COMMERCE",
    stage: "senior_secondary",
    feeHeads: heads(69600, 13200, 4800, 4800, 7200, 0, 0),
    updatedAt: now,
  },
  {
    id: "fs-12-humanities",
    label: "Class 12 — Humanities",
    level: "12",
    streamId: "HUMANITIES",
    stage: "senior_secondary",
    feeHeads: heads(67200, 13200, 2400, 4800, 7200, 0, 0),
    updatedAt: now,
  },
];

/**
 * Look up the fee structure for a given class record.
 * @param {Array} feeStructures  - All stored fee structures
 * @param {Object} cls           - A class record from seed (has level, streamId)
 * @returns {Object|null}
 */
export const getFeeStructureForClass = (feeStructures, cls) => {
  if (!cls) return null;
  const isSenior = cls.level === "11" || cls.level === "12";
  if (isSenior) {
    return (
      feeStructures.find(
        (fs) =>
          fs.level === cls.level &&
          fs.streamId === (cls.streamId || cls.stream),
      ) || null
    );
  }
  return (
    feeStructures.find((fs) => fs.level === cls.level && !fs.streamId) || null
  );
};

/**
 * Compute the annual total fee for a class from its fee structure.
 */
export const computeAnnualTotal = (feeStructure) => {
  if (!feeStructure) return 0;
  return feeStructure.feeHeads.reduce(
    (sum, h) => sum + (h.annualAmount || 0),
    0,
  );
};
