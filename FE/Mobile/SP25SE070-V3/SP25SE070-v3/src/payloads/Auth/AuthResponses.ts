interface Auth {
  accessToken: string;
  refreshToken: string;
}
interface UserAuthResponse {
  authenModel: Auth;
  avatar: string;
  fullname: string;
}

export interface LoginResponse extends UserAuthResponse {}

export interface RegisterResponse extends UserAuthResponse {}

export interface OtpResponse {
  otpHash: string;
}

export interface TokenInFarm {
  accessToken: string;
  refreshToken: string;
  farmLogo: string;
  farmName: string;
}

// export type LoginApiResponse = ApiResponse<LoginResponse>;
// export type TokenInFarmApiResponse = ApiResponse<TokenInFarm>;
