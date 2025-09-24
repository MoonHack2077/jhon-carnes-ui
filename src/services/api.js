import axios from 'axios';

const NODE_ENV = import.meta.env.VITE_NODE_ENV;
const BACK_URL = NODE_ENV === 'dev' ? import.meta.env.VITE_DEV_BACKEND_URL : import.meta.env.VITE_PROD_BACKEND_URL;

const apiClient = axios.create({
  baseURL: BACK_URL
});

export default apiClient;