/**
 * persistence/seedInitializer.js
 * Simplified seed data initialization for the ERP.
 *
 * Now uses direct static seeding without workflow engines.
 */

import { STORAGE_KEYS } from "./storageKeys";
import { hasKey } from "./storage";
import { initializeERP } from "../initialization/initializeERP";

/**
 * Checks if seed data needs to be initialized.
 * @returns {boolean}
 */
export const needsInitialization = () => {
  return !hasKey(STORAGE_KEYS.STUDENTS);
};

/**
 * Initializes seed data. Delegates to the simplified ERP Initialization.
 */
export const initializeSeedData = () => {
  try {
    initializeERP();
    return true;
  } catch (error) {
    console.error("[seedInitializer] Seed initialization error:", error);
    return false;
  }
};

/**
 * Ensures seed data is initialized.
 * @returns {boolean} Success status
 */
export const ensureSeedData = () => {
  try {
    initializeERP();
    return true;
  } catch (e) {
    return false;
  }
};

export default {
  needsInitialization,
  initializeSeedData,
  ensureSeedData,
};
