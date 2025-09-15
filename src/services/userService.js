import apiClient from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Esta función ya la teníamos
export const getUsers = async () => {
  const response = await apiClient.get('/users', { headers: getAuthHeaders() });
  return response.data;
};

// --- NUEVAS FUNCIONES ---

// La creación de usuarios se hace desde el endpoint de registro
export const createUser = async (userData) => {
  const response = await apiClient.post('/auth/register', userData, { headers: getAuthHeaders() });
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await apiClient.put(`/users/${id}`, userData, { headers: getAuthHeaders() });
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/users/${id}`, { headers: getAuthHeaders() });
  return response.data;
};