import apiClient from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getPurchases = async () => {
  const response = await apiClient.get('/purchases', { headers: getAuthHeaders() });
  return response.data;
};

export const getPurchasesByInventory = async (inventoryId) => {
  const response = await apiClient.get(`/purchases/by-inventory/${inventoryId}`, { headers: getAuthHeaders() });
  return response.data;
};

export const createPurchase = async (purchaseData) => {
  const response = await apiClient.post('/purchases', purchaseData, { headers: getAuthHeaders() });
  return response.data;
};

export const updatePurchase = async (id, purchaseData) => {
    const response = await apiClient.put(`/purchases/${id}`, purchaseData, { headers: getAuthHeaders() });
    return response.data;
};

export const deletePurchase = async (id) => {
    const response = await apiClient.delete(`/purchases/${id}`, { headers: getAuthHeaders() });
    return response.data;
};