import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("ablemarkets_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((credentials) => {
    // Simulate login — in production this calls PHP API
    if (credentials.email === "admin@ablemarkets.com" && credentials.password === "admin123") {
      const adminUser = { id: 1, name: "Admin User", email: credentials.email, role: "admin" };
      setUser(adminUser);
      localStorage.setItem("ablemarkets_user", JSON.stringify(adminUser));
      return { success: true, role: "admin" };
    }
    if (credentials.email === "trader@ablemarkets.com" && credentials.password === "trader123") {
      const traderUser = { id: 2, name: "Demo Trader", email: credentials.email, role: "trader" };
      setUser(traderUser);
      localStorage.setItem("ablemarkets_user", JSON.stringify(traderUser));
      return { success: true, role: "trader" };
    }
    return { success: false, error: "Invalid email or password." };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("ablemarkets_user");
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
