import { LOCAL_STORAGE_KEYS } from "@/constants";
import { PATHS } from "@/routes";
import { authService } from "@/services";
import axios from "axios";
import { toast } from "react-toastify";

export const handleApiError = async (error: any) => {
  const redirectToHomeWithMessage = (message: string, hasMessage: boolean = true) => {
    localStorage.clear();
    if (hasMessage) localStorage.setItem(LOCAL_STORAGE_KEYS.ERROR_MESSAGE, message);
    window.location.href = PATHS.AUTH.LANDING;
  };

  if (error.message === "Network Error" && !error.response) {
    toast.error("Network error, please check your connection!");
  } else if (error.response) {
    switch (error.response.status) {
      case 401:
        const message = error.response.data.Message;
        if (message.includes("Token is expired!")) {
          console.log("Token is expired");
          // const originalRequest = error.config;
          // try {
          //   const newAccessToken = await authService.refreshToken();
          //   console.log(newAccessToken);
          //   originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          //   return axios(originalRequest);
          // } catch (error) {
          //   redirectToHomeWithMessage("Your session has expired, please log in again");
          // }
        } else {
          redirectToHomeWithMessage("", false);
        }
        break;
      case 403:
        const errorStatusCode = error.response.data.StatusCode;
        if (errorStatusCode === 401) {
          redirectToHomeWithMessage(error.response.data.Message);
        } else {
          redirectToHomeWithMessage("You do not have permission to access this resource");
        }
        break;
      default:
        toast.error("An error occurred");
    }
  } else {
    toast.error("An unexpected error occurred. Please try again later.");
  }
  return Promise.reject(error);
};
