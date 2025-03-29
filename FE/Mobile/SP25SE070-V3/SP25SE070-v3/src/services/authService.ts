import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosAuth from '../api/axiosAuth';
import { useAuthStore } from '@/store/authStore';
import { useFarmStore } from '@/store/farmStore';
import {
  LoginResponse,
  OtpResponse,
  RegisterRequest,
  RegisterResponse,
  TokenInFarm,
} from '@/types/auth';
import { axiosNoAuth } from '@/api/apiNoAuth';
import { ApiResponse } from '@/types/apiBase/responses/ApiResponse';

export const loginGoogle = async (googleToken: string): Promise<ApiResponse<LoginResponse>> => {
  const res = await axiosNoAuth.post('login-with-google', {
    googleToken: googleToken,
  });
  const apiResponse = res.data as ApiResponse<LoginResponse>;
  if (apiResponse.statusCode === 200) {
    useAuthStore.getState().setAuth(apiResponse.data);
    await AsyncStorage.setItem('fullName', apiResponse.data.fullname);
    await AsyncStorage.setItem('avatar', apiResponse.data.avatar || '');
  }
  return apiResponse;
};

export const login = async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
  const res = await axiosNoAuth.post('login', { email, password });
  const apiResponse = res.data as ApiResponse<LoginResponse>;
  if (apiResponse.statusCode === 200) {
    useAuthStore.getState().setAuth(apiResponse.data);
    await AsyncStorage.setItem('fullName', apiResponse.data.fullname);
    await AsyncStorage.setItem('avatar', apiResponse.data.avatar || '');
  }
  return apiResponse;
};

export const sendOTP = async (email: string): Promise<ApiResponse<OtpResponse>> => {
  const res = await axiosNoAuth.post('register/send-otp', { email });
  return res.data as ApiResponse<OtpResponse>;
};

export const register = async (registerRequest: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
  const { email, password, fullName, phone, gender, dob } = registerRequest;
  const res = await axiosNoAuth.post('register', {
    email,
    password,
    fullName,
    gender,
    phone,
    dob,
  });
  return res.data as ApiResponse<RegisterResponse>;
};

export const sendForgetPassOTP = async (email: string): Promise<ApiResponse<object>> => {
  const res = await axiosNoAuth.post('forget-password', { email });
  return res.data as ApiResponse<object>;
};

export const forgetPassOTPConfirm = async (email: string, otp: string): Promise<ApiResponse<object>> => {
  const res = await axiosNoAuth.post('forget-password/confirm', {
    email,
    otpCode: otp,
  });
  return res.data as ApiResponse<object>;
};

export const forgetPassNewPass = async (
  email: string,
  newPassword: string,
  otp: string,
): Promise<ApiResponse<object>> => {
  const res = await axiosNoAuth.post('forget-password/new-password', {
    email,
    newPassword,
    otpCode: otp,
  });
  return res.data as ApiResponse<object>;
};

export const refreshToken = async (): Promise<ApiResponse<LoginResponse>> => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  const res = await axiosNoAuth.post('refresh-token', { refreshToken });
  const apiResponse = res.data as ApiResponse<LoginResponse>;
  if (apiResponse.statusCode === 200) {
    useAuthStore.getState().setAuth(apiResponse.data);
  }
  return apiResponse;
};

export const refreshTokenInFarm = async (farmId: string | number): Promise<ApiResponse<TokenInFarm>> => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  const res = await axiosAuth.axiosJsonRequest.post('validate-role-in-farm', {
    refreshToken,
    farmId,
  });
  const apiResponse = res.data as ApiResponse<TokenInFarm>;
  if (apiResponse.statusCode === 200) {
    useAuthStore.getState().updateRoleInFarm(apiResponse.data);
    useFarmStore.getState().setFarmInfo(apiResponse.data.farmName, apiResponse.data.farmLogo);
  }
  return apiResponse;
};

export const refreshTokenOutFarm = async (): Promise<ApiResponse<LoginResponse>> => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  const res = await axiosAuth.axiosJsonRequest.put('update-role-out-farm', { refreshToken });
  const apiResponse = res.data as ApiResponse<LoginResponse>;
  if (apiResponse.statusCode === 200) {
    useAuthStore.getState().setAuth(apiResponse.data);
    useFarmStore.getState().setFarmInfo('', '');
  }
  return apiResponse;
};

export const logout = async (): Promise<ApiResponse<object>> => {
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  const res = await axiosNoAuth.post('logout', { refreshToken });
  const apiResponse = res.data as ApiResponse<object>;
  if (apiResponse.statusCode === 200) {
    useAuthStore.getState().logout();
    useFarmStore.getState().setFarmInfo('', '');
    await AsyncStorage.clear();
  }
  return apiResponse;
};