import { CustomIcon, TextCustom } from "@/components";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

type WorkItemProps = {
  iconName: string;
  value: string | number;
  label: string;
  onPress?: () => void;
};

const WorkItem: React.FC<WorkItemProps> = ({
  iconName,
  value,
  label,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.workItem} onPress={onPress}>
      <CustomIcon name={iconName} size={24} color="#FBBF24" />
      <TextCustom style={styles.workValue}>{value}</TextCustom>
      <TextCustom style={styles.workLabel}>{label}</TextCustom>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  workItem: {
    alignItems: "center",
    flex: 1,
    backgroundColor: "#d3f0e5",
    paddingBottom: 20,
    borderRadius: 30,
    gap: 4,
    paddingTop: 15,
  },
  workValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  workIcon: {
    marginBottom: 5,
  },
  workLabel: {
    fontSize: 14,
    color: "black",
    marginTop: 5,
    textAlign: "center",
  },
});
export default WorkItem;
