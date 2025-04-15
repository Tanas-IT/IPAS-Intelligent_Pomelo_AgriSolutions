import React, { useEffect } from "react";
import { LoginScreen } from "@/screens/Auth/LoginScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DrawerNavigation from "./DrawerNavigation";
import { ROUTE_NAMES } from "../constants/RouteNames";
import PlantDetailScreen from "@/screens/Plant/PlantDetail/PlantDetailScreen";
import NoteFormScreen from "@/screens/Plant/PlantDetail/NoteFormScreen/NoteFormScreen";
import { useAuthStore } from "@/store/authStore";
import WorklogDetailScreen from "@/screens/Worklog/WorklogDetailScreen/WorklogDetailScreen";
import { AuthNavigationProp, RootStackParamList } from "../constants/Types";
import NotificationScreen from "@/screens/Notification/Notification";
import AddNoteWorklogScreen from "@/screens/Worklog/AddNoteWorklogScreen/AddNoteWorklogScreen";
import PestDetectionScreen from "@/screens/PestDetection/PestDetection";
import { useNavigation } from "@react-navigation/native";
import { UserRole } from "@/constants";
import ReportResponseScreen from "@/screens/ReportResponse/ReportResponseScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigation() {
  const { accessToken, refreshToken, roleId } = useAuthStore();
  const navigation = useNavigation<AuthNavigationProp>();

  // Đảm bảo điều hướng sau khi login thành công
  useEffect(() => {
    if (accessToken && refreshToken) {
      switch (roleId) {
        case UserRole.User.toString():
          navigation.navigate(ROUTE_NAMES.MAIN.DRAWER, {
            screen: ROUTE_NAMES.FARM.FARM_PICKER,
          });
          break;
        case UserRole.Admin.toString():
          navigation.navigate(ROUTE_NAMES.MAIN.DRAWER, {
            screen: ROUTE_NAMES.MAIN.MAIN_TABS,
          });
          break;
        case UserRole.Owner.toString():
          navigation.navigate(ROUTE_NAMES.MAIN.DRAWER, {
            screen: ROUTE_NAMES.MAIN.MAIN_TABS,
          });
          break;
        case UserRole.Manager.toString():
          navigation.navigate(ROUTE_NAMES.MAIN.DRAWER, {
            screen: ROUTE_NAMES.MAIN.MAIN_TABS,
          });
          break;
        case UserRole.Employee.toString():
          navigation.navigate(ROUTE_NAMES.MAIN.DRAWER, {
            screen: ROUTE_NAMES.MAIN.MAIN_TABS,
          });
          break;
        default:
          navigation.navigate(ROUTE_NAMES.AUTH.LOGIN);
          break;
      }
    }
  }, [accessToken, refreshToken, roleId, navigation]);

  return (
    <Stack.Navigator initialRouteName={ROUTE_NAMES.AUTH.LOGIN}>
      <Stack.Screen
        name={ROUTE_NAMES.AUTH.LOGIN}
        component={LoginScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name={ROUTE_NAMES.MAIN.DRAWER}
        component={DrawerNavigation}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name={ROUTE_NAMES.PLANT.PLANT_DETAIL}
        component={PlantDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTE_NAMES.PLANT.ADD_NOTE}
        component={NoteFormScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTE_NAMES.WORKLOG.WORKLOG_DETAIL}
        component={WorklogDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTE_NAMES.NOTIFICATION}
        component={NotificationScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTE_NAMES.WORKLOG.ADD_NOTE_WORKLOG}
        component={AddNoteWorklogScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTE_NAMES.PEST_DETECTION.PEST_DETECTION}
        component={PestDetectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTE_NAMES.EXPERT_RESPONSE}
        component={ReportResponseScreen}
        options={{ headerShown: false }}
      />
      {/* {!accessToken ? (
          <Stack.Screen
            name={ROUTE_NAMES.AUTH.LOGIN}
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : role === 'User' && !farmName ? (
          <Stack.Screen
            name={ROUTE_NAMES.FARM.FARM_PICKER}
            component={FarmPickerScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen
            name={ROUTE_NAMES.MAIN.MAIN_TABS}
            component={DrawerNavigation}
            options={{ headerShown: false }}
          />
        )} */}
    </Stack.Navigator>
  );
}
