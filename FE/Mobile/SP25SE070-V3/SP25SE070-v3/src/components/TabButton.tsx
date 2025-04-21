import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import theme from "@/theme";
import { CustomIcon, TextCustom } from "@/components";

interface TabButtonProps {
  iconName: string;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({
  iconName,
  label,
  isActive,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.tabItem, isActive && styles.activeTab]}
      onPress={onPress}
    >
      <CustomIcon
        name={iconName}
        size={24}
        color={isActive ? "white" : theme.colors.primary}
        type="MaterialCommunityIcons"
      />
      <TextCustom style={[styles.tabLabel, isActive && styles.activeLabel]}>
        {label}
      </TextCustom>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
  },
  tabItem: {
    alignItems: "center",
    padding: 8,
    borderRadius: 20,
    backgroundColor: "white",
    minWidth: 60,
    shadowColor: "#000000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 5,
    color: theme.colors.primary,
  },
  activeLabel: {
    color: "white",
    fontWeight: "600",
  },
  tabContent: {
    flex: 1,
  },
});

export default TabButton;
