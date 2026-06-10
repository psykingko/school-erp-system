import { getItem } from "./src/persistence/storage.js";
import { STORAGE_KEYS } from "./src/persistence/storageKeys.js";

// Mock localStorage for node environment since it runs outside browser
import { readFileSync } from 'fs';
const dbPath = './src/data/mockDB/seed/teachersSeed.js';
console.log("Checking teachers list...");

const content = readFileSync(dbPath, 'utf-8');
const matches = [...content.matchAll(/id:\s*"(.*?)"/g)].map(m => m[1]);
console.log("Teachers found in seed by id:", matches.length > 0 ? matches : "None found");
