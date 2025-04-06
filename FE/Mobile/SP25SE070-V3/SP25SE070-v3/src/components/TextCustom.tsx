import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";

interface TextCustomProps extends TextProps {
  children: React.ReactNode;
}

const TextCustom: React.FC<TextCustomProps> = ({ children, ...props }) => {
  return (
    <Text {...props} style={[styles.defaultStyle, props.style]}>
      {children}
    </Text>
  );
};

export default TextCustom;

const styles = StyleSheet.create({
  defaultStyle: {
    fontFamily: "BalsamiqSans-Regular",
  },
});
