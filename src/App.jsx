import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './pages/Layout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Ruta Pública */}
      <Route path="/login" element={<Login />} />

      {/* Rutas Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          {/* La ruta raíz anidada dentro del layout */}
          <Route index element={<Dashboard />} /> 
          {/* Aquí añadirás más rutas protegidas en el futuro */}
          {/* <Route path="/inventory" element={<InventoryPage />} /> */}
          {/* <Route path="/users" element={<UsersPage />} /> */}
        </Route>
      </Route>
    </Routes>
  );
}

export default App;