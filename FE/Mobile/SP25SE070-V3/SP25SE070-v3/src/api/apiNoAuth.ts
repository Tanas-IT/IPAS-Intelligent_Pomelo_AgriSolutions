import { handleApiError } from "@/utils";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import Toast from "react-native-toast-message";

const API_HOST = process.env.EXPO_PUBLIC_API_HOST;
const API_PORT = process.env.EXPO_PUBLIC_API_PORT;
const API_DEPLOY = process.env.EXPO_PUBLIC_API_DEPLOY;
const isDevelopment = process.env.EXPO_PUBLIC_API_DEVELOPMENT;

// const BASE_URL = `${API_HOST}:${API_PORT}/ipas`;
const BASE_URL =
  isDevelopment === "true" ? `${API_HOST}:${API_PORT}/ipas` : `${API_DEPLOY}`;

const axiosNoAuth: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosNoAuth.interceptors.request.use(
  function (config: InternalAxiosRequestConfig) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Add Response interceptor
axiosNoAuth.interceptors.response.use(
  (response) => response,
  (error) => handleApiError(error)
);

export default axiosNoAuth;
