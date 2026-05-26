/**
 * persistence/storage.js
 * Centralized persistence layer for EduDash ERP.
 * Provides safe localStorage access with error handling, JSON parsing, and schema safety.
 *
 * RESPONSIBILITIES:
 * - Safe localStorage reads/writes
 * - JSON parsing with fallback
 * - Error handling
 * - Schema-safe persistence access
 *
 * This layer MUST NOT:
 * - Contain workflow logic
 * - Contain UI logic
 * - Know about React
 * - Simulate backend APIs
 */

import { STORAGE_KEYS } from "./storageKeys";

// Local, in-memory read cache to bypass localStorage and JSON parsing overhead
const memoryCache = new Map();

/**
 * Safely retrieves data from localStorage.
 * @param {string} key - Storage key from STORAGE_KEYS
 * @param {any} defaultValue - Default value if key doesn't exist or parsing fails
 * @returns {any} Parsed data or default value
 */
export const getItem = (key, defaultValue = null) => {
  if (memoryCache.has(key)) {
    const cached = memoryCache.get(key);
    return cached !== null && typeof cached === 'object' ? JSON.parse(JSON.stringify(cached)) : cached;
  }
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    try {
      const parsed = JSON.parse(item);
      memoryCache.set(key, parsed);
      return parsed !== null && typeof parsed === 'object' ? JSON.parse(JSON.stringify(parsed)) : parsed;
    } catch {
      // Value was stored as a raw string (e.g. schema version written without JSON.stringify).
      // Return it as-is so version checks still work.
      memoryCache.set(key, item);
      return item;
    }
  } catch (error) {
    console.error(`Storage error reading key "${key}":`, error);
    return defaultValue;
  }
};

/**
 * Safely writes data to localStorage.
 * @param {string} key - Storage key from STORAGE_KEYS
 * @param {any} value - Data to store (will be JSON.stringify'd)
 * @returns {boolean} Success status
 */
export const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    memoryCache.set(key, value);
    return true;
  } catch (error) {
    console.error(`Storage error writing key "${key}":`, error);
    return false;
  }
};

/**
 * Safely removes a key from localStorage.
 * @param {string} key - Storage key from STORAGE_KEYS
 * @returns {boolean} Success status
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
    memoryCache.delete(key);
    return true;
  } catch (error) {
    console.error(`Storage error removing key "${key}":`, error);
    return false;
  }
};

/**
 * Checks if a key exists in localStorage.
 * @param {string} key - Storage key from STORAGE_KEYS
 * @returns {boolean}
 */
export const hasKey = (key) => {
  if (memoryCache.has(key)) return true;
  try {
    return localStorage.getItem(key) !== null;
  } catch (error) {
    console.error(`Storage error checking key "${key}":`, error);
    return false;
  }
};

/**
 * Clears all ERP data from localStorage (excluding auth state).
 * Use with caution - typically for demo reset or testing.
 */
export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      if (key !== STORAGE_KEYS.AUTH_STATE) {
        localStorage.removeItem(key);
        memoryCache.delete(key);
      }
    });
    return true;
  } catch (error) {
    console.error("Storage error clearing all data:", error);
    return false;
  }
};

/**
 * Clears authentication state only.
 */
export const clearAuth = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH_STATE);
    memoryCache.delete(STORAGE_KEYS.AUTH_STATE);
    sessionStorage.clear();
    return true;
  } catch (error) {
    console.error("Storage error clearing auth:", error);
    return false;
  }
};

/**
 * Gets all stored data keys for debugging.
 * @returns {string[]} Array of stored keys
 */
export const getAllStoredKeys = () => {
  try {
    return Object.values(STORAGE_KEYS).filter((key) => hasKey(key));
  } catch (error) {
    console.error("Storage error getting all keys:", error);
    return [];
  }
};

/**
 * Batch set multiple items atomically (as atomic as localStorage allows).
 * @param {Object} items - Object with key-value pairs
 * @returns {boolean} Success status
 */
export const setItems = (items) => {
  try {
    Object.entries(items).forEach(([key, value]) => {
      setItem(key, value);
    });
    return true;
  } catch (error) {
    console.error("Storage error batch setting items:", error);
    return false;
  }
};

export default {
  getItem,
  setItem,
  removeItem,
  hasKey,
  clearAllData,
  clearAuth,
  getAllStoredKeys,
  setItems,
};
