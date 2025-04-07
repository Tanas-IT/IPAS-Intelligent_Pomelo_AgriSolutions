import { StatusType } from "@/types";
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import TextCustom from "./TextCustom";

const statusStyles: Record<
  StatusType,
  { backgroundColor: string; textColor: string; borderColor: string }
> = {
  notStarted: {
    backgroundColor: "#E1BEE7",
    textColor: "#880E4F",
    borderColor: "#880E4F",
  },
  inProgress: {
    backgroundColor: "#BBDEFB",
    textColor: "#0D47A1",
    borderColor: "#0D47A1",
  },
  overdue: {
    backgroundColor: "#FFCDD2",
    textColor: "#B71C1C",
    borderColor: "#B71C1C",
  },
  reviewing: {
    backgroundColor: "#FFECB3",
    textColor: "#FF6F00",
    borderColor: "#FF6F00",
  },
  done: {
    backgroundColor: "#C8E6C9",
    textColor: "#1B5E20",
    borderColor: "#1B5E20",
  },
  redo: {
    backgroundColor: "#FFCCBC",
    textColor: "#D84315",
    borderColor: "#D84315",
  },
  onRedo: {
    backgroundColor: "#FFAB91",
    textColor: "#BF360C",
    borderColor: "#BF360C",
  },
  cancelled: {
    backgroundColor: "#CFD8DC",
    textColor: "#455A64",
    borderColor: "#455A64",
  },
};

interface StatusBadgeProps {
  status: StatusType;
  customStyle?: object;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, customStyle }) => {
  const style = statusStyles[status] || statusStyles.notStarted;

  return (
    <View
      style={[
        styles.statusBadge,
        {
          backgroundColor: style.backgroundColor,
          borderColor: style.borderColor,
        },
        customStyle,
      ]}
    >
      <TextCustom style={[styles.statusText, { color: style.textColor }]}>
        {status}
      </TextCustom>
    </View>
  );
};

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "capitalize",
    textAlign: "center",
    flexShrink: 1,
  },
});

export default StatusBadge;
