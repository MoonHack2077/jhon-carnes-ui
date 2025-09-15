import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    // Si el usuario ya está autenticado, lo redirige a la página principal
    return <Navigate to="/" />;
  }

  // Si no está autenticado, le muestra la ruta (la página de Login)
  return <Outlet />;
};

export default PublicRoute;