import { MESSAGES, STORAGE_KEYS } from "@/constants";
import { AuthService } from "@/services";
import { resetToFarmPicker, resetToLogin } from "@/services/NavigationService";
import { useAuthStore } from "@/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Toast from "react-native-toast-message";
import { getRoleId, getUserId } from "./UtilFunction";

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

  const redirectToFarmPickerWithMessage = async (message: string) => {
    const res = await AuthService.refreshTokenOutFarm();
    if (res.statusCode === 200) {
      const roleId = getRoleId(res.data.authenModel.accessToken);
      const userId = getUserId(res.data.authenModel.accessToken);
      Toast.show({
        type: "error",
        text1: message,
      });
      useAuthStore.getState().updateRoleOutFarm(res.data, userId, roleId);
      resetToFarmPicker();
    } else {
      redirectToHomeWithMessage(message);
    }
  };

  if (error.message === "Network Error" && !error.response) {
    Toast.show({
      type: "error",
      text1: MESSAGES.NETWORK_ERROR,
    });
  } else if (error.response) {
    switch (error.response.status) {
      case 401:
        const message = error.response.data.message;
        if (message.includes("Token is expired!")) {
          const originalRequest = error.config;
          const result = await AuthService.refreshToken();
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
      case 402:
        redirectToFarmPickerWithMessage(error.response.data.message);
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
        Toast.show({
          type: "error",
          text1: MESSAGES.BAD_REQUEST,
        });
        break;
      case 500:
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
