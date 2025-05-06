import { LOCAL_STORAGE_KEYS, MESSAGES } from "@/constants";
import { PATHS } from "@/routes";
import { authService } from "@/services";
import axios from "axios";
import { toast } from "react-toastify";

let isHandlingApiError = false;

export const handleApiError = async (error: any) => {
  if (isHandlingApiError) return Promise.reject(error);
  isHandlingApiError = true;

  const redirectToHomeWithMessage = async (message: string, hasMessage: boolean = true) => {
    const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    localStorage.clear();
    if (hasMessage) localStorage.setItem(LOCAL_STORAGE_KEYS.ERROR_MESSAGE, message);
    window.location.href = PATHS.AUTH.LOGIN;
  };

  const redirectToFarmPickerWithMessage = async (message: string) => {
    const result = await authService.refreshTokenOutFarm();
    if (result.statusCode === 200) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, result.data.authenModel.accessToken);
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, result.data.authenModel.refreshToken);
      localStorage.setItem(LOCAL_STORAGE_KEYS.ERROR_MESSAGE, message);
      window.location.href = PATHS.FARM_PICKER;
    } else {
      redirectToHomeWithMessage(message);
    }
  };

  const redirectToRenewalPageWithMessage = async (message: string) => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.ERROR_MESSAGE, message);
    window.location.href = PATHS.PACKAGE.PACKAGE_PURCHASE;
  };

  try {
    if (error.message === "Network Error" && !error.response) {
      toast.error(MESSAGES.NETWORK_ERROR);
    } else if (error.response) {
      switch (error.response.status) {
        case 401:
          const message = error.response.data.message;
          if (message.includes("Token is expired!")) {
            const originalRequest = error.config;
            const result = await authService.refreshToken();
            if (result.statusCode === 200) {
              const newAccessToken = result.data.authenModel.accessToken;
              const newRefreshToken = result.data.authenModel.refreshToken;

              localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, newAccessToken);
              localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);

              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return axios(originalRequest);
            } else if (result.statusCode === 500 || result.statusCode === 400) {
              redirectToHomeWithMessage(MESSAGES.SESSION_EXPIRED);
            }
          } else {
            redirectToHomeWithMessage("", false);
          }
          break;
        case 402:
          redirectToRenewalPageWithMessage(error.response.data.message);
          break;
        case 403:
          const errorStatusCode = error.response.data.statusCode;
          if (errorStatusCode === 401) {
            redirectToHomeWithMessage(error.response.data.message);
          } else if (errorStatusCode === 403) {
            redirectToFarmPickerWithMessage(error.response.data.message);
          } else {
            redirectToHomeWithMessage(MESSAGES.NO_PERMISSION);
          }
          break;
        case 400:
          toast.error(MESSAGES.BAD_REQUEST);
          break;
        case 500:
          toast.error(MESSAGES.ERROR_OCCURRED);
          break;
        default:
          toast.error(MESSAGES.ERROR_OCCURRED);
      }
    } else {
      toast.error(MESSAGES.UNEXPECTED_ERROR);
    }
  } finally {
    setTimeout(() => {
      isHandlingApiError = false; // Reset sau một khoảng thời gian
    }, 1000);
  }

  return Promise.reject(error);
};
