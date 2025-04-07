import { handleApiError } from "@/utils";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PORT = import.meta.env.VITE_API_PORT;
const API_DEVELOPMENT = import.meta.env.VITE_API_DEVELOPMENT;
const API_DEPLOY = import.meta.env.VITE_API_DEPLOY;

const BASE_URL = API_DEVELOPMENT == "true" ? `${API_HOST}:${API_PORT}/ipas` : `${API_DEPLOY}`;

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
  },
);

// Add Response interceptor
axiosNoAuth.interceptors.response.use(
  (response) => response,
  (error) => handleApiError(error),
);

export default axiosNoAuth;
