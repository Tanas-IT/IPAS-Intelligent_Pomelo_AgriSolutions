import { STORAGE_KEYS } from "@/constants";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleApiError } from "@/utils";

const API_HOST = process.env.EXPO_PUBLIC_API_HOST;
const API_PORT = process.env.EXPO_PUBLIC_API_PORT;
const API_DEPLOY = process.env.EXPO_PUBLIC_API_DEPLOY;
const isDevelopment = process.env.EXPO_PUBLIC_API_DEVELOPMENT;

const BASE_URL =
  isDevelopment == "true" ? `${API_HOST}:${API_PORT}/ipas` : `${API_DEPLOY}`;

const createAxiosInstance = (contentType: string): AxiosInstance => {
  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": contentType,
    },
  });

  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => handleApiError(error)
  );

  return instance;
};

const axiosJsonRequest = createAxiosInstance("application/json");
const axiosMultipartForm = createAxiosInstance("multipart/form-data");

export default {
  axiosJsonRequest,
  axiosMultipartForm,
};
