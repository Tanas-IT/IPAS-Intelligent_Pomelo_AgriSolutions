import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { RootStackNavigationProp } from "@/constants/Types";
import { ROUTE_NAMES } from "@/constants/RouteNames";
import { CustomIcon, HealthStatusBadge, TextCustom } from "@/components";
import { usePlantStore } from "@/store";
import { HEALTH_STATUS } from "@/constants";
import { styles } from "./PlantDetailHeader.styles";
import { PlantService } from "@/services";
import Toast from "react-native-toast-message";

const PlantDetailHeader: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { plant } = usePlantStore();
  const { showActionSheetWithOptions } = useActionSheet();

  if (!plant) return;
  const statusList = [
    HEALTH_STATUS.HEALTHY,
    HEALTH_STATUS.MINOR_ISSUE,
    HEALTH_STATUS.SERIOUS_ISSUE,
    // HEALTH_STATUS.DEAD,
  ];
  const openStatusSelector = () => {
    const cancelButtonIndex = statusList.length;

    showActionSheetWithOptions(
      {
        options: [...statusList, "Cancel"],
        cancelButtonIndex,
        title: "Select Health Status",
      },
      async (selectedIndex) => {
        if (selectedIndex !== undefined && selectedIndex < statusList.length) {
          const selectedStatus = statusList[selectedIndex];
          const res = await PlantService.updatePlantStatus({
            plantId: plant.plantId,
            healthStatus: selectedStatus,
          });
          if (res.statusCode === 200) {
            usePlantStore.getState().setPlant({
              ...plant,
              healthStatus: res.data.healthStatus,
            });
            Toast.show({
              type: "success",
              text1: res.message,
            });
          } else {
            Toast.show({
              type: "error",
              text1: res.message,
            });
          }
        }
      }
    );
  };

  return (
    <View style={styles.header}>
      <LinearGradient
        colors={["#BCD379", "#064944"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.image}
      />
      <TouchableOpacity
        style={[
          styles.backButton,
          { position: "absolute", top: 60, left: 10, zIndex: 100 },
        ]}
        onPress={() =>
          navigation.navigate(ROUTE_NAMES.MAIN.DRAWER, {
            screen: ROUTE_NAMES.MAIN.MAIN_TABS,
          })
        }
      >
        <CustomIcon
          name="arrow-left"
          size={24}
          color="white"
          type="MaterialCommunityIcons"
        />
      </TouchableOpacity>

      <View style={styles.overlay}>
        <View style={styles.qrContainer}>
          <QRCode
            value={`plantId:${plant.plantId}`}
            size={70}
            backgroundColor="transparent"
            color="black"
          />
        </View>

        <View style={styles.textContainer}>
          <TextCustom style={styles.plantName}>{plant.plantName}</TextCustom>
          <TextCustom style={styles.plantCode}>
            Code: {plant.plantCode}
          </TextCustom>

          <View style={styles.statusRow}>
            <TouchableOpacity
              onPress={openStatusSelector}
              disabled={plant.isDead}
            >
              <HealthStatusBadge status={plant.healthStatus} />
            </TouchableOpacity>

            <View style={styles.growthStageBadge}>
              <CustomIcon
                name="leaf"
                size={16}
                color="#4CAF50"
                type="MaterialCommunityIcons"
              />
              <TextCustom
                style={styles.growthStageText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {plant.growthStageName}
              </TextCustom>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PlantDetailHeader;
