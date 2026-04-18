import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const API_BASE_URL = 'http://192.168.1.118:8080';//home
const API_BASE_URL = 'http://192.168.0.187:8080';//college

const AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type':  'application/json',
  },
});

// Request interceptor 
AxiosInstance.interceptors. request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');  
    console.log('Token:', token); 
    if (token) {
      config. headers.Authorization = `Bearer ${token}`; 
    }
    console.log('Request:', config.method?. toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
AxiosInstance. interceptors.response. use(
  (response) => {
    console.log('Response:', response.status, response.config. url);
    return response;
  },
  (error) => {
    if (error.response) {
      console. error('Response error:', error.response.data);
    } else if (error.request) {
      console.error('Network error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default AxiosInstance;