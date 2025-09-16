import apiClient from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getDashboardSummary = async (startDate, endDate) => {
  // Formateamos las fechas para enviarlas como query params
  const params = new URLSearchParams({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });
  const response = await apiClient.get(`/dashboard/summary?${params.toString()}`, { headers: getAuthHeaders() });
  return response.data;
};