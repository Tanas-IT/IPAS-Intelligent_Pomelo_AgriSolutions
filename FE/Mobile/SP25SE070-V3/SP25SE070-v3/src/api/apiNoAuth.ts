import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.100.78:5242/ipas';

export const axiosNoAuth: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const axiosAuth: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosAuth.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('No token found');
    }
    return config;
  },
  (error) => Promise.reject(error),
);

const handleApiError = (error: any) => {
  console.error('API Error:', error);
  return Promise.reject(error);
};

axiosNoAuth.interceptors.response.use((response) => response, handleApiError);
axiosAuth.interceptors.response.use((response) => response, handleApiError);