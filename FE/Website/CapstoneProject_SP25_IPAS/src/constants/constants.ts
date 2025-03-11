export const DEFAULT_ROWS_PER_PAGE = 5;

export const MASTER_TYPE = {
  DOCUMENT: "Document",
  CULTIVAR: "Cultivar",
  PROCESS: "Process",
  WORK: "Work",
  CRITERIA: "Criteria",
  PRODUCT: "Product",
  NOTIFICATION: "Notification",
};

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
  Dead: "#444",
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
  Harvest: "Harvest",
  "Grafted Condition": "Grafted Condition",
  "Grafted Evaluation": "Grafted Evaluation",
  "Plant Lot Evaluation": "Plant Lot Evaluation",
};
