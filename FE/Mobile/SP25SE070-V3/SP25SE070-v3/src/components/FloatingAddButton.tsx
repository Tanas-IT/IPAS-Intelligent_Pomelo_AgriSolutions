import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
} from "react-native";
import CustomIcon from "./CustomIcon"; // Đường dẫn tùy bạn
import theme from "@/theme";

interface FloatingAddButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  iconSize?: number;
  iconColor?: string;
  containerStyle?: ViewStyle;
}

const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({
  onPress,
  iconSize = 24,
  iconColor = "#064944",
  containerStyle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.addButton, containerStyle]}
      onPress={onPress}
    >
      <CustomIcon
        name="plus"
        size={iconSize}
        color={iconColor}
        type="MaterialCommunityIcons"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: theme.colors.secondary,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    zIndex: 10,
  },
});

export default FloatingAddButton;
