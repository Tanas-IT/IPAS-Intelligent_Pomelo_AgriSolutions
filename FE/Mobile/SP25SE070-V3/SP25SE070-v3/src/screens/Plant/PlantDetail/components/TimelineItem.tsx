import React from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { HarvestRecord } from "@/types/harvest";

import { useNavigation } from "@react-navigation/native";
import { RootStackNavigationProp } from "@/constants/Types";
import { ROUTE_NAMES } from "@/constants/RouteNames";
import theme from "@/theme";
import { avt } from "@/assets/images";
import { CustomIcon, TextCustom } from "@/components";

interface TimelineItemProps {
  record: HarvestRecord;
  isLast: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ record, isLast }) => {
  const navigation = useNavigation<RootStackNavigationProp>();

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View style={styles.timelineDot} />
        {!isLast && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.timelineContent}>
        <View style={[styles.card, theme.shadow.default]}>
          <View style={styles.cardHeader}>
            <View style={styles.dateContainer}>
              <Image source={avt} style={styles.avatar} />
              <View>
                <TextCustom style={styles.recordDate}>{record.recordBy}</TextCustom>
              </View>
            </View>
            <TouchableOpacity
            //   onPress={() =>
            //     navigation.navigate(ROUTE_NAMES.PLANT.EDIT_YIELD, {
            //       recordId: record.productHarvestHistoryId,
            //       initialData: {
            //         masterTypeId: record.masterTypeId,
            //         plantId: record.plantId,
            //         quantity: record.actualQuantity,
            //         harvestHistoryId: record.harvestHistoryId,
            //       },
            //     })
            //   }
            >
              <CustomIcon
                name="pencil"
                size={20}
                color={theme.colors.primary}
                type="MaterialCommunityIcons"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.cardContent}>
            <View style={styles.row}>
              <View style={styles.column}>
                <TextCustom style={styles.label}>Harvest Date:</TextCustom>
                <TextCustom style={styles.value}>
                  {new Date(record.harvestDate).toLocaleDateString()}
                </TextCustom>
              </View>
              <View style={styles.column}>
                <TextCustom style={styles.label}>Yield:</TextCustom>
                <TextCustom style={styles.value}>
                  {record.actualQuantity} {record.unit}
                </TextCustom>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.column}>
                <TextCustom style={styles.label}>Product Type:</TextCustom>
                <TextCustom style={styles.value}>
                  {record.productName}
                </TextCustom>
              </View>
              <View style={styles.column}>
                <TextCustom style={styles.label}>Crop:</TextCustom>
                <TextCustom style={styles.value}>{record.cropName}</TextCustom>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginTop: 5,
  },
  timelineContent: {
    flex: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  recordDate: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "bold",
  },
  cardContent: {
    marginTop: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  column: {
    width: "48%",
  },
  label: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "bold",
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
});

export default TimelineItem;
