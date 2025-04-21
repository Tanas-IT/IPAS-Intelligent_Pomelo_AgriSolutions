import React, { useState, useEffect, ReactNode } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  Animated,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./HarvestHistoryTab.styles";
import theme from "@/theme";
import { CustomIcon, TextCustom } from "@/components";
import { PlantService } from "@/services";
import { HarvestStatisticResponse } from "@/types";
import Toast from "react-native-toast-message";
import useMasterTypeOptions from "@/hooks/useMasterTypeOptions";
import { generateYearOptions } from "@/utils";

type OptionType = {
  value: string | number;
  label: string | ReactNode;
};

type DropdownType = "yearFrom" | "yearTo" | "product";

const HarvestHistoryTab: React.FC<{ plantId: number }> = ({ plantId }) => {
  const [yearFrom, setYearFrom] = useState<number | string>(2024);
  const [yearTo, setYearTo] = useState<number | string>(2025);
  const [productId, setProductId] = useState<number | string>(31);
  const [modalVisible, setModalVisible] = useState<DropdownType | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [data, setData] = useState<HarvestStatisticResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { options: productOptions } = useMasterTypeOptions("Product");

  const years = generateYearOptions();

  const fetchHarvestStatistics = async () => {
    setIsLoading(true);
    try {
      const res = await PlantService.getHarvestStatistics(plantId, {
        yearFrom,
        yearTo,
        productId,
      });
      if (res.statusCode === 200) {
        setData(res.data);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: res.message || "Fetch error",
        });
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Fetch error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHarvestStatistics();
  }, [yearFrom, yearTo, productId]);

  const renderDropdown = (
    label: string | number,
    value: number | string,
    setValue: React.Dispatch<React.SetStateAction<number | string>>,
    options: OptionType[],
    type: DropdownType
  ) => {
    const displayValue =
      type === "product"
        ? options.find((p) => p.value === value)?.label || "Unknown"
        : value;

    return (
      <View style={styles.pickerWrapper}>
        <TextCustom style={styles.filterLabel}>{label}</TextCustom>
        <TouchableOpacity
          style={[styles.dropdownButton, theme.shadow.default]}
          onPress={() => setModalVisible(type)}
        >
          <TextCustom style={styles.dropdownText}>{displayValue}</TextCustom>
          <CustomIcon
            name="chevron-down"
            size={20}
            color={theme.colors.primary}
            type="MaterialCommunityIcons"
          />
        </TouchableOpacity>

        <Modal
          visible={modalVisible === type}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(null)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setModalVisible(null)}
          >
            <View style={styles.modalContent}>
              <FlatList
                data={options}
                keyExtractor={(item) => `${type}-${item.value}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => {
                      setValue(item.value);
                      setModalVisible(null);
                    }}
                  >
                    <TextCustom style={styles.optionText}>
                      {item.label}
                    </TextCustom>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter */}
      <LinearGradient
        colors={["#fffcee", "#fffcee"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.filterContainer}
      >
        <View style={styles.filterRow}>
          {renderDropdown("From", yearFrom, setYearFrom, years, "yearFrom")}
          {renderDropdown("To", yearTo, setYearTo, years, "yearTo")}
          {renderDropdown(
            "Product",
            productId,
            setProductId,
            productOptions,
            "product"
          )}
        </View>
      </LinearGradient>

      <View style={styles.dividerHorizontal} />

      {/* Cards */}
      <FlatList
        data={data?.monthlyData || []}
        keyExtractor={(item) => `${item.month}-${item.year}`}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <View>
            <LinearGradient
              colors={["#BCD379", "#BCD379"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.tag}
            >
              <TextCustom style={styles.tagText}>
                {new Date(item.year, item.month - 1).toLocaleString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </TextCustom>
            </LinearGradient>
            <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
              <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                  <View style={styles.quantityBadge}>
                    <TextCustom style={styles.quantityText}>
                      {item.totalQuantity}
                      {data?.masterTypeName?.toLowerCase().includes("branches")
                        ? " bundle"
                        : " kg"}
                    </TextCustom>
                  </View>
                  <TextCustom style={styles.productType}>
                    {data?.masterTypeName || "Unknown"}
                  </TextCustom>
                </View>

                {/* <View style={styles.detailRow}>
                  <CustomIcon
                    name="cash"
                    size={22}
                    color={theme.colors.success}
                    type="MaterialCommunityIcons"
                  />
                  <TextCustom style={styles.detailText}>
                    Market Value:{" "}
                    <TextCustom style={{ color: "red" }}>
                      ${(item.totalQuantity * 2.5).toFixed(2)}
                    </TextCustom>
                  </TextCustom>
                </View> */}

                <View style={styles.detailRow}>
                  <CustomIcon
                    name="repeat"
                    size={22}
                    color={theme.colors.primary}
                    type="MaterialCommunityIcons"
                  />
                  <TextCustom style={styles.detailText}>
                    Harvested{" "}
                    <TextCustom style={{ color: "blue", fontWeight: "600" }}>
                      {item.harvestCount}
                    </TextCustom>{" "}
                    {item.harvestCount > 1 ? "times" : "time"}
                  </TextCustom>
                </View>
              </View>
            </Animated.View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={["#f0f0f0", "#e0e0e0"]}
              style={styles.emptyIconWrapper}
            >
              <CustomIcon
                name="basket"
                size={60}
                color="#999"
                type="MaterialCommunityIcons"
              />
            </LinearGradient>
            <TextCustom style={styles.emptyText}>No harvest history</TextCustom>
          </View>
        }
      />
    </View>
  );
};

export default HarvestHistoryTab;
