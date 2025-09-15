import apiClient from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getPurchases = async () => {
  const response = await apiClient.get('/purchases', { headers: getAuthHeaders() });
  return response.data;
};

// Nota: La creación y actualización se manejarán desde un futuro modal o formulario.
// Por ahora, nos enfocamos en visualizar los datos.