export const ROUTE_NAMES = {
  AUTH: {
    LOGIN: "LoginScreen",
  },
  MAIN: {
    MAIN_TABS: "MainTabs",
    DRAWER: "DrawerNavigation",
    // FARM_PICKER: "FarmPickerScreen",
    PROFILE: "ProfileScreen",
  },
  PLANT: {
    PLANT_DETAIL: "PlantDetail",
    ADD_NOTE: "NoteForm",
  },
  GRAFTED_PLANT: {
    GRAFTED_PLANT_DETAIL: "GraftedPlantDetail",
    ADD_NOTE: "NoteForm",
  },
  FARM: {
    FARM_PICKER: "FarmPickerScreen",
  },
  WORKLOG: {
    WORKLOG_DETAIL: "WorklogDetail",
    ADD_NOTE_WORKLOG: "NoteFormWorklog",
  },
  NOTIFICATION: "Notification",
  PEST_DETECTION: {
    PEST_DETECTION: "PestDetection",
    SPLASH_SCREEN: "SplashScreen",
  },
  EXPERT_RESPONSE: "ExpertResponse",
} as const;
