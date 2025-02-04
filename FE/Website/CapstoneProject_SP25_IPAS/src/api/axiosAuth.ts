import { LOCAL_STORAGE_KEYS } from "@/constants";
import { PATHS } from "@/routes";
import { handleApiError } from "@/utils";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PORT = import.meta.env.VITE_API_PORT;
const API_DEVELOPMENT = import.meta.env.VITE_API_DEVELOPMENT;
const API_DEPLOY = import.meta.env.VITE_API_DEPLOY;

const BASE_URL = API_DEVELOPMENT === "true" ? `${API_HOST}:${API_PORT}/ipas` : `${API_DEPLOY}`;

const createAxiosInstance = (contentType: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": contentType,
    },
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      config.headers = config.headers || {};

      const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
      if (!accessToken?.trim()) {
        localStorage.clear();
        window.location.href = PATHS.AUTH.LANDING;
      } else {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => handleApiError(error),
  );

  return instance;
};

const axiosMultipartForm = createAxiosInstance("multipart/form-data");
const axiosJsonRequest = createAxiosInstance("application/json");

export default { axiosMultipartForm, axiosJsonRequest };
