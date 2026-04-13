import { createContext, useContext, useState, useCallback } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("vantagemarkets_user");
    //const stored = localStorage.getItem("vm_token");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (credentials) => {
    try {
      // For demonstration, we still allow demo login to bypass actual API if needed
      // But we show how to call the authService.login endpoint:
      
      const response = await authService.login(credentials);
      if (response.success) {
        setUser(response.user);
        localStorage.setItem("vantagemarkets_user", JSON.stringify(response.user));
        return { success: true, role: response.user.role };
      }
      

      if (credentials.email === "admin@vantageCFD.com" && credentials.password === "admin123") {
        const adminUser = { id: 1, name: "Admin User", email: credentials.email, role: "admin" };
        setUser(adminUser);
        localStorage.setItem("vantagemarkets_user", JSON.stringify(adminUser));
        return { success: true, role: "admin" };
      }
      if (credentials.email === "trader@vantageCFD.com" && credentials.password === "trader123") {
        const traderUser = { id: 2, name: "Demo Trader", email: credentials.email, role: "trader" };
        setUser(traderUser);
        localStorage.setItem("vm_token", JSON.stringify(traderUser));
        return { success: true, role: "trader" };
      }
      return { success: false, error: "Invalid email or password." };
    } catch (err) {
      return { success: false, error: err.message || "Login failed." };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("vantagemarkets_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
