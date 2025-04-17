import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./GraftedPlantsTab.styles";
import { CustomIcon, TextCustom } from "@/components";
import { GetPlantDetail } from "@/payloads";
import { PlantDetailData } from "@/types";
import { usePlantStore } from "@/store";
import { PlantService } from "@/services";

const GraftedPlantsTab: React.FC<{ plantId: number }> = ({ plantId }) => {
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
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {plant && plant.graftedPlants.length > 0 ? (
        plant.graftedPlants.map((grafted) => (
          <TouchableOpacity
            key={grafted.graftedPlantID}
            style={styles.card}
            activeOpacity={0.8}
          >
            <View style={styles.tagContainer}>
              <LinearGradient
                colors={["#BCD379", "#BCD379"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tag}
              >
                <TextCustom style={styles.tagText}>
                  {new Date(grafted.graftedDate).toLocaleDateString()}
                </TextCustom>
              </LinearGradient>
            </View>
            <View style={styles.cardHeader}>
              <View
                style={[
                  styles.statusBadge,
                  grafted.status === "Healthy" && styles.healthyStatus,
                  grafted.status === "Used" && styles.usedStatus,
                  grafted.status === "Issue" && styles.issuedStatus,
                ]}
              >
                <TextCustom style={styles.statusText}>
                  {grafted.status}
                </TextCustom>
              </View>
            </View>

            <TextCustom style={styles.plantName}>
              {grafted.graftedPlantName}
            </TextCustom>
            <TextCustom style={styles.plantCode}>
              Code: {grafted.graftedPlantCode}
            </TextCustom>

            <View style={styles.detailRow}>
              <CustomIcon
                name="tag"
                size={16}
                color="#2196F3"
                type="MaterialCommunityIcons"
              />
              <TextCustom style={styles.detailText}>
                Lot: {grafted.plantLotID || "N/A"}
              </TextCustom>
            </View>

            <TouchableOpacity style={styles.detailButton}>
              <TextCustom style={styles.detailButtonText}>
                View Details
              </TextCustom>
              <CustomIcon
                name="chevron-right"
                size={16}
                color="#064944"
                type="MaterialCommunityIcons"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <CustomIcon
            name="tree"
            size={40}
            color="#ccc"
            type="MaterialCommunityIcons"
          />
          <TextCustom style={styles.emptyText}>
            No grafted plants from this plant
          </TextCustom>
        </View>
      )}
    </ScrollView>
  );
};

export default GraftedPlantsTab;
