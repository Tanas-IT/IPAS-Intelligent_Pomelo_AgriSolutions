import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const API_HOST = Config.API_HOST;
const API_PORT = Config.API_PORT;
const API_DEVELOPMENT = Config.API_DEVELOPMENT;
const API_DEPLOY = Config.API_DEPLOY;

const BASE_URL = API_DEVELOPMENT === "true" ? `${API_HOST}:${API_PORT}/ipas` : `${API_DEPLOY}`;

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