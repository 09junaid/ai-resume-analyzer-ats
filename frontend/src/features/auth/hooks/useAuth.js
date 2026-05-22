import { useContext } from "react";
import { AuthContext } from "../context/auth.context";
import { login, register, logout, getMe } from "../services/auth.api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const { user, setUser, loading, setLoading } = context;

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await login({ email, password });
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);
    try {
      const data = await register({ username, email, password });
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setUser(null);
    setLoading(false);
  };
  const handleGetMe = async () => {
    setLoading(true);
    const data = await getMe();
    setUser(data.user);
    setLoading(false);
  };
  return {
    user,
    setUser,
    loading,
    setLoading,
    handleLogin,
    handleRegister,
    handleLogout,
    handleGetMe,
  };
};
