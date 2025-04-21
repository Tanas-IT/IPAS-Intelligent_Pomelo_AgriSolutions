import React from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { HarvestRecord } from "@/types/harvest";

import theme from "@/theme";
import { CustomIcon, TextCustom } from "@/components";
import { formatDate, formatDateAndTime } from "@/utils";
import { useAuthStore } from "@/store";
import { useModifyPermission, useSystemConfigOptions } from "@/hooks";
import {
  SYSTEM_CONFIG_GROUP,
  SYSTEM_CONFIG_KEY,
  UserRolesStr,
} from "@/constants";

interface TimelineItemProps {
  record: HarvestRecord;
  isDead: boolean;
  index: number;
  totalItems: number;
  onDelete: (recordId: number) => void;
  onEdit: () => void;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  record,
  isDead,
  index,
  totalItems,
  onDelete,
  onEdit,
}) => {
  const { options, loading } = useSystemConfigOptions(
    SYSTEM_CONFIG_GROUP.VALIDATION_VARIABLE,
    SYSTEM_CONFIG_KEY.RECORD_AFTER_DATE,
    true
  );

  const limitDays = parseInt(String(options?.[0]?.label || "0"), 10);

  const { canEdit, isEmployee } = useModifyPermission(
    record.recordDate,
    record.userID,
    limitDays,
    loading
  );

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View style={styles.timelineDot} />
        {index < totalItems && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.timelineContent}>
        <View style={styles.timelineHeader}>
          <View style={styles.timelineDateContainer}>
            <Image
              source={{ uri: record.avartarRecord }}
              style={styles.avatar}
            />
            <View style={{ flexDirection: "column" }}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TextCustom style={styles.timelineAuthor}>
                  {record.recordBy}
                </TextCustom>
                <TextCustom style={styles.createText}>
                  created this note
                </TextCustom>
              </View>
              <TextCustom style={styles.timelineDate}>
                {formatDateAndTime(record.recordDate)}
              </TextCustom>
            </View>
          </View>
          {canEdit && !isDead && (
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => onEdit()}>
                <CustomIcon
                  name="pencil"
                  size={20}
                  color="#064944"
                  type="MaterialCommunityIcons"
                />
              </TouchableOpacity>
              {!isEmployee && (
                <TouchableOpacity
                  onPress={() => onDelete(record.harvestHistoryId)}
                  style={{ marginLeft: 10 }}
                >
                  <CustomIcon
                    name="delete"
                    size={20}
                    color="#F44336"
                    type="MaterialCommunityIcons"
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
        <View style={styles.timelineNote}>
          <View style={styles.row}>
            <TextCustom style={styles.timelineText}>Harvest Date:</TextCustom>
            <TextCustom style={styles.issueText}>
              {formatDate(record.harvestDate)}
            </TextCustom>
          </View>
          <View style={styles.row}>
            <TextCustom style={styles.timelineText}>Crop:</TextCustom>
            <TextCustom style={styles.issueText}>{record.cropName}</TextCustom>
          </View>
          <View style={styles.row}>
            <TextCustom style={styles.timelineText}>Product Type:</TextCustom>
            <TextCustom style={styles.issueText}>
              {record.productName}
            </TextCustom>
          </View>
          <View style={styles.row}>
            <TextCustom style={styles.timelineText}>Yield:</TextCustom>
            <TextCustom style={styles.issueText}>
              {record.actualQuantity} {record.unit}
            </TextCustom>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffcee",
  },
  content: {
    paddingHorizontal: 15,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  timelineLeft: {
    width: 30,
    alignItems: "center",
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    borderWidth: 3,
    borderColor: "#E8F5E9",
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#ddd",
    marginVertical: 5,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  timelineDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  timelineDate: {
    fontSize: 12,
    color: "#A5A5A5",
  },
  timelineAuthor: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  createText: {
    color: "black",
    fontWeight: "500",
    fontSize: 14,
  },
  timelineNote: {
    flexDirection: "column",
    gap: 10,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  timelineText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "BalsamiqSans-Bold",
  },
  issueText: {
    fontSize: 14,
    fontWeight: "300",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 15,
    color: "#999",
    fontSize: 16,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 28,
  },

  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default TimelineItem;
