import { createContext, useEffect, useRef, useState } from "react";
import { getMe } from "../services/auth.api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasCheckedSessionRef = useRef(false);

  useEffect(() => {
    if (hasCheckedSessionRef.current) return;
    hasCheckedSessionRef.current = true;

    const getAndSetUser = async () => {
      try {
        const data = await getMe();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getAndSetUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
