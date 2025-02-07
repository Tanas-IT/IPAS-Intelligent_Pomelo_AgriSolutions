import {
  ApiResponse,
  LoginResponse,
  OtpResponse,
  RegisterRequest,
  RegisterResponse,
  TokenInFarm,
} from "@/payloads";
import { axiosAuth, axiosNoAuth } from "@/api";
import { LOCAL_STORAGE_KEYS } from "@/constants";

export const loginGoogle = async (googleToken: string): Promise<ApiResponse<LoginResponse>> => {
  const res = await axiosNoAuth.post("login-with-google", {
    googleToken: googleToken,
  });
  const apiResponse = res.data as ApiResponse<LoginResponse>;
  return apiResponse;
};

export const login = async (
  email: string,
  password: string,
): Promise<ApiResponse<LoginResponse>> => {
  const res = await axiosNoAuth.post("login", {
    email: email,
    password: password,
  });
  const apiResponse = res.data as ApiResponse<LoginResponse>;
  return apiResponse;
};

export const sendOTP = async (email: string): Promise<ApiResponse<OtpResponse>> => {
  const res = await axiosNoAuth.post("register/send-otp", {
    email: email,
  });
  const apiResponse = res.data as ApiResponse<OtpResponse>;
  return apiResponse;
};

export const register = async (
  registerRequest: RegisterRequest,
): Promise<ApiResponse<RegisterResponse>> => {
  const { email, password, fullName, phone, gender, dob } = registerRequest;
  const res = await axiosNoAuth.post("register", {
    email,
    password,
    fullName,
    gender,
    phone,
    dob,
  });
  const apiResponse = res.data as ApiResponse<RegisterResponse>;
  return apiResponse;
};

export const sendForgetPassOTP = async (email: string): Promise<ApiResponse<Object>> => {
  const res = await axiosNoAuth.post("forget-password", {
    email: email,
  });
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const forgetPassOTPConfirm = async (
  email: string,
  otp: string,
): Promise<ApiResponse<Object>> => {
  const res = await axiosNoAuth.post("forget-password/confirm", {
    email: email,
    otpCode: otp,
  });
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const forgetPassNewPass = async (
  email: string,
  newPassword: string,
  otp: string,
): Promise<ApiResponse<Object>> => {
  const res = await axiosNoAuth.post("forget-password/new-password", {
    email: email,
    newPassword: newPassword,
    otpCode: otp,
  });
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const refreshToken = async (): Promise<ApiResponse<LoginResponse>> => {
  const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  const res = await axiosNoAuth.post("refresh-token", {
    refreshToken: refreshToken,
  });
  const apiResponse = res.data as ApiResponse<LoginResponse>;
  return apiResponse;
};

export const refreshTokenInFarm = async (
  farmId: string | number,
): Promise<ApiResponse<TokenInFarm>> => {
  const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  const res = await axiosAuth.axiosJsonRequest.post("validate-role-in-farm", {
    refreshToken: refreshToken,
    farmId: farmId,
  });
  const apiResponse = res.data as ApiResponse<TokenInFarm>;
  return apiResponse;
};

export const refreshTokenOutFarm = async (): Promise<ApiResponse<LoginResponse>> => {
  const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  const res = await axiosAuth.axiosJsonRequest.put("update-role-out-farm", {
    refreshToken: refreshToken,
  });
  const apiResponse = res.data as ApiResponse<LoginResponse>;
  return apiResponse;
};

export const logout = async (refreshToken: string): Promise<ApiResponse<Object>> => {
  const res = await axiosNoAuth.post("logout", {
    refreshToken,
  });
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};
