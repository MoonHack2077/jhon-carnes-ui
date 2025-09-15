import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // Asegúrate que coincida con tu backend
});

export default apiClient;