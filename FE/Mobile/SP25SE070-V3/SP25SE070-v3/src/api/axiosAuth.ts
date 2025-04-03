import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_HOST = process.env.EXPO_PUBLIC_API_HOST;
const API_PORT = process.env.EXPO_PUBLIC_API_PORT;


const BASE_URL = `${API_HOST}:${API_PORT}/ipas`;

const createAxiosInstance = (contentType: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': contentType,
    },
  });

  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      console.error('Request error:', error);
      return Promise.reject(error);
    },
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error('API Error:', error.response?.data || error.message);
      return Promise.reject(error);
    },
  );

  return instance;
};

const axiosJsonRequest = createAxiosInstance('application/json');
const axiosMultipartForm = createAxiosInstance('multipart/form-data');

export default { axiosJsonRequest, axiosMultipartForm };