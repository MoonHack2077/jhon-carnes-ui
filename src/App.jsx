import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './pages/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import InventoryForm from './components/InventoryForm';
import InventoryPage from './pages/InventoryPage';
import ProductsPage from './pages/ProductsPage';
import UsersPage from './pages/UsersPage';
import PurchasesPage from './pages/PurchasesPage';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // '#root' es el ID del div principal en tu index.html

function App() {
  return (
    <Routes>
      {/* Rutas Públicas (Solo para no autenticados) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Rutas Protegidas (Solo para autenticados) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/inventory" element={<InventoryPage />} /> {/* Calendario */}
          <Route path="/inventory/form/:id" element={<InventoryForm />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/purchases" element={<PurchasesPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;