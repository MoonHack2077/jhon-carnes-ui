import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // TODO: Reemplazaremos esta lógica con nuestro AuthContext en el siguiente paso.
  const isAuthenticated = localStorage.getItem('token'); // Una forma simple de verificar

  if (!isAuthenticated) {
    // Si no está autenticado, redirige al login
    return <Navigate to="/login" />;
  }

  // Si está autenticado, renderiza el componente hijo (Layout con Dashboard, etc.)
  return <Outlet />;
};

export default ProtectedRoute;