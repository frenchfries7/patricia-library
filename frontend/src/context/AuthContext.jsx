import { createContext, useContext, useState } from "react";
import { ENDPOINTS, STORAGE } from "../config/api";
import { apiRequest } from "../services/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE.user));
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    const data = await apiRequest(ENDPOINTS.login, {
      method: "POST",
      body: { email, password },
    });
    localStorage.setItem(STORAGE.token, data.token);
    localStorage.setItem(STORAGE.user, JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE.token);
    localStorage.removeItem(STORAGE.user);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
