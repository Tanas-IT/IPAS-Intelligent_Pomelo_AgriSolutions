import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TextCustom, CustomIcon } from "@/components";
import theme from "@/theme";
import { Easing } from "react-native";

const { width } = Dimensions.get("window");

interface TimeFilterModalProps {
  visible: boolean;
  onApply: (timeRange: string | undefined) => void;
  onClose: () => void;
}

const TimeFilterModal: React.FC<TimeFilterModalProps> = ({
  visible,
  onApply,
  onClose,
}) => {
  const [timeRange, setTimeRange] = useState<string | undefined>("week");
  const translateY = useRef(new Animated.Value(500)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 500,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleApply = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 500,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onApply(timeRange);
      onClose();
    });
  };

  const handleReset = () => {
    setTimeRange(undefined);
    onApply(undefined);
    onClose();
  };

  const renderRadio = (
    label: string,
    value: string | undefined,
    selectedValue: string | undefined,
    onSelect: (value: string | undefined) => void,
    iconName: string
  ) => (
    <TouchableOpacity
      style={[
        styles.radioButton,
        selectedValue === value && styles.radioButtonSelected,
      ]}
      onPress={() => onSelect(value)}
      activeOpacity={0.8}
    >
      <View style={styles.radioIconContainer}>
        <CustomIcon
          name={iconName}
          size={20}
          color={selectedValue === value ? "#20461e" : "#5E8C5C"}
          type="MaterialCommunityIcons"
        />
      </View>
      <TextCustom
        style={[
          styles.radioText,
          selectedValue === value && styles.radioTextSelected,
        ]}
      >
        {label}
      </TextCustom>
      {selectedValue === value && (
        <View style={styles.radioCheck}>
          <CustomIcon
            name="check"
            size={16}
            color="#20461e"
            type="MaterialCommunityIcons"
          />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.modalOverlay, { opacity }]}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[styles.modalContainer, { transform: [{ translateY }] }]}
        >
          <LinearGradient
            colors={["#20461e", "#3A7D36"]}
            style={styles.modalHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.headerContent}>
              <TextCustom style={styles.modalTitle}>TIME FILTER</TextCustom>
              <TextCustom style={styles.modalSubtitle}>
                Select your preferred time range
              </TextCustom>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <CustomIcon
                name="close"
                size={24}
                color="#fffcee"
                type="MaterialCommunityIcons"
              />
            </TouchableOpacity>
          </LinearGradient>

          <View style={styles.modalBody}>
            <View style={styles.filterSection}>
              <View style={styles.sectionHeader}>
                <TextCustom style={styles.sectionTitle}>TIME RANGE</TextCustom>
              </View>
              <View style={styles.radioGroup}>
                {renderRadio(
                  "This Week",
                  "week",
                  timeRange,
                  setTimeRange,
                  "calendar-week"
                )}
                {renderRadio(
                  "This Month",
                  "month",
                  timeRange,
                  setTimeRange,
                  "calendar-month"
                )}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button]}
                onPress={handleReset}
              >
                <TextCustom style={styles.resetText}>
                  Reset
                </TextCustom>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.applyButton]}
                onPress={handleApply}
              >
                <TextCustom style={styles.buttonText}>Apply Filter</TextCustom>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: "#fffcee",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
    width: width,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#fffcee",
    letterSpacing: 0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "rgba(255, 252, 238, 0.8)",
    marginTop: 4,
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
  },
  modalBody: {
    padding: 24,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#5E8C5C",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  radioGroup: {
    marginTop: 8,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(188, 211, 121, 0.15)",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(94, 140, 92, 0.1)",
  },
  radioButtonSelected: {
    backgroundColor: "#bcd379",
    borderColor: "rgba(32, 70, 30, 0.2)",
  },
  radioIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 252, 238, 0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  radioText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5E8C5C",
    flex: 1,
  },
  radioTextSelected: {
    color: "#20461e",
  },
  radioCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fffcee",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  applyButton: {
    backgroundColor: '#fee69c',
    shadowColor: "#20461e",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#20461e",
  },
  resetText: {
    color: "red",
    fontSize: 16,
  },
  applyIcon: {
    marginLeft: 8,
  },
});

export default TimeFilterModal;