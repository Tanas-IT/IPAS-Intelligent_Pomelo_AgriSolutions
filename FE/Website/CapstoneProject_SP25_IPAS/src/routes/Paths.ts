export const PATHS = {
  // Authentication
  AUTH: {
    LANDING: "/",
    LOGIN: "/auth",
    LOGIN2: "/auth?mode=sign-in",
    Register: "/auth?mode=sign-up",
    FORGOT_PASSWORD: "/forgot-password",
    FORGOT_PASSWORD_OTP: "/forgot-password/otp",
    FORGOT_PASSWORD_RESET: "/forgot-password/new-password",
    SIGN_UP_OTP: "/sign-up/otp",
  },

  // Dashboard
  DASHBOARD: "/dashboard",

  FARM_PICKER: "/farm-picker",

  // User Management
  USER: {
    USER_LIST: "/users",
    USER_DETAIL: "/users/:id",
  },

  // Farm Management
  FARM: {
    FARM_LIST: "/farms",
    FARM_DETAIL: "/farms/:id",
    FARM_INFO: "/farm/farm-info",
    FARM_PLANT_LIST: "/farm/plants",
    FARM_PLANT_DETAIL: "/farm/plants/:id/details",
    FARM_PLOT_LIST: "/farm/land-plots",
    FARM_PLOT_CREATE: "/farm/land-plot/create",
  },

  // Process Management
  PROCESS: {
    PROCESS_LIST: "/processes",
    PROCESS_DETAIL: "/processes/:id",
  },

  //Weather
  WEATHER: {
    WEATHER: "/dashboard-weather",
  },
};
