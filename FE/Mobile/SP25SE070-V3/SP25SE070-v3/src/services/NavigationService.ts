import { ROUTE_NAMES } from "@/constants";
import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export function resetToLogin() {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: ROUTE_NAMES.AUTH.LOGIN }],
    });
  }
}

export function resetToFarmPicker() {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name: ROUTE_NAMES.FARM.FARM_PICKER }],
    });
  }
}
