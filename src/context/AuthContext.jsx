import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { ROLES } from "../auth/roles";
import { authenticate } from "../services/authService";
import { getItem, setItem, removeItem } from "../persistence/storage";
import { STORAGE_KEYS } from "../persistence/storageKeys";

const AuthContext = createContext(null);

/**
 * AuthProvider
 *
 * Scalable frontend authentication architecture.
 * Manages user state, roles, and simulated authentication flow.
 */
export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // Initialize state from localStorage or defaults
  const [authState, setAuthState] = useState(() => {
    const saved = getItem(STORAGE_KEYS.AUTH_STATE);
    if (saved) {
      try {
        return saved;
      } catch (e) {
        // invalid JSON
      }
    }
    return {
      user: null,
      isAuthenticated: false,
    };
  });

  // Sync state to localStorage safely
  useEffect(() => {
    if (authState.isAuthenticated) {
      setItem(STORAGE_KEYS.AUTH_STATE, authState);
    } else {
      removeItem(STORAGE_KEYS.AUTH_STATE);
    }
  }, [authState]);

  const login = useCallback(async (role, username, password) => {
    // Force-clear any stale session before processing new login
    setAuthState({ user: null, isAuthenticated: false });

    try {
      const authenticatedSession = await authenticate({
        role,
        username,
        password,
      });

      setAuthState({
        user: authenticatedSession,
        isAuthenticated: true,
      });
      return true;
    } catch (error) {
      console.error("Authentication failed:", error);
      throw error; // Throw error to be caught by UI
    }
  }, []);

  const logout = useCallback(() => {
    // Clear memory state
    setAuthState({
      user: null,
      isAuthenticated: false,
    });

    // Remove persistence
    removeItem(STORAGE_KEYS.AUTH_STATE);
    sessionStorage.clear();

    // Navigate safely
    navigate("/login", { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({
      user: authState.user,
      role: authState.user?.role,
      isAuthenticated: authState.isAuthenticated,
      isStudent: authState.user?.role === ROLES.STUDENT,
      isParent: authState.user?.role === ROLES.PARENT,
      isTeacher: authState.user?.role === ROLES.TEACHER,
      isAdmin: authState.user?.role === ROLES.ADMIN,
      isSuperAdmin: !!authState.user?.isSuperAdmin,
      login,
      logout,
    }),
    [authState.user, authState.isAuthenticated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
