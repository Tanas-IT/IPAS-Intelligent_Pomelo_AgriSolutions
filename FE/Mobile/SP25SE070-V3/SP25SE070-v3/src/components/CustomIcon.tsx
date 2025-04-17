import React from "react";
import { Ionicons, MaterialCommunityIcons, AntDesign, FontAwesome, MaterialIcons } from "@expo/vector-icons";

const ICON_TYPES = {
  Ionicons,
  MaterialCommunityIcons,
  AntDesign,
  FontAwesome,
  MaterialIcons
} as const;

type IconType = keyof typeof ICON_TYPES;

type IconProps = {
  name: string;
  size?: number;
  color?: string;
  type?: IconType;
};

const CustomIcon: React.FC<IconProps> = ({
  name,
  size = 30,
  color = "black",
  type = "Ionicons",
}) => {
  const IconComponent = ICON_TYPES[type];

  if (!IconComponent) {
    console.warn(`Icon type "${type}" is not supported.`);
    return null;
  }

  return <IconComponent name={name as never} size={size} color={color} />;
};

export default CustomIcon;
