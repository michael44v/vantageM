import { createContext, useContext, useState, useCallback } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("vantagemarkets_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        const userData = { ...response.user, token: response.token };
        setUser(userData);
        localStorage.setItem("vantagemarkets_user", JSON.stringify(userData));
        return { success: true, role: response.user.role };
      }
      return { success: false, error: response.error || "Login failed." };
    } catch (err) {
      return { success: false, error: err.message || "Login failed." };
    }
  }, []);

  const register = useCallback(async (formData) => {
    try {
      const response = await authService.register(formData);
      return response;
    } catch (err) {
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("vantagemarkets_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
