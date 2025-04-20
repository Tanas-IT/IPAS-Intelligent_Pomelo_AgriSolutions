import { UserRole } from "./Enum";

export const DEFAULT_RECORDS_IN_DETAIL = 3;

export const UserRolesStr = {
  Admin: UserRole.Admin.toString(),
  User: UserRole.User.toString(),
  Owner: UserRole.Owner.toString(),
  Manager: UserRole.Manager.toString(),
  Employee: UserRole.Employee.toString(),
};

export const HEALTH_STATUS = {
  HEALTHY: "Healthy",
  MINOR_ISSUE: "Minor Issues",
  SERIOUS_ISSUE: "Serious Issues",
  DEAD: "Dead",
} as const;

export const GRAFTED_STATUS = {
  HEALTHY: "Healthy",
  MINOR_ISSUE: "Minor Issues",
  SERIOUS_ISSUE: "Serious Issues",
  USED: "Used",
} as const;

export const MASTER_TYPE = {
  DOCUMENT: "Document",
  CULTIVAR: "Cultivar",
  PROCESS: "Process",
  WORK: "Work",
  CRITERIA: "Criteria",
  PRODUCT: "Product",
  NOTIFICATION: "Notification",
};

export const FILE_FORMAT = {
  IMAGE: "image",
  VIDEO: "video",
} as const;

export const SYSTEM_CONFIG_GROUP = {
  MASTER_TYPE: "MasterType",
  GROWTH_STAGE_ACTION: "GrowthStageAction",
  WORK: "Work",
  CRITERIA: "Criteria",
  PLANT_LOT_CRITERIA: "PlantLotCriteria",
  PLANT_CRITERIA: "PlantCriteria",
  GRAFTED_CRITERIA: "GraftedCriteria",
  PRODUCT_CRITERIA: "ProductCriteria",
  SOIL_TYPE: "SoilType",
  CLIMATE_ZONE: "ClimateZone",
  HARVEST_SEASON: "HarvestSeason",
  YIELD_THRESHOLD: "YieldThreshold",
  VALIDATION_VARIABLE: "ValidationVariable",
};

export const criteriaGroupsHasReference = [
  "PlantLotCriteria",
  "PlantCriteria",
  "GraftedCriteria",
  "ProductCriteria",
];

export const SYSTEM_CONFIG_KEY = {
  PLANT_CRITERIA: "PlantCriteria",
  GRAFTED_CRITERIA: "GraftedCriteria",
  PLANT_LOT_CRITERIA: "PlantLotCriteria",
  PRODUCT_CRITERIA: "ProductCriteria",
  EDIT_IN_DAY: "EditInDay",
  RECORD_AFTER_DATE: "RecordAfterDate",
};
