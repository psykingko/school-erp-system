import React, { createContext, useContext, useState, useMemo } from "react";

const ViewModeContext = createContext(null);

export function ViewModeProvider({ children }) {
  const [viewMode, setViewMode] = useState("student");

  // FIX: memoize the context value so consumers only re-render when viewMode
  // actually changes, not on every parent render.
  const value = useMemo(
    () => ({
      viewMode,
      setViewMode,
      isParentMode: viewMode === "parent",
    }),
    [viewMode],
  );

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const ctx = useContext(ViewModeContext);
  if (!ctx) throw new Error("useViewMode must be used within ViewModeProvider");
  return ctx;
}
