import { LOCAL_STORAGE_KEYS, MESSAGES } from "@/constants";
import { PATHS } from "@/routes";
import { authService } from "@/services";
import axios from "axios";
import { toast } from "react-toastify";

export const handleApiError = async (error: any) => {
  const redirectToHomeWithMessage = async (message: string, hasMessage: boolean = true) => {
    const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    localStorage.clear();
    if (hasMessage) localStorage.setItem(LOCAL_STORAGE_KEYS.ERROR_MESSAGE, message);
    window.location.href = PATHS.AUTH.LOGIN;
  };

  if (error.message === "Network Error" && !error.response) {
    toast.error(MESSAGES.NETWORK_ERROR);
  } else if (error.response) {
    // console.log(error);

    switch (error.response.status) {
      case 401:
        const message = error.response.data.Message;
        if (message.includes("Token is expired!")) {
          const originalRequest = error.config;
          const result = await authService.refreshToken();
          // console.log(result);
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
      case 403:
        const errorStatusCode = error.response.data.StatusCode;
        if (errorStatusCode === 401) {
          redirectToHomeWithMessage(error.response.data.Message);
        } else {
          redirectToHomeWithMessage(MESSAGES.NO_PERMISSION);
        }
        break;
      case 400:
        toast.error(MESSAGES.BAD_REQUEST);
        break;
      default:
        toast.error(MESSAGES.ERROR_OCCURRED);
    }
  } else {
    toast.error(MESSAGES.UNEXPECTED_ERROR);
  }
  return Promise.reject(error);
};
