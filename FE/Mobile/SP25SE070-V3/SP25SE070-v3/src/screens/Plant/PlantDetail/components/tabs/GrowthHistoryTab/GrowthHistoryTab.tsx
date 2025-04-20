import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Toast from "react-native-toast-message";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { RootStackNavigationProp } from "@/constants/Types";
import { styles } from "./GrowthHistoryTab.styles";
import {
  CustomIcon,
  FloatingAddButton,
  Loading,
  NoteDetailModal,
  SkeletonItem,
  TextCustom,
  TimelineItem,
} from "@/components";
import { usePlantStore } from "@/store";
import { GetPlantGrowthHistory } from "@/payloads";
import { DEFAULT_RECORDS_IN_DETAIL, ROUTE_NAMES } from "@/constants";
import { PlantService } from "@/services";
import DateRangePicker from "../../DateRangePicker";
import { processResourcesToImages, processResourcesToVideos } from "@/utils";

const GrowthHistoryTab: React.FC = () => {
  const [data, setData] = useState<GetPlantGrowthHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalIssues, setTotalIssues] = useState(0);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const navigation = useNavigation<RootStackNavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHistory, setSelectedHistory] =
    useState<GetPlantGrowthHistory | null>(null);
  const isFocused = useIsFocused();
  const pageSize = DEFAULT_RECORDS_IN_DETAIL || 10;
  const { plant } = usePlantStore();

  if (!plant) return null;

  const fetchData = useCallback(
    async (page: number, reset: boolean = false) => {
      if (isLoading || (!reset && data.length >= totalIssues)) return;
      setIsLoading(true);
      try {
        const [start, end] = dateRange;
        const hasValidRange = start && end;
        const startDateParam = hasValidRange
          ? start.toISOString().split("T")[0]
          : undefined;
        const endDateParam = hasValidRange
          ? end.toISOString().split("T")[0]
          : undefined;

        const res = await PlantService.getPlantGrowthHistory(
          plant.plantId,
          pageSize,
          page,
          hasValidRange ? startDateParam : undefined,
          hasValidRange ? endDateParam : undefined
        );

        if (res.statusCode === 200) {
          setData((prevData) =>
            reset ? res.data.list : [...prevData, ...res.data.list]
          );
          setTotalIssues(res.data.totalRecord);
        }
      } finally {
        setIsLoading(false);
        if (reset) setIsFirstLoad(false);
      }
    },
    [plant.plantId, pageSize, dateRange, isLoading, totalIssues]
  );

  useEffect(() => {
    if (isFocused) {
      setCurrentPage(1);
      setData([]);
      fetchData(1, true);
    }
  }, [dateRange, isFocused]);

  const loadMore = useCallback(() => {
    if (data.length < totalIssues && !isLoading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchData(nextPage);
    }
  }, [data.length, totalIssues, isLoading, currentPage, fetchData]);

  const handleDateChange = (index: 0 | 1, date: Date) => {
    const updatedRange: [Date | null, Date | null] = [...dateRange];
    updatedRange[index] = date;
    setDateRange(updatedRange);
  };

  const showDetailModal = (history: GetPlantGrowthHistory) => {
    setSelectedHistory({ ...history });
    setModalVisible(true);
  };

  const handleResetDates = () => {
    setDateRange([null, null]);
  };

  const handleDelete = (historyId: number) => {
    Alert.alert(
      "Confirm deletion",
      "Are you sure you want to delete this note?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            const res = await PlantService.deletePlantGrowthHistory(historyId);
            if (res.statusCode === 200) {
              setData((prevData) =>
                prevData.filter(
                  (item) => item.plantGrowthHistoryId !== historyId
                )
              );
              Toast.show({
                type: "success",
                text1: "Note Deleted",
                text2: "The note has been successfully deleted.",
              });
            } else {
              Toast.show({
                type: "error",
                text1: res.message,
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderFooter = () => {
    if (!isLoading || isFirstLoad) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#064944" />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <CustomIcon
        name="text"
        size={40}
        color="#ccc"
        type="MaterialCommunityIcons"
      />
      <TextCustom style={styles.emptyText}>
        No growth history recorded yet
      </TextCustom>
    </View>
  );

  if (isFirstLoad && !data.length) return <Loading />;

  return (
    <View style={styles.container}>
      {!plant.isDead && (
        <FloatingAddButton
          onPress={() =>
            navigation.navigate(ROUTE_NAMES.PLANT.ADD_NOTE, {
              plantId: plant.plantId,
            })
          }
        />
      )}

      <View style={styles.filterContainer}>
        <DateRangePicker
          startDate={dateRange[0]}
          endDate={dateRange[1]}
          onStartDateChange={(date) => handleDateChange(0, date)}
          onEndDateChange={(date) => handleDateChange(1, date)}
        />
        {(dateRange[0] || dateRange[1]) && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetDates}
          >
            <TextCustom style={styles.resetButtonText}>Reset</TextCustom>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={isFirstLoad && !data.length ? Array(3).fill({}) : data}
        renderItem={({ item, index }) =>
          isFirstLoad && !data.length ? (
            SkeletonItem()
          ) : (
            <TimelineItem
              history={item}
              isDead={plant.isDead}
              index={index}
              totalItems={data.length}
              onEdit={() =>
                navigation.navigate(ROUTE_NAMES.PLANT.ADD_NOTE, {
                  plantId: plant.plantId,
                  historyId: item.plantGrowthHistoryId,
                  initialData: {
                    content: item.content,
                    issueName: item.issueName || undefined,
                    images: processResourcesToImages(item.resources),
                    videos: processResourcesToVideos(item.resources),
                  },
                })
              }
              onDelete={handleDelete}
              showDetailModal={showDetailModal}
            />
          )
        }
        keyExtractor={(item, index) =>
          isFirstLoad && !data.length
            ? index.toString()
            : item.plantGrowthHistoryId.toString()
        }
        ListEmptyComponent={
          data.length === 0 && !isFirstLoad ? renderEmpty : null
        }
        ListFooterComponent={renderFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.7}
        contentContainerStyle={styles.content}
        initialNumToRender={pageSize}
        maxToRenderPerBatch={pageSize}
        windowSize={10}
      />
      <NoteDetailModal
        visible={modalVisible}
        resources={selectedHistory?.resources || null}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default GrowthHistoryTab;
