import React from "react";
import { LoginScreen } from "@/screens/Auth/LoginScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabs from "./MainTabs";
import DrawerNavigation from "./DrawerNavigation";
import { ROUTE_NAMES } from "./RouteNames";
import PlantDetailScreen from "@/screens/Plant/PlantDetail/PlantDetailScreen";
import NoteFormScreen from "@/screens/Plant/PlantDetail/NoteFormScreen/NoteFormScreen";
import { useAuthStore } from "@/store/authStore";
import { useFarmStore } from "@/store/farmStore";
import FarmPickerScreen from "@/screens/FarmPicker/FarmPickerScreen";
import WorklogDetailScreen from "@/screens/Worklog/WorklogDetailScreen/WorklogDetailScreen";
import { RootStackParamList } from "./Types";
import NotificationScreen from "@/screens/Notification/Notification";
import AddNoteWorklogScreen from "@/screens/Worklog/AddNoteWorklogScreen/AddNoteWorklogScreen";
import PestDetectionScreen from "@/screens/PestDetection/PestDetection";

// const Stack = createNativeStackNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigation() {
  const { accessToken, role } = useAuthStore();
  const { farmName } = useFarmStore();
  return (
    <Stack.Navigator initialRouteName={ROUTE_NAMES.AUTH.LOGIN}>
      <Stack.Screen
        name={ROUTE_NAMES.AUTH.LOGIN}
        component={LoginScreen}
        options={{ headerShown: false }} />
      <Stack.Screen
        name={ROUTE_NAMES.MAIN.DRAWER}
        component={DrawerNavigation}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTE_NAMES.PLANT.PLANT_DETAIL}
        component={PlantDetailScreen}
        options={{ headerShown: false }} />
      <Stack.Screen
        name={ROUTE_NAMES.PLANT.ADD_NOTE}
        component={NoteFormScreen}
        options={{ headerShown: false }} />
      <Stack.Screen
        name={ROUTE_NAMES.WORKLOG.WORKLOG_DETAIL}
        component={WorklogDetailScreen}
        options={{ headerShown: false }} />
      <Stack.Screen
        name={ROUTE_NAMES.NOTIFICATION}
        component={NotificationScreen}
        options={{ headerShown: false }} />
        <Stack.Screen
        name={ROUTE_NAMES.WORKLOG.ADD_NOTE_WORKLOG}
        component={AddNoteWorklogScreen}
        options={{ headerShown: false }} />
        <Stack.Screen
        name={ROUTE_NAMES.PEST_DETECTION.PEST_DETECTION}
        component={PestDetectionScreen}
        options={{ headerShown: false }} />
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
