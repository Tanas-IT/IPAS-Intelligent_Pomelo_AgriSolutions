import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import WorklogScreen from "@/screens/Worklog/WorklogScreen/WorklogScreen";
import ScanScreen from "@/screens/Scan/ScanScreen";
import { MainTabParamList } from "../constants/Types";
import AIScreen from "@/screens/AI/AI";
import PestDetectionScreen from "@/screens/PestDetection/PestDetection";
import { HeaderBackButton } from "@react-navigation/elements";
import { DrawerActions } from "@react-navigation/native";
import EmployeeHomeScreen from "@/screens/Home/EmployeeHomeScreen/EmployeeHomeScreen";
import theme from "@/theme";
import SplashScreen from "@/screens/PestDetection/SplashScreen/SplashScreen";
import ManagerHomeScreen from "@/screens/Home/ManagerHomeScreen/ManagerHomeScreen";
import { CustomIcon } from "@/components";
import { useAuthStore } from "@/store";
import { UserRolesStr } from "@/constants";
import { ReportResponseScreen } from "@/screens";

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabs() {
  const { roleId } = useAuthStore();
  const isEmployee = roleId === UserRolesStr.Employee;
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        headerLeft: () => (
          <HeaderBackButton
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            tintColor="#326E2F"
          />
        ),
        headerTitle: "",
        headerShown: true,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "Scan") {
            return (
              <TouchableOpacity style={styles.scanButton}>
                <CustomIcon
                  name="qrcode-scan"
                  type="MaterialCommunityIcons"
                  size={32}
                  color="white"
                />
              </TouchableOpacity>
            );
          }

          const icons = {
            Home: {
              name: focused ? "home" : "home-outline",
              type: "MaterialCommunityIcons",
            },
            Worklog: {
              name: focused ? "calendar" : "calendar-outline",
              type: "MaterialCommunityIcons",
            },
            ChatAI: {
              name: focused ? "chatbubbles" : "chatbubbles-outline",
              type: "Ionicons",
            },
            SplashScreen: {
              name: focused ? "bug" : "bug-outline",
              type: "MaterialCommunityIcons",
            },
          } as const;

          const icon = icons[route.name] || {
            name: "help-circle-outline",
            type: "MaterialCommunityIcons",
          };

          return (
            <CustomIcon
              name={icon.name}
              type={icon.type}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Home"
        component={isEmployee ? EmployeeHomeScreen : ManagerHomeScreen}
        options={{
          tabBarLabel: "Home",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Worklog"
        component={WorklogScreen}
        options={{
          tabBarLabel: "Calendar",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.scanButtonContainer}>
              <View style={styles.scanButton}>
                <CustomIcon
                  name="qrcode-scan"
                  type="MaterialCommunityIcons"
                  size={32}
                  color="white"
                />
              </View>
            </View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.scanButtonTouchable}
              onPress={props.onPress}
            >
              {props.children}
            </TouchableOpacity>
          ),
          tabBarLabel: "Scan",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="ChatAI"
        component={ReportResponseScreen}
        options={{
          tabBarLabel: "Chat AI",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="SplashScreen"
        component={SplashScreen}
        options={{
          tabBarLabel: "Detection",
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "white",
    height: 90,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    paddingTop: 10,
  },
  scanButtonContainer: {
    top: -20,
    justifyContent: "center",
    alignItems: "center",
  },
  scanButton: {
    backgroundColor: theme.colors.primary,
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 15,
    elevation: 10,
  },
  scanButtonTouchable: {
    top: -20,
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: 70,
  },
});
