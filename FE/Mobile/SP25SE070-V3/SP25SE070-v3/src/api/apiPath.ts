export const API_PATHS = {
    AUTH: {
      LOGIN: "/login",
      LOGIN_WITH_GOOGLE: "/login-with-google",
      REGISTER: "/register",
      SEND_OTP: "/register/send-otp",
      REFRESH_TOKEN: "/refresh-token",
      LOGOUT: "/logout",
      FORGOT_PASSWORD: {
        SEND_OTP: "/forget-password",
        CONFIRM_OTP: "/forget-password/confirm",
        NEW_PASSWORD: "/forget-password/new-password",
      },
      FARM_ROLE: {
        VALIDATE_IN_FARM: "/validate-role-in-farm",
        UPDATE_OUT_FARM: "/update-role-out-farm",
      },
    },
  };
  