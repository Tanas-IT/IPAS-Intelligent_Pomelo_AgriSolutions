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

  CROP: {
    PLANT_YIELD: "/crop/plant-yield",
  },

  CLASSIFICATION: {
    MASTER_TYPE: "/classification/master-types",
    GROWTH_STAGE: "/classification/growth-stages",
  },

  // Farm Management
  FARM: {
    CREATE_FARM: "/farm/create",
    FARM_LIST: "/farms",
    FARM_DETAIL: "/farms/:id",
    FARM_INFO: "/farm/farm-info",
    FARM_PLANT_LIST: "/farm/plants",
    FARM_PLANT_DETAIL: "/farm/plants/:id/details",
    FARM_PLOT_LIST: "/farm/land-plots",
    FARM_PLOT_CREATE: "/farm/land-plots/create",
    FARM_ROW_LIST: "/farm/land-rows",
    FARM_PLANT_DETAIL_FROM_ROW: "/farm/land-rows/:plotId/plants/:plantId/details",
    FARM_PLANT_LOT_LIST: "/farm/plant-lots",
    FARM_PLANT_LOT_DETAIL: "/farm/plant-lots/:id/details",
    FARM_PLANT_LOT_ADDITIONAL: "/farm/plant-lots/:parentId/additional/:id/details",
    CRITERIA_LIST: "/farm/criteria",
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

  // Plan Management
  PLAN: {
    PLAN_LIST: "/plans",
    PLAN_DETAIL: "/plans/:id",
    ADD_PLAN: "/plans/add",
    UPDATE_PLAN: "/plans/update/:id",
  },

  //Worklog Management
  HR: {
    WORKLOG_CALENDAR: "/hr-management/worklogs",
    WORKLOG_DETAIL: "/hr-management/worklogs/:id",
    EMPLOYEES: "/hr-management/employees",
  },

  // Partner Management
  PARTNERS: {
    PARTNER_LIST: "/partners",
  },

  //Package Management
  PACKAGE: {
    PACKAGE_LIST: "/packages",
    PACKAGE_PURCHASE: "/package-purchase",
    PAYMENT: "/package/payment",
    SUCCESS: "/payment/payment-success",
    CANCEL: "/payment/payment-cancle",
  },

  EMPLOYEE: {
    DASHBOARD: "/employee/dashboard",
    WORK_SCHEDULE: "/employee/work-schedule",
    WORKLOG: "/employee/worklog",
    WORKLOG_DETAIL: "/employee/worklog/:id",
    PLANTS: "/employee/plants",
    AI_CONSULTING: "/employee/ai-consulting",
  },
};
