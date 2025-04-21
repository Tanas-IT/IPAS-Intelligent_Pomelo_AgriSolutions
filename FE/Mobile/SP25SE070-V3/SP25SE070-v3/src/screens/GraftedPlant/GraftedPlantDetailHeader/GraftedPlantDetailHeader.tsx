import React from "react";
import { View, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import QRCode from "react-native-qrcode-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { RootStackNavigationProp } from "@/constants/Types";
import { ROUTE_NAMES } from "@/constants/RouteNames";
import { CustomIcon, HealthStatusBadge, TextCustom } from "@/components";
import { useGraftedPlantStore } from "@/store";
import { GRAFTED_STATUS, HEALTH_STATUS } from "@/constants";
import { styles } from "./GraftedPlantDetailHeader.styles";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { GraftedPlantService } from "@/services";

const GraftedPlantDetailHeader: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { graftedPlant } = useGraftedPlantStore();
  const { showActionSheetWithOptions } = useActionSheet();

  if (!graftedPlant) return;
  const isInactive =
    graftedPlant.isDead || graftedPlant.status === GRAFTED_STATUS.USED;
  const statusList = [
    HEALTH_STATUS.HEALTHY,
    HEALTH_STATUS.MINOR_ISSUE,
    HEALTH_STATUS.SERIOUS_ISSUE,
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
          const res = await GraftedPlantService.updateGraftedPlantStatus({
            graftedPlantId: graftedPlant.graftedPlantId,
            status: selectedStatus,
          });
          if (res.statusCode === 200) {
            useGraftedPlantStore.getState().setGraftedPlant({
              ...graftedPlant,
              status: res.data.status,
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
            value={`graftedPlantId:${graftedPlant.graftedPlantId}`}
            size={70}
            backgroundColor="transparent"
            color="black"
          />
        </View>

        <View style={styles.textContainer}>
          <TextCustom style={styles.plantName}>
            {graftedPlant.graftedPlantName}
          </TextCustom>
          <TextCustom style={styles.plantCode}>
            Code: {graftedPlant.graftedPlantCode}
          </TextCustom>

          <View style={styles.statusRow}>
            <TouchableOpacity
              onPress={openStatusSelector}
              disabled={isInactive}
            >
              <HealthStatusBadge
                status={graftedPlant.status}
                isChange={!isInactive}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default GraftedPlantDetailHeader;
