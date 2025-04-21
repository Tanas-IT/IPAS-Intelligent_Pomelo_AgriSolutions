import React, { FC, useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./BasicInfoTab.styles";
import theme from "@/theme";
import { CustomIcon, Loading, TextCustom } from "@/components";
import { useGraftedPlantStore } from "@/store";
import { formatDayMonth } from "@/utils";
import { GraftedPlantService } from "@/services";

const BasicInfoTab: FC<{ graftedPlantId: number }> = ({ graftedPlantId }) => {
  const { graftedPlant, setGraftedPlant } = useGraftedPlantStore();
  const [isLoading, setIsLoading] = useState(true);

  const fetchGraftedPlant = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // ⏳ Delay 1 giây
    try {
      const res = await GraftedPlantService.getGraftedPlant(graftedPlantId);
      if (res.statusCode === 200) {
        setGraftedPlant(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGraftedPlant();
  }, []);

  if (isLoading) return <Loading />;
  if (!graftedPlant) return;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tagContainer}>
        <LinearGradient
          colors={["#BCD379", "#BCD379"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.tag}
        >
          <TextCustom style={styles.tagText}>
            Grafted Plant Information
          </TextCustom>
        </LinearGradient>
      </View>

      <View style={styles.card}>
        <InfoRow
          icon="calendar"
          label="Grafted Date"
          value={
            graftedPlant.graftedDate
              ? formatDayMonth(graftedPlant.graftedDate)
              : "N/A"
          }
        />
        <InfoRow
          icon="calendar"
          label="Separated Date"
          value={
            graftedPlant.separatedDate
              ? formatDayMonth(graftedPlant.separatedDate)
              : "N/A"
          }
        />
        <InfoRow
          icon="seed"
          label="Cultivar"
          value={`${graftedPlant.cultivarName}`}
        />
        <InfoRow
          icon="map-marker"
          label="Mother Plant"
          value={`${graftedPlant.plantName}`}
        />
        <InfoRow
          icon="tree"
          label="Destination Lot"
          value={graftedPlant?.plantLotName ? graftedPlant.plantLotName : "N/A"}
        />
      </View>

      {graftedPlant.note && (
        <View style={styles.card}>
          <TextCustom style={styles.descriptionText}>
            {graftedPlant.note}
          </TextCustom>
        </View>
      )}
    </ScrollView>
  );
};

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View style={styles.infoRow}>
    <CustomIcon
      name={icon}
      size={18}
      color={theme.colors.primary}
      type="MaterialCommunityIcons"
    />
    <TextCustom style={styles.label}>{label}:</TextCustom>
    <TextCustom style={styles.value}>{value}</TextCustom>
  </View>
);

export default BasicInfoTab;
