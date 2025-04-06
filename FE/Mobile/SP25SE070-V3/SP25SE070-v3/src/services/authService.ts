import AsyncStorage from "@react-native-async-storage/async-storage";

import { axiosAuth, axiosNoAuth } from "@/api";
import { STORAGE_KEYS } from "@/constants";
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  TokenInFarm,
} from "@/payloads";

export const login = async (
  payload: LoginRequest
): Promise<ApiResponse<LoginResponse>> => {
  const res = await axiosNoAuth.post("login", payload);
  const apiResponse = res.data as ApiResponse<LoginResponse>;
  return apiResponse;
};

export const refreshToken = async (): Promise<ApiResponse<LoginResponse>> => {
  const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  const res = await axiosNoAuth.post("refresh-token", { refreshToken });
  const apiResponse = res.data as ApiResponse<LoginResponse>;
  return apiResponse;
};

export const refreshTokenInFarm = async (
  farmId: string | number
): Promise<ApiResponse<TokenInFarm>> => {
  const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  const res = await axiosAuth.axiosJsonRequest.post("validate-role-in-farm", {
    refreshToken,
    farmId,
  });
  const apiResponse = res.data as ApiResponse<TokenInFarm>;
  return apiResponse;
};

export const refreshTokenOutFarm = async (): Promise<
  ApiResponse<LoginResponse>
> => {
  const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  const res = await axiosAuth.axiosJsonRequest.put("update-role-out-farm", {
    refreshToken,
  });
  const apiResponse = res.data as ApiResponse<LoginResponse>;
  return apiResponse;
};

export const logout = async (
  refreshToken: string
): Promise<ApiResponse<object>> => {
  const res = await axiosNoAuth.post("logout", { refreshToken });
  const apiResponse = res.data as ApiResponse<object>;
  return apiResponse;
};
