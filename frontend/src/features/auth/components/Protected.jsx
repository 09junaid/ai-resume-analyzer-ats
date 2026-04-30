import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import AppLoader from "../../../components/common/AppLoader";

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <AppLoader
        title="Authenticating"
        subtitle="Checking your login and preparing dashboard..."
      />
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default Protected;
