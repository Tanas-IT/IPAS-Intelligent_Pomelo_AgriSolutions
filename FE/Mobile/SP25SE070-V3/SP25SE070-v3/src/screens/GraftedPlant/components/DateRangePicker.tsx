import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  Pressable,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import theme from "@/theme";
import { CustomIcon, TextCustom } from "@/components";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const [activePicker, setActivePicker] = useState<"start" | "end" | null>(
    null
  );

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setActivePicker(null);
    }

    if (!selectedDate) return;

    if (activePicker === "start") {
      onStartDateChange(selectedDate);
    } else if (activePicker === "end") {
      onEndDateChange(selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const renderPicker = () => {
    if (!activePicker) return null;

    const value =
      activePicker === "start"
        ? startDate || new Date()
        : endDate || new Date();

    if (Platform.OS === "ios") {
      return (
        <Modal transparent animationType="fade" visible={!!activePicker}>
          <View style={styles.iosModalBackground}>
            <View style={styles.iosModalContainer}>
              <View style={styles.iosHeader}>
                <Pressable
                  style={styles.iosButton}
                  onPress={() => setActivePicker(null)}
                >
                  <TextCustom style={styles.iosButtonText}>Done</TextCustom>
                </Pressable>
              </View>
              <View style={styles.pickerContainer}>
                <DateTimePicker
                  value={value}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  locale="vi-VN"
                />
              </View>
            </View>
          </View>
        </Modal>
      );
    }

    return (
      <DateTimePicker
        value={value}
        mode="date"
        display="default"
        onChange={handleDateChange}
      />
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.dateButton,
          activePicker === "start" && styles.activeButton,
        ]}
        onPress={() => setActivePicker("start")}
        activeOpacity={0.7}
      >
        <CustomIcon
          name="calendar"
          size={20}
          color="#064944"
          type="MaterialCommunityIcons"
        />
        <TextCustom style={styles.dateText}>
          {startDate ? formatDate(startDate) : "Start Date"}
        </TextCustom>
      </TouchableOpacity>

      <View style={styles.separator}>
        <TextCustom>-</TextCustom>
      </View>

      <TouchableOpacity
        style={[
          styles.dateButton,
          activePicker === "end" && styles.activeButton,
        ]}
        onPress={() => setActivePicker("end")}
        activeOpacity={0.7}
      >
        <CustomIcon
          name="calendar"
          size={20}
          color="#064944"
          type="MaterialCommunityIcons"
        />
        <TextCustom style={styles.dateText}>
          {endDate ? formatDate(endDate) : "End Date"}
        </TextCustom>
      </TouchableOpacity>

      {renderPicker()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  dateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.secondary,
    borderRadius: 8,
    padding: 12,
    justifyContent: "center",
  },
  activeButton: {
    borderColor: theme.colors.primary,
    backgroundColor: "#E8F4F3",
  },
  dateText: {
    fontSize: 14,
    color: theme.colors.primary,
    marginLeft: 8,
  },
  separator: {
    paddingHorizontal: 8,
  },
  // ios
  iosContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  iosModalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  iosModalContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  iosHeader: {
    backgroundColor: "#F5F5F5",
    padding: 16,
    alignItems: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  iosButton: {
    padding: 8,
  },
  iosButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  pickerContainer: {
    padding: 20,
  },
});

export default DateRangePicker;
