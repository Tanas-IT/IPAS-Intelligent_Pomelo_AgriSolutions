import { MESSAGES, STORAGE_KEYS } from "@/constants";
import { AuthService } from "@/services";
import { resetToLogin } from "@/services/NavigationService";
import { useAuthStore } from "@/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Toast from "react-native-toast-message";

export const handleApiError = async (error: any) => {
  const redirectToHomeWithMessage = async (
    message: string,
    hasMessage: boolean = true
  ) => {
    await AuthService.logout();
    await useAuthStore.getState().logout();
    await AsyncStorage.clear();

    if (hasMessage && message) {
      Toast.show({
        type: "error",
        text1: message,
      });
    }
    resetToLogin();
  };

  if (error.message === "Network Error" && !error.response) {
    Toast.show({
      type: "error",
      text1: MESSAGES.NETWORK_ERROR,
    });
  } else if (error.response) {
    console.log(error);

    switch (error.response.status) {
      case 401:
        const message = error.response.data.Message;
        if (message.includes("Token is expired!")) {
          const originalRequest = error.config;
          const result = await AuthService.refreshToken();
          console.log(result);
          if (result.statusCode === 200) {
            const newAccessToken = result.data.authenModel.accessToken;
            const newRefreshToken = result.data.authenModel.refreshToken;

            await AsyncStorage.setItem(
              STORAGE_KEYS.ACCESS_TOKEN,
              newAccessToken
            );
            await AsyncStorage.setItem(
              STORAGE_KEYS.REFRESH_TOKEN,
              newRefreshToken
            );

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
        Toast.show({
          type: "error",
          text1: MESSAGES.BAD_REQUEST,
        });
        break;
      default:
        Toast.show({
          type: "error",
          text1: MESSAGES.ERROR_OCCURRED,
        });
    }
  } else {
    Toast.show({
      type: "error",
      text1: MESSAGES.UNEXPECTED_ERROR,
    });
  }
  return Promise.reject(error);
};
