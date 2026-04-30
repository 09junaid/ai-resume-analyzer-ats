import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import AppLoader from "../../../components/common/AppLoader";

/**
 * Renders children only when there is no authenticated user.
 * Logged-in users are sent to the workspace instead of login/register.
 */
const GuestOnly = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoader title="Loading" subtitle="Checking your session..." />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestOnly;
