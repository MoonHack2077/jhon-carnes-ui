import apiClient from './api';

export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    // Lanza el error para que el componente lo pueda manejar
    throw error.response.data || error.message;
  }
};