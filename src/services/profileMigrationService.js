import { getItem, setItem } from "../persistence/storage";
import { STORAGE_KEYS } from "../persistence/storageKeys";
import { DEFAULT_GENDER } from "../constants/genderConstants";

/**
 * Migration service to ensure all existing profiles have a gender.
 * Applies a one-time upgrade to existing LocalStorage data.
 */
export const runGenderMigration = () => {
  try {
    const CURRENT_GENDER_SCHEMA = 3;
    const storedGenderSchema = parseInt(getItem("erp_gender_schema_version") || "1", 10);
    
    if (storedGenderSchema < CURRENT_GENDER_SCHEMA) {
      console.log(`[MigrationService] Upgrading profile schema v${storedGenderSchema} → v${CURRENT_GENDER_SCHEMA} (adding gender)`);
      
      const migrateCollection = (key) => {
        const items = getItem(key) || [];
        let updated = false;
        
        const migratedItems = items.map(item => {
          if (!item.gender) {
            updated = true;
            const name = item.employeeName || item.name || item.teacherName || "";
            const isFemale = /Neha|Sunita|Priya|Lakshmi|Geeta|Meena|Pooja|Shanti|Aarohi|Ananya|Diya|Ishita|Kavya|Myra|Navya|Prisha/i.test(name);
            return { ...item, gender: isFemale ? "Female" : DEFAULT_GENDER };
          }
          return item;
        });

        if (updated) {
          setItem(key, migratedItems);
          console.log(`[MigrationService] Migrated ${key} collection.`);
        }
      };

      migrateCollection(STORAGE_KEYS.STUDENTS);
      migrateCollection(STORAGE_KEYS.TEACHERS);
      migrateCollection(STORAGE_KEYS.EMPLOYEES);

      setItem("erp_gender_schema_version", CURRENT_GENDER_SCHEMA);
      console.log("[MigrationService] Profile schema upgrade complete.");
    }
  } catch (error) {
    console.error("[MigrationService] Failed to run gender migration:", error);
  }
};
