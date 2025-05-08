import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from "react-native";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { LinearGradient } from "expo-linear-gradient";
import theme from "@/theme";
import { AvatarImage, CustomIcon, TextCustom } from "@/components";
import { getRoleId, getRoleName, getUserId } from "@/utils";
import { MESSAGES, UserRole, ROUTE_NAMES } from "@/constants";
import { useAuthStore } from "@/store";
import { AuthService } from "@/services";
import Toast from "react-native-toast-message";
import { useLogout } from "@/hooks";

export default function CustomDrawerContent(
  props: DrawerContentComponentProps
) {
  const { roleId, avatarUrl, fullName, farmName } = useAuthStore();
  const isUser = roleId === UserRole.User.toString();
  const STATUS_BAR_HEIGHT =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;
  const handleLogout = useLogout();

  const menuItems = [
    {
      label: "Farm Picker",
      icon: "barn",
      screen: ROUTE_NAMES.FARM.FARM_PICKER,
    },
    ...(!isUser
      ? [
          {
            label: "Home",
            icon: "home",
            screen: ROUTE_NAMES.MAIN.MAIN_TABS,
          },
        ]
      : []),
    {
      label: "Expert Response",
      icon: "message-text",
      screen: ROUTE_NAMES.EXPERT_RESPONSE,
    },
    {
      label: "Profile",
      icon: "account",
      screen: ROUTE_NAMES.MAIN.PROFILE,
    },
    {
      label: "Settings",
      icon: "cog",
      screen: "Settings",
    },
  ];

  const handleMenuPress = async (screen: string) => {
    if (screen === ROUTE_NAMES.FARM.FARM_PICKER && !isUser) {
      const res = await AuthService.refreshTokenOutFarm();
      if (res.statusCode === 200) {
        const roleId = getRoleId(res.data.authenModel.accessToken);
        const userId = getUserId(res.data.authenModel.accessToken);
        useAuthStore.getState().updateRoleOutFarm(res.data, userId, roleId);
      } else {
        Toast.show({
          type: "error",
          text1: MESSAGES.ERROR_OCCURRED,
        });
      }
    }

    props.navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#BCD379", "#064944"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, { paddingTop: STATUS_BAR_HEIGHT }]}
      >
        <View style={styles.userContainer}>
          <View style={styles.avatarContainer}>
            <AvatarImage uri={avatarUrl} style={styles.avatar} />
          </View>
          <View style={styles.userInfo}>
            <TextCustom style={styles.userName}>{fullName}</TextCustom>
            <View style={styles.userRole}>
              <CustomIcon
                name="user"
                type="FontAwesome"
                size={16}
                color="white"
              />
              <TextCustom style={styles.roleText}>
                {getRoleName(Number(roleId))}
              </TextCustom>
            </View>
          </View>
        </View>
      </LinearGradient>

      {!isUser && (
        <View style={styles.proBadge}>
          <TextCustom style={styles.proText}>Farm: {farmName}</TextCustom>
        </View>
      )}

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.screen)}
          >
            <View style={styles.iconContainer}>
              <CustomIcon
                name={item.icon}
                type="MaterialCommunityIcons"
                size={32}
                color="#064944"
              />
            </View>
            <TextCustom style={styles.menuLabel}>{item.label}</TextCustom>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <TextCustom style={styles.footerTitle}>
          Intelligent Pomelo AgriSolutions
        </TextCustom>
        <TextCustom style={styles.versionText}>Version 1.0.1</TextCustom>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <CustomIcon
            name="logout"
            type="MaterialCommunityIcons"
            size={20}
            color="red"
          />
          <TextCustom style={styles.logoutText}>Logout</TextCustom>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  gradient: {
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    marginTop: Platform.OS === "ios" ? 50 : 20,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 8,
  },
  userRole: {
    flexDirection: "row",
    alignItems: "center",
  },
  roleText: {
    fontSize: 14,
    color: "white",
    marginLeft: 6,
  },
  proBadge: {
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: -10,
    marginBottom: 20,
    zIndex: 1,
    backgroundColor: "#FEE69C",
  },
  proText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 26,
    backgroundColor: "#ECF2DA",
  },
  menuLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginBottom: Platform.OS === "ios" ? 30 : 10,
  },
  footerTitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
    color: "red",
  },
});
