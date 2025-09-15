import apiClient from './api';

// 👈 1. Añade esta función para obtener las cabeceras de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Obtener el inventario activo
export const getActiveInventory = async () => {
  // 👈 2. Añade las cabeceras a la petición
  const response = await apiClient.get('/inventory/active', { headers: getAuthHeaders() });
  return response.data;
};

// Obtener la plantilla para un nuevo inventario
export const getInventoryTemplate = async () => {
  const response = await apiClient.get('/inventory/template', { headers: getAuthHeaders() });
  return response.data;
};

// Crear un nuevo registro de inventario
export const createInventory = async (inventoryData) => {
  const response = await apiClient.post('/inventory', inventoryData, { headers: getAuthHeaders() });
  return response.data;
};

// Actualizar un inventario existente
export const updateInventory = async (id, inventoryData) => {
  const response = await apiClient.put(`/inventory/${id}`, inventoryData, { headers: getAuthHeaders() });
  return response.data;
};