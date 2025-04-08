import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { RootStackNavigationProp } from "@/constants/Types";
import { ROUTE_NAMES } from "@/constants/RouteNames";
import { CustomIcon, TextCustom } from "@/components";
import { usePlantStore } from "@/store";
import { HEALTH_STATUS } from "@/constants";
import { styles } from "./PlantDetailHeader.styles";

const PlantDetailHeader: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { plant } = usePlantStore();
  if (!plant) return;
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
            value={`plant:${plant.plantId}`}
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
            <View
              style={[
                styles.statusBadge,
                plant.healthStatus === HEALTH_STATUS.HEALTHY &&
                  styles.statusHealthy,
                plant.healthStatus === HEALTH_STATUS.MINOR_ISSUE &&
                  styles.statusMinorIssue,
                plant.healthStatus === HEALTH_STATUS.SERIOUS_ISSUE &&
                  styles.statusSeriousIssue,
                plant.healthStatus === HEALTH_STATUS.DEAD && styles.statusDead,
              ]}
            >
              <TextCustom
                style={[
                  styles.statusText,
                  plant.healthStatus === HEALTH_STATUS.HEALTHY &&
                    styles.textHealthy,
                  plant.healthStatus === HEALTH_STATUS.MINOR_ISSUE &&
                    styles.textMinorIssue,
                  plant.healthStatus === HEALTH_STATUS.SERIOUS_ISSUE &&
                    styles.textSeriousIssue,
                  plant.healthStatus === HEALTH_STATUS.DEAD && styles.textDead,
                ]}
              >
                {plant.healthStatus}
              </TextCustom>
            </View>

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
