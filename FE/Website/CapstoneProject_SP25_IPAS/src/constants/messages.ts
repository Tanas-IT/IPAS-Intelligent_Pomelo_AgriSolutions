export const MESSAGES = {
  NETWORK_ERROR: "Network error, please check your connection!",
  UNEXPECTED_ERROR: "An unexpected error occurred. Please try again later.",
  ERROR_OCCURRED: "An error occurred",
  LOGIN_REQUIRED: "Please log in to access this page.",
  NO_PERMISSION: "You do not have permission to access this resource.",
  SESSION_EXPIRED: "Your session has expired, please log in again",
  BAD_REQUEST: "Invalid request. Please check your input and try again.",
  IMAGE_INVALID: "Only image files (PNG, JPG, GIF, WEBP) are allowed!",
  OUT_PLANT:
    "The total number of plants exceeds the row's capacity. Please reduce the number of plants or adjust the spacing.",
  DRAW_PLOT: "Please draw a plot before proceeding to the next step!",
  OVERLAPPING_PLOT: "The new plot overlaps with an existing plot!",
} as const;
