import { UserRole } from "./Enum";

export const DEFAULT_ROWS_PER_PAGE = 5;
export const DEFAULT_RECORDS_IN_DETAIL = 3;

export const UserRolesStr = {
  Admin: UserRole.Admin.toString(),
  User: UserRole.User.toString(),
  Owner: UserRole.Owner.toString(),
  Manager: UserRole.Manager.toString(),
  Employee: UserRole.Employee.toString(),
};

export const SYSTEM_CONFIG_GROUP = {
  MASTER_TYPE: "MasterType",
  GROWTH_STAGE_ACTION: "GrowthStageAction",
  WORK_TARGET: "WorkTarget",
  CRITERIA: "Criteria",
  CRITERIA_APPLY: "CriteriaApply",
  SOIL_TYPE: "SoilType",
  CLIMATE_ZONE: "ClimateZone",
  HARVEST_SEASON: "HarvestSeason",
  YIELD_THRESHOLD: "YieldThreshold",
};

export const SYSTEM_CONFIG_KEY = {
  PLANT_CRITERIA: "PlantCriteria",
  GRAFTED_CRITERIA: "GraftedCriteria",
  PLANT_LOT_CRITERIA: "PlantLotCriteria",
  PRODUCT_CRITERIA: "ProductCriteria",
};

export const MASTER_TYPE_SHOW_TABLE = {
  PROCESS: "Process",
  DOCUMENT: "Document",
  CULTIVAR: "Cultivar",
  WORK: "Work",
};

export const MASTER_TYPE = {
  DOCUMENT: "Document",
  CULTIVAR: "Cultivar",
  PROCESS: "Process",
  WORK: "Work",
  CRITERIA: "Criteria",
  PRODUCT: "Product",
  NOTIFICATION: "Notification",
};

export const GRAFTED_STATUS = {
  HEALTHY: "Healthy",
  MINOR_ISSUE: "Minor Issues",
  SERIOUS_ISSUE: "Serious Issues",
  USED: "Used",
} as const;

export const HEALTH_STATUS = {
  HEALTHY: "Healthy",
  MINOR_ISSUE: "Minor Issues",
  SERIOUS_ISSUE: "Serious Issues",
} as const;

export const DEAD_STATUS = "Dead" as const;

export const healthStatusColors: Record<string, string> = {
  Healthy: "green",
  "Minor Issues": "orange",
  "Serious Issues": "red",
  Dead: "gray",
};

export const GROWTH_ACTIONS = {
  GRAFTED: "Grafted",
  HARVEST: "Harvest",
  BOTH: "Both",
} as const;

export const VIEW_MODE = {
  TABLE: "Table",
  SIMULATION: "Simulation",
} as const;

export const ROLE = {
  EMPLOYEE: "Employee",
  MANAGER: "Manager",
} as const;

export const PARTNER = {
  PROVIDER: "Provider",
  CUSTOMER: "Customer",
} as const;

export const POLYGON_DIMENSION_LIMITS = {
  minWidth: 10,
  maxWidth: 500,
  minLength: 10,
  maxLength: 500,
};

export const WORK_TARGETS = {
  Watering: "Watering",
  Fertilizer: "Fertilizer",
  "Spraying Pesticides": "Spraying Pesticides",
  "Pruning-Shaping": "Pruning-Shaping",
  Weeding: "Weeding",
  "Pest Control": "Pest Control",
  Others: "Others",
};

export const CRITERIA_TARGETS = {
  Product: "Product",
  "Grafted Condition": "Grafted Condition",
  "Grafted Evaluation": "Grafted Evaluation",
  "Plantlot Condition": "PlantLot Condition",
  "Plantlot Evaluation": "PlantLot Evaluation",
  Others: "Others",
} as const;

export const ROUTES = {
  CROP_DETAIL: (id: number) => `/crop/${id}/details`,
  FARM_PLANT_LOT_DETAIL: (id: number) => `/farm/plant-lots/${id}/details`,
  FARM_PLANT_DETAIL: (id: number) => `/farm/plants/${id}/details`,
  FARM_PLANT_DETAIL_FROM_ROW: (plotId: number, plantId: number) =>
    `/farm/land-rows/${plotId}/plants/${plantId}/details`,
  FARM_PLANT_LOT_ADDITIONAL: (parentId: number, id: number) =>
    `/farm/plant-lots/${parentId}/additional/${id}/details`,
  FARM_GRAFTED_PLANT_DETAIL: (id: number) => `/farm/grafted-plants/${id}/details`,
  PRODUCT_DETAIL: (id: number) => `/classification/products/${id}/details`,
  PRODUCT_DETAIL_FROM_CROP: (cropId: number, productId: number) =>
    `/crop/${cropId}/classification/products/${productId}/details`,
};

export const PLAN_TARGET_TYPE = {
  "Land Plot/ Land Row/ Plant": 1,
  "Plant Lot": 2,
  "Grafted Plant": 3,
};

export const FILE_FORMAT = {
  IMAGE: "image",
  VIDEO: "video",
} as const;

export const HARVEST_SEASON_OPTIONS = {
  SPRING: "Spring Harvest",
  SUMMER: "Summer Harvest",
  AUTUMN: "Autumn Harvest",
  WINTER: "Winter Harvest",
} as const;

export const LOT_TYPE = {
  GRAFTED_LOT: "Grafted Lot",
  IMPORTED_LOT: "Imported Lot",
} as const;

export const lotTypeColors: Record<string, string> = {
  "Grafted Lot": "blue",
  "Imported Lot": "default",
};

export const CROP_STATUS = {
  PLANNED: "Planned",
  IN_CROP: "In Crop",
  HARVESTING: "Harvesting",
  COMPLETED: "Completed",
} as const;

export const cropStatusColors: Record<string, string> = {
  Planned: "blue",
  "In Crop": "orange",
  Harvesting: "orange",
  Completed: "green",
};

export const HARVEST_STATUS = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  INCOMPLETE: "Incomplete",
} as const;

export const harvestStatusColors: Record<string, string> = {
  "Not Started": "blue",
  "In Progress": "orange",
  Incomplete: "red",
  Completed: "green",
};

export const LOT_STATUS = {
  PENDING: "Pending",
  USED: "Used",
} as const;

export const lotStatusColors: Record<string, string> = {
  Pending: "orange",
  Used: "green",
};

export const ROOM_GROUPS = [
  "Today",
  "Yesterday",
  "Previous 7 Days",
  "Previous 30 Days",
  "Earlier",
] as const;
