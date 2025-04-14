import { STORAGE_KEYS } from "@/constants";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleApiError } from "@/utils";

const API_HOST = process.env.EXPO_PUBLIC_API_HOST;
const API_PORT = process.env.EXPO_PUBLIC_API_PORT;

const BASE_URL = `${API_HOST}:${API_PORT}/ipas`;

// const createAxiosInstance = (contentType: string): AxiosInstance => {
//   const instance = axios.create({
//     baseURL: BASE_URL,
//     headers: {
//       "Content-Type": contentType,
//     },
//   });

//   instance.interceptors.request.use(
//     async (config: InternalAxiosRequestConfig) => {
//       const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
//       if (accessToken) {
//         config.headers.Authorization = `Bearer ${accessToken}`;
//       }
//       return config;
//     },
//     (error) => {
//       console.error("Request error:", error);
//       return Promise.reject(error);
//     }
//   );

//   instance.interceptors.response.use(
//     (response) => response,
//     (error) => handleApiError(error)
//   );

//   return instance;
// };
const createAxiosInstance = (contentType: string, skipResponseInterceptor: boolean = false): AxiosInstance => {
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
      console.error("Request error:", error);
      return Promise.reject(error);
    }
  );

  if (!skipResponseInterceptor) {
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("Response error:", error);
        return handleApiError(error);
      }
    );
  }

  return instance;
};
const axiosJsonRequest = createAxiosInstance("application/json");
const axiosMultipartForm = createAxiosInstance("multipart/form-data");
const axiosJsonNoErrorHandler = createAxiosInstance("application/json", true);
const axiosMultipartNoErrorHandler = createAxiosInstance("multipart/form-data", true);

export default { axiosJsonRequest, axiosMultipartForm, axiosJsonNoErrorHandler, axiosMultipartNoErrorHandler };
