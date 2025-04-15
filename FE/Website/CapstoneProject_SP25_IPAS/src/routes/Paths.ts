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

  // Admin Management Only
  ADMIN: {
    USER_LIST: "/admin/users",
    FARM_LIST: "/admin/farms",
    SYSTEM_CONFIG: "/admin/system-configuration",
  },

  // Dashboard
  DASHBOARD: "/dashboard",

  FARM_PICKER: "/farm-picker",

  CROP: {
    CROP_LIST: "/crop/list",
    CROP_DETAIL: "/crop/:id/details",
    HARVEST_DAYS: "/crop/harvest-days",
    PLANT_YIELD: "/crop/plant-yield",
  },

  CLASSIFICATION: {
    GROWTH_STAGE: "/classification/growth-stages",
    MASTER_TYPE: "/classification/master-types",
    PRODUCT: "/classification/products",
    PRODUCT_DETAIL: "/classification/products/:id/details",
    PRODUCT_DETAIL_FROM_CROP: "/crop/:cropId/classification/products/:productId/details",
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
    GRAFTED_PLANT_LIST: "/farm/grafted-plants",
    GRAFTED_PLANT_DETAIL: "/farm/grafted-plants/:id/details",
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
    ADD_PLAN_BY_PROCESS: "/plans/add-plan-by-process",
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

  CHATBOX: {
    AI_CHATBOX: "/ai-chatbox",
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

  EXPERT: {
    REPORT_LIST: "/expert/report-list",
    REPORT_DETAIL: "/expert/report-list/:id",
    IMAGE_LIST: "/expert/image-list",
    IMAGE_DETAIL: "/expert/image-list/:id",
  },
};
