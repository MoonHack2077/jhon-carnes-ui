import apiClient from './api';

// Obtener el token de localStorage para enviarlo en las cabeceras
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getProducts = async () => {
  const response = await apiClient.get('/products', { headers: getAuthHeaders() });
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await apiClient.post('/products', productData, { headers: getAuthHeaders() });
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await apiClient.put(`/products/${id}`, productData, { headers: getAuthHeaders() });
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await apiClient.delete(`/products/${id}`, { headers: getAuthHeaders() });
  return response.data;
};