import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 👈 Importa el hook

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth(); // ✅ Usa el estado del contexto

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;