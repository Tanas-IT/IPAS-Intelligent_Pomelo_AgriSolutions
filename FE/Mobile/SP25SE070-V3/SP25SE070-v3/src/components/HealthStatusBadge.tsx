import React from "react";
import { View, StyleSheet } from "react-native";
import TextCustom from "./TextCustom"; // hoặc component text bạn đang dùng
import { HEALTH_STATUS } from "../constants"; // tùy đường dẫn của bạn
import theme from "@/theme";
import CustomIcon from "./CustomIcon";

interface HealthStatusBadgeProps {
  status: string;
  isChange: boolean;
}

const HealthStatusBadge: React.FC<HealthStatusBadgeProps> = ({
  status,
  isChange,
}) => {
  return (
    <View style={[styles.statusBadge, getBadgeStyle(status), styles.row]}>
      <TextCustom style={[styles.statusText, getTextStyle(status)]}>
        {status}
      </TextCustom>
      {isChange && (
        <CustomIcon name="autorenew" size={18} type="MaterialCommunityIcons" />
      )}
    </View>
  );
};

const getBadgeStyle = (status: string) => {
  console.log(status);

  switch (status) {
    case HEALTH_STATUS.HEALTHY:
      return styles.statusHealthy;
    case HEALTH_STATUS.MINOR_ISSUE:
      return styles.statusMinorIssue;
    case HEALTH_STATUS.SERIOUS_ISSUE:
      return styles.statusSeriousIssue;
    case HEALTH_STATUS.DEAD:
      return styles.statusDead;
    default:
      return styles.statusDefault;
  }
};

const getTextStyle = (status: string) => {
  switch (status) {
    case HEALTH_STATUS.HEALTHY:
      return styles.textHealthy;
    case HEALTH_STATUS.MINOR_ISSUE:
      return styles.textMinorIssue;
    case HEALTH_STATUS.SERIOUS_ISSUE:
      return styles.textSeriousIssue;
    case HEALTH_STATUS.DEAD:
      return styles.textDead;
    default:
      return styles.textDefault;
  }
};

const styles = StyleSheet.create({
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusHealthy: {
    borderColor: theme.colors.statusHealthyBorder,
    backgroundColor: theme.colors.statusHealthyBg,
  },
  statusMinorIssue: {
    backgroundColor: theme.colors.statusMinorIssueBg,
    borderColor: theme.colors.statusMinorIssueBorder,
  },
  statusSeriousIssue: {
    backgroundColor: theme.colors.statusSeriousIssueBg,
    borderColor: theme.colors.statusSeriousIssueBorder,
  },
  statusDead: {
    backgroundColor: theme.colors.statusDeadBg,
  },
  statusDefault: {
    backgroundColor: theme.colors.statusDefaultBg,
    borderColor: theme.colors.statusDefaultBorder,
  },
  statusText: {
    color: "white",
    fontWeight: "600",
    fontSize: 12,
    marginRight: 4,
  },
  textHealthy: {
    color: theme.colors.statusHealthyText,
  },
  textMinorIssue: {
    color: theme.colors.statusMinorIssueText,
  },
  textSeriousIssue: {
    color: theme.colors.statusSeriousIssueText,
  },
  textDead: {
    color: theme.colors.statusDeadText,
  },
  textDefault: {
    color: theme.colors.statusDefaultText, // Màu chữ mặc định
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginLeft: 6,
  },
});

export default HealthStatusBadge;
