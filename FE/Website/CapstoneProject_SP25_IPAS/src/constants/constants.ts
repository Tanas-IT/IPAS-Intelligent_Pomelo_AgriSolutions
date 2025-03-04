export const DEFAULT_ROWS_PER_PAGE = 5;

export const MASTER_TYPE = {
  DOCUMENT: "Document",
  CULTIVAR: "Cultivar",
  PROCESS: "Process",
  WORK: "Work",
  CRITERIA: "Criteria",
  HARVEST: "Harvest",
  NOTIFICATION: "Notification",
};

export const HEALTH_STATUS = {
  HEALTHY: "Healthy",
  MINOR_ISSUE: "Minor Issues",
  SERIOUS_ISSUE: "Serious Issues",
  DEAD: "Dead",
} as const;

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
