import React, { FC, useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./BasicInfoTab.styles";
import theme from "@/theme";
import { CustomIcon, Loading, TextCustom } from "@/components";
import { PlantService } from "@/services";
import { usePlantStore } from "@/store";
import { formatDayMonth } from "@/utils";

const BasicInfoTab: FC<{ plantId: number }> = ({ plantId }) => {
  const { plant, setPlant } = usePlantStore();
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlant = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500)); // ⏳ Delay 1 giây
    try {
      const res = await PlantService.getPlant(plantId);
      if (res.statusCode === 200) {
        setPlant(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlant();
  }, []);

  if (isLoading) return <Loading />;
  if (!plant) return;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.tagContainer}>
        <LinearGradient
          colors={["#BCD379", "#BCD379"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.tag}
        >
          <TextCustom style={styles.tagText}>Plant Information</TextCustom>
        </LinearGradient>
      </View>

      <View style={styles.card}>
        <InfoRow
          icon="calendar"
          label="Create Date"
          value={plant.createDate ? formatDayMonth(plant.createDate) : "N/A"}
        />
        <InfoRow
          icon="calendar"
          label="Planting Date"
          value={
            plant.plantingDate ? formatDayMonth(plant.plantingDate) : "N/A"
          }
        />
        <InfoRow
          icon="seed"
          label="Cultivar"
          value={`${plant.masterTypeName} - ${plant.characteristic}`}
        />
        <InfoRow
          icon="map-marker"
          label="Plant Location"
          value={`${plant.landPlotName} - Row ${plant.rowIndex} - Plant #${plant.plantIndex}`}
        />
        <InfoRow
          icon="tree"
          label="Plant Lot"
          value={plant?.plantLotName ? plant.plantLotName : "N/A"}
        />
        <InfoRow
          icon="tree"
          label="Mother Plan"
          value={plant?.plantReferenceName ? plant.plantReferenceName : "N/A"}
        />
      </View>

      {plant.description && (
        <View style={styles.card}>
          <TextCustom style={styles.descriptionText}>
            {plant.description}
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
