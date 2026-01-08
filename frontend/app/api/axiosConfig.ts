import axios from 'axios';

// Your backend base URL - no /api at the end since your endpoint is /splitra/users
const API_BASE_URL = 'http://10.5.4.129:8080';

const AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
AxiosInstance.interceptors.request.use(
  (config) => {
    console.log('Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
AxiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('Response error:', error.response.data);
    } else if (error.request) {
      console.error('Network error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default AxiosInstance;