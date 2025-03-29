// import React from 'react';
// import { Ionicons, MaterialCommunityIcons, AntDesign } from '@expo/vector-icons';

// type IconProps = {
//   name: string;
//   size?: number;
//   color?: string;
//   type?: 'Ionicons' | 'MaterialCommunityIcons' | 'AntDesign';
// };

// const CustomIcon: React.FC<IconProps> = ({ name, size = 30, color = 'black', type = 'Ionicons' }) => {
//   const IconComponent = type === 'Ionicons' ? Ionicons : MaterialCommunityIcons;
//   return <IconComponent name={name as any} size={size} color={color} />;
// };

// export default CustomIcon;
import React from "react";
import { Ionicons, MaterialCommunityIcons, AntDesign, FontAwesome } from "@expo/vector-icons";

const ICON_TYPES = {
  Ionicons,
  MaterialCommunityIcons,
  AntDesign,
  FontAwesome
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
    console.warn(`Icon type "${type}" không được hỗ trợ.`);
    return null;
  }

  return <IconComponent name={name as never} size={size} color={color} />;
};

export default CustomIcon;
