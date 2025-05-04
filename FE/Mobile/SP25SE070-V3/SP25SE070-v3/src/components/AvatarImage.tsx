import React from "react";
import { Image, View, StyleProp, ImageStyle } from "react-native";
import CustomIcon from "./CustomIcon";

interface AvatarImageProps {
  uri?: string | null;
  iconSize?: number;
  style: StyleProp<ImageStyle>;
}

const AvatarImage: React.FC<AvatarImageProps> = ({
  uri,
  iconSize = 32,
  style,
}) => {
  const isValidUri = typeof uri === "string" && uri.trim().length > 0;
  // return (
  //   <View
  //     style={[
  //       {
  //         width: iconSize,
  //         height: iconSize,
  //         borderRadius: iconSize / 2,
  //         borderWidth: 1,
  //         borderColor: "#ccc",
  //         alignItems: "center",
  //         justifyContent: "center",
  //       },
  //       style,
  //     ]}
  //   >
  //     <CustomIcon name="user" size={iconSize} color="#000" type="AntDesign" />
  //   </View>
  // );
  return isValidUri ? (
    <Image source={{ uri: uri }} style={style} />
  ) : (
    <View
      style={[
        {
          width: iconSize,
          height: iconSize,
          borderRadius: iconSize / 2,
          borderWidth: 1,
          borderColor: "#ccc",
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <CustomIcon name="user" size={iconSize} color="#000" type="AntDesign" />
    </View>
  );
};

export default AvatarImage;
