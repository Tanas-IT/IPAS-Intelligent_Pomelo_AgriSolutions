import { ApiResponse } from "./apiBase/responses/ApiResponse";

  export interface LoginPayload {
    email: string;
    password: string;
  }
  
  interface Auth {
    accessToken: string;
    refreshToken: string;
  }

  export interface OtpResponse {
    otpHash: string;
  }

  export interface RegisterRequest {
    email: string;
    password: string;
    fullName: string;
    gender: "Male" | "Female";
    phone: string;
    dob: string;
  }
  
  interface UserAuthResponse {
    authenModel: Auth;
    avatar: string;
    fullname: string;
  }

  export interface RegisterResponse extends UserAuthResponse {}
  
  export interface LoginResponse extends UserAuthResponse {}
  
  export interface TokenInFarm {
    accessToken: string;
    refreshToken: string;
    farmLogo: string;
    farmName: string;
    role: 'User' | 'Admin';
  }

  export type LoginApiResponse = ApiResponse<LoginResponse>;
export type TokenInFarmApiResponse = ApiResponse<TokenInFarm>;