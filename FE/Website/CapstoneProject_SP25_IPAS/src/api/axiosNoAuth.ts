import { handleApiError } from "@/utils";
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { toast } from "react-toastify";

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PORT = import.meta.env.VITE_API_PORT;
const API_DEVELOPMENT = import.meta.env.VITE_API_DEVELOPMENT;
const API_DEPLOY = import.meta.env.VITE_API_DEPLOY;

const BASE_URL = API_DEVELOPMENT == "true" ? `${API_HOST}:${API_PORT}/ipas` : `${API_DEPLOY}`;

const axiosLogin: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosLogin.interceptors.request.use(
  function (config: InternalAxiosRequestConfig) {
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// Add Response interceptor
axiosLogin.interceptors.response.use(
  (response) => response,
  (error) => handleApiError(error),
);

export default axiosLogin;
