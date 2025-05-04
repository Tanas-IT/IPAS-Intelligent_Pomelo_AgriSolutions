import React from "react";
import {
  TextInput as PaperTextInput,
  TextInputProps as PaperTextInputProps,
} from "react-native-paper";
import { StyleProp, StyleSheet, TextStyle } from "react-native";

interface CustomTextInputProps extends PaperTextInputProps {
  fontFamily?: string;
  inputStyle?: StyleProp<TextStyle>;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  fontFamily = "BalsamiqSans-Regular",
  style,
  inputStyle,
  theme,
  ...props
}) => {
  return (
    <PaperTextInput
      {...props}
      style={[styles.defaultStyle, style]}
      contentStyle={[styles.contentStyle, inputStyle]}
    />
  );
};

const styles = StyleSheet.create({
  defaultStyle: {
    backgroundColor: "transparent",
  },
  contentStyle: {
    fontFamily: "BalsamiqSans-Regular",
  },
});

export default CustomTextInput;
