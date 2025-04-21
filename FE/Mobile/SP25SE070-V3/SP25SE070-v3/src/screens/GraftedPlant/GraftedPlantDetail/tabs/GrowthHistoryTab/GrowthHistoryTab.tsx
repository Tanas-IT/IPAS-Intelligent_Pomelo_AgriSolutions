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
  DateRangePicker,
  FloatingAddButton,
  Loading,
  NoteDetailModal,
  SkeletonItem,
  TextCustom,
  TimelineItem,
} from "@/components";
import { useGraftedPlantStore } from "@/store";
import { GetGraftedGrowthHistory } from "@/payloads";
import {
  DEFAULT_RECORDS_IN_DETAIL,
  GRAFTED_STATUS,
  ROUTE_NAMES,
} from "@/constants";
import { GraftedPlantService } from "@/services";
import { processResourcesToImages, processResourcesToVideos } from "@/utils";

const GrowthHistoryTab: React.FC = () => {
  const [data, setData] = useState<GetGraftedGrowthHistory[]>([]);
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
    useState<GetGraftedGrowthHistory | null>(null);
  const isFocused = useIsFocused();
  const { graftedPlant } = useGraftedPlantStore();
  const pageSize = DEFAULT_RECORDS_IN_DETAIL || 10;

  if (!graftedPlant) return null;

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

        const res = await GraftedPlantService.getGraftedPlantGrowthHistory(
          graftedPlant.graftedPlantId,
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
    [graftedPlant, pageSize, dateRange, isLoading, totalIssues]
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

  const showDetailModal = (history: GetGraftedGrowthHistory) => {
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
            const res =
              await GraftedPlantService.deleteGraftedPlantGrowthHistory(
                historyId
              );
            if (res.statusCode === 200) {
              setData((prevData) =>
                prevData.filter((item) => item.graftedPlantNoteId !== historyId)
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
      {!graftedPlant.isDead ||
        (graftedPlant.status !== GRAFTED_STATUS.USED && (
          <FloatingAddButton
            onPress={() =>
              navigation.navigate(ROUTE_NAMES.GRAFTED_PLANT.ADD_NOTE, {
                graftedPlantId: graftedPlant.graftedPlantId,
              })
            }
          />
        ))}

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
              isDisable={
                graftedPlant.isDead ||
                graftedPlant.status === GRAFTED_STATUS.USED
              }
              idKey="graftedPlantNoteId"
              index={index}
              totalItems={data.length}
              onEdit={() =>
                navigation.navigate(ROUTE_NAMES.GRAFTED_PLANT.ADD_NOTE, {
                  graftedPlantId: graftedPlant.graftedPlantId,
                  historyId: item.graftedPlantNoteId,
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
            : item.graftedPlantNoteId.toString()
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
