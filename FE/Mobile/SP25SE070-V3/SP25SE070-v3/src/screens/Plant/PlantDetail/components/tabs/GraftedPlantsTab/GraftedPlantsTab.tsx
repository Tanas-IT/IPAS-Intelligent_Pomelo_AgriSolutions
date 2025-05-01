import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "./GraftedPlantsTab.styles";
import {
  CustomIcon,
  HealthStatusBadge,
  Loading,
  TextCustom,
} from "@/components";
import { PlantService } from "@/services";
import { GraftedPlant } from "@/types";
import theme from "@/theme";
import {
  HEALTH_STATUS,
  RootStackNavigationProp,
  ROUTE_NAMES,
} from "@/constants";
import { useNavigation } from "@react-navigation/native";
import { formatDate } from "@/utils";

const GraftedPlantsTab: React.FC<{ plantId: number }> = ({ plantId }) => {
  const [graftedPlants, setGraftedPlants] = useState<GraftedPlant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const navigation = useNavigation<RootStackNavigationProp>();
  const pageSize = 20;

  const fetchGraftedPlants = useCallback(
    async (page: number, reset: boolean = false) => {
      if (page > totalPage && !reset) return;

      try {
        if (reset) setIsLoading(true);
        else setIsFetchingMore(true);

        const res = await PlantService.getGraftedPlantsByPlant(plantId, {
          pageIndex: page,
          pageSize,
        });

        if (res.statusCode === 200) {
          const newPlants = res.data.list;
          setGraftedPlants((prev) =>
            reset ? newPlants : [...prev, ...newPlants]
          );
          setTotalPage(res.data.totalPage);
          setPageIndex(page + 1);
        } else {
          // console.error("Failed to fetch grafted plants:", res.message);
        }
      } finally {
        if (reset) setIsLoading(false);
        else setIsFetchingMore(false);
      }
    },
    [plantId, totalPage]
  );

  useEffect(() => {
    fetchGraftedPlants(1, true);
  }, [plantId, fetchGraftedPlants]);

  const handleLoadMore = () => {
    if (!isFetchingMore && pageIndex <= totalPage) {
      fetchGraftedPlants(pageIndex);
    }
  };

  const renderItem = ({ item: grafted }: { item: GraftedPlant }) => (
    <TouchableOpacity style={styles.card} activeOpacity={1}>
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
        <TextCustom style={styles.plantName} numberOfLines={1}>
          {grafted.graftedPlantName}
        </TextCustom>
        <HealthStatusBadge status={grafted.status} />
      </View>

      <View style={styles.infoRow}>
        <CustomIcon
          name="barcode"
          size={16}
          color={theme.colors.primary}
          type="MaterialCommunityIcons"
        />
        <TextCustom style={styles.infoText}>
          Code: {grafted.graftedPlantCode}
        </TextCustom>
      </View>
      <View style={styles.infoRow}>
        <CustomIcon
          name="sprout"
          size={16}
          color={theme.colors.primary}
          type="MaterialCommunityIcons"
        />
        <TextCustom style={styles.infoText}>
          Cultivar: {grafted.cultivarName || "N/A"}
        </TextCustom>
      </View>
      <View style={styles.infoRow}>
        <CustomIcon
          name="calendar"
          size={16}
          color={theme.colors.primary}
          type="MaterialCommunityIcons"
        />
        <TextCustom style={styles.infoText}>
          Grafted Date:{" "}
          {grafted.graftedDate ? formatDate(grafted.graftedDate) : "N/A"}
        </TextCustom>
      </View>

      <View style={styles.infoRow}>
        <CustomIcon
          name="calendar"
          size={16}
          color={theme.colors.primary}
          type="MaterialCommunityIcons"
        />
        <TextCustom style={styles.infoText}>
          Separated Date:{" "}
          {grafted.separatedDate ? formatDate(grafted.separatedDate) : "N/A"}
        </TextCustom>
      </View>

      <View style={styles.infoRow}>
        <CustomIcon
          name="tag"
          size={16}
          color={theme.colors.primary}
          type="MaterialCommunityIcons"
        />
        <TextCustom style={styles.infoText}>
          Destination Lot: {grafted.plantLotName || "N/A"}
        </TextCustom>
      </View>

      <View style={styles.infoRow}>
        <CustomIcon
          name="note"
          size={16}
          color={theme.colors.primary}
          type="MaterialCommunityIcons"
        />
        <TextCustom style={styles.infoText} numberOfLines={2}>
          Note: {grafted.note?.trim() || "N/A"}
        </TextCustom>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() =>
            navigation.navigate(
              ROUTE_NAMES.GRAFTED_PLANT.GRAFTED_PLANT_DETAIL,
              {
                graftedPlantId: grafted.graftedPlantId.toString(),
              }
            )
          }
        >
          <TextCustom style={styles.detailButtonText}>View Detail</TextCustom>
          <CustomIcon
            name="chevron-right"
            size={16}
            color={theme.colors.primary}
            type="MaterialCommunityIcons"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return (
      <View style={styles.footerLoading}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <FlatList
      data={graftedPlants}
      renderItem={renderItem}
      keyExtractor={(item) => item.graftedPlantId.toString()}
      contentContainerStyle={styles.content}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <CustomIcon
            name="tree"
            size={40}
            color="#ccc"
            type="MaterialCommunityIcons"
          />
          <TextCustom style={styles.emptyText}>
            There are no grafted trees from this tree.
          </TextCustom>
        </View>
      }
      ListFooterComponent={renderFooter}
    />
  );
};

export default GraftedPlantsTab;
