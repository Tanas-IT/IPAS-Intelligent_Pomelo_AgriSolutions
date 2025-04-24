import React from "react";
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import MainTabs from "./MainTabs";
import FarmPickerScreen from "@/screens/FarmPicker/FarmPickerScreen";
import ProfileScreen from "@/screens/Profile/ProfileScreen";
import { Notification } from "./components/Notification";
import { useNavigation } from "@react-navigation/native";
import theme from "@/theme";
import CustomDrawerContent from "./CustomDrawerContent";
import { useAuthStore } from "@/store";
import {
  DrawerParamList,
  RootStackNavigationProp,
  ROUTE_NAMES,
  UserRole,
} from "@/constants";
import { useNotifications } from "@/hooks";

const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigation() {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {
      notifications,
      unreadCount
    } = useNotifications();
  const { roleId } = useAuthStore();
  const isUser = roleId === UserRole.User.toString();
  return (
    <Drawer.Navigator
      drawerContent={(props: DrawerContentComponentProps) => (
        <CustomDrawerContent {...props} />
      )}
      screenOptions={{
        drawerType: "slide",
        headerTitle: "",
        drawerStyle: {
          width: "80%",
          backgroundColor: "#f5f5f5",
        },
        swipeEnabled: true,
        headerTintColor: theme.colors.primary,
        headerRight: !isUser
          ? () => (
              <Notification
                unreadCount={unreadCount}
                onPress={() => navigation.navigate(ROUTE_NAMES.NOTIFICATION)}
              />
            )
          : undefined,
        headerRightContainerStyle: {
          paddingRight: 16,
        },
        headerLeftContainerStyle: {
          paddingLeft: 16,
        },
      }}
    >
      <Drawer.Screen name={ROUTE_NAMES.MAIN.MAIN_TABS} component={MainTabs} />
      <Drawer.Screen
        name={ROUTE_NAMES.FARM.FARM_PICKER}
        component={FarmPickerScreen}
      />
      <Drawer.Screen
        name={ROUTE_NAMES.MAIN.PROFILE}
        component={ProfileScreen}
      />
    </Drawer.Navigator>
  );
}
