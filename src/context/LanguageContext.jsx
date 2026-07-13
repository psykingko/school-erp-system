import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { translations } from "../translations";
import { getItem, setItem } from "../persistence/storage";
import { useAuth } from "./AuthContext";

const LanguageContext = createContext();

const LANG_STORAGE_KEY = "edudash_lang_pref";

export function LanguageProvider({ children }) {
  const { role } = useAuth();

  // Initialize state directly from storage or default to English
  const [lang, setLang] = useState(() => {
    return getItem(LANG_STORAGE_KEY) || "en";
  });

  // Persist language preference whenever it changes
  useEffect(() => {
    setItem(LANG_STORAGE_KEY, lang);
  }, [lang]);

  const handleSetLang = useCallback((newLang) => {
    setLang(newLang);
  }, []);

  const t = useCallback(
    (key, params = {}) => {
      if (!key) return "";

      let text = translations[lang]?.[key];

      // Missing key handling policy
      if (text === undefined) {
        if (process.env.NODE_ENV === "development" && role !== "STUDENT" && params?.fallback === undefined) {
          console.warn(`Missing translation for key: "${key}" in lang: "${lang}"`);
        }
        text = params?.fallback !== undefined ? params.fallback : key; // Fallback to params.fallback or key
      }

      // Ensure text is a string before calling replace
      if (typeof text !== "string") text = String(text);

      // Only iterate if params is a non-null object
      if (params && typeof params === "object" && !Array.isArray(params)) {
        Object.keys(params).forEach((paramKey) => {
          text = text.replace(
            new RegExp(`\\{${paramKey}\\}`, "g"),
            params[paramKey],
          );
        });
      }

      return text;
    },
    [lang, role],
  );

  const value = useMemo(
    () => ({ lang, setLang: handleSetLang, t }),
    [lang, handleSetLang, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
