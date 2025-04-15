import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import Toast from "react-native-toast-message";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { RootStackNavigationProp } from "@/constants/Types";
import { styles } from "./GrowthHistoryTab.styles";
import { CustomIcon, Loading, NoteDetailModal, TextCustom } from "@/components";
import { avt } from "@/assets/images";
import { useAuthStore, usePlantStore } from "@/store";
import { GetPlantGrowthHistory, FileResource } from "@/payloads";
import { DEFAULT_RECORDS_IN_DETAIL, ROUTE_NAMES } from "@/constants";
import { PlantService } from "@/services";
import DateRangePicker from "../../DateRangePicker";

const currentUser = "John Doe";

interface TimelineItemProps {
  history: GetPlantGrowthHistory;
  index: number;
  totalItems: number;
  onEdit: (history: GetPlantGrowthHistory) => void;
  onDelete: (historyId: number) => void;
  userId: number | null;
  showDetailModal: (history: GetPlantGrowthHistory) => void;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  history,
  index,
  totalItems,
  onEdit,
  onDelete,
  userId,
  showDetailModal
}) => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineLeft}>
      <View style={styles.timelineDot} />
      {index < totalItems - 1 && <View style={styles.timelineLine} />}
    </View>
    <View style={styles.timelineContent}>
      <View style={styles.timelineHeader}>
        <View style={styles.timelineDateContainer}>
          <Image source={{ uri: history.noteTakerAvatar }} style={styles.avatar} />
          <View style={{ flexDirection: "column" }}>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextCustom style={styles.timelineAuthor}>
                {history.noteTakerName}
              </TextCustom>
              <TextCustom style={styles.createText}>created this note</TextCustom>
            </View>
            <TextCustom style={styles.timelineDate}>
              {new Date(history.createDate).toLocaleDateString()}
            </TextCustom>
          </View>
        </View>
        {history.userId === userId && (
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => onEdit(history)}>
              <CustomIcon
                name="pencil"
                size={20}
                color="#064944"
                type="MaterialCommunityIcons"
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete(history.plantGrowthHistoryId)}
              style={{ marginLeft: 10 }}
            >
              <CustomIcon
                name="delete"
                size={20}
                color="#F44336"
                type="MaterialCommunityIcons"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={styles.timelineNote}>
        {history.issueName && (
          <View>
            <TextCustom style={styles.timelineText}>Issues:</TextCustom>
            <TextCustom style={styles.issueText}>{history.issueName}</TextCustom>
          </View>
        )}
        {history.content && (
          <View>
            <TextCustom style={styles.timelineText}>Notes:</TextCustom>
            <TextCustom style={styles.issueText}>{history.content}</TextCustom>
          </View>
        )}
        {history.resources &&
          history.resources.length > 0 && (
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => showDetailModal(history)}
            >
              <TextCustom style={styles.detailButtonText}>
                View Details
              </TextCustom>
            </TouchableOpacity>
          )}
      </View>
    </View>
  </View>
);

const GrowthHistoryTab: React.FC = () => {
  const { userId } = useAuthStore();
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
  const { plant } = usePlantStore();
  const pageSize = DEFAULT_RECORDS_IN_DETAIL || 10;

  if (!plant) return null;

  const processResourcesToImages = (resources?: FileResource[]) => {
    if (!resources || resources.length === 0) return [];

    const images = resources
      .filter((res) => {
        const format = res.fileFormat.toLowerCase();
        const url = res.resourceURL.toLowerCase();
        return (
          ["jpeg", "jpg", "png", "gif"].includes(format) ||
          (format === "image" && /\.(jpg|jpeg|png|gif)$/i.test(url))
        );
      })
      .map((res, index) => {
        const format = res.fileFormat.toLowerCase();
        return {
          uri: res.resourceURL,
          type:
            format === "png"
              ? "image/png"
              : format === "gif"
              ? "image/gif"
              : format === "image" && res.resourceURL.toLowerCase().endsWith(".png")
              ? "image/png"
              : format === "image" && res.resourceURL.toLowerCase().endsWith(".gif")
              ? "image/gif"
              : "image/jpeg",
          name: res.resourceURL.split("/").pop() || `image_${index + 1}.${format === "image" ? "jpg" : format}`,
        };
      });

    return images;
  };

  const fetchData = useCallback(
    async (page: number, reset: boolean = false) => {
      if (isLoading || (!reset && data.length >= totalIssues)) return;
      console.log("Fetching page:", page, "Reset:", reset);
      setIsLoading(true);
      try {
        const start = dateRange[0];
        const end = dateRange[1];
        const startDateParam = start ? start.toISOString().split("T")[0] : undefined;
        const endDateParam = end ? end.toISOString().split("T")[0] : undefined;

        const res = await PlantService.getPlantGrowthHistory(
          plant.plantId,
          pageSize,
          page,
          startDateParam,
          endDateParam
        );
        console.log("Fetch data:", {
          page,
          totalRecord: res.data.totalRecord,
          listLength: res.data.list.length,
          pageSize,
        });
        if (res.statusCode === 200) {
          setData((prevData) => (reset ? res.data.list : [...prevData, ...res.data.list]));
          setTotalIssues(res.data.totalRecord);
        }
      } catch (error: any) {
        console.error("Fetch error:", error);
        Toast.show({
          type: "error",
          text1: "Load Failed",
          text2: error.message || "Could not load growth history.",
        });
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
    setSelectedHistory({
      ...history,
      // ...processResources(history.resources),
    });
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
          try {
            const res = await PlantService.deletePlantGrowthHistory(historyId);
            if (res.statusCode === 200) {
              setData((prevData) =>
                prevData.filter((item) => item.plantGrowthHistoryId !== historyId)
              );
              Toast.show({
                type: "success",
                text1: "Note Deleted",
                text2: "The note has been successfully deleted.",
              });
            } else {
              throw new Error(res.message || "Delete failed");
            }
          } catch (error: any) {
            console.error("Error deleting note:", error);
            Toast.show({
              type: "error",
              text1: "Delete Failed",
              text2: error.message || "Could not delete the note.",
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

  const renderSkeleton = () => (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineDot, { backgroundColor: "#ccc" }]} />
        <View style={[styles.timelineLine, { backgroundColor: "#eee" }]} />
      </View>
      <View style={styles.timelineContent}>
        <View style={styles.timelineHeader}>
          <View style={styles.timelineDateContainer}>
            <View style={[styles.avatar, { backgroundColor: "#eee" }]} />
            <View style={{ flexDirection: "column", gap: 8 }}>
              <View style={{ width: 100, height: 16, backgroundColor: "#eee" }} />
              <View style={{ width: 80, height: 12, backgroundColor: "#eee" }} />
            </View>
          </View>
        </View>
        <View style={styles.timelineNote}>
          <View style={{ width: "80%", height: 16, backgroundColor: "#eee", marginBottom: 8 }} />
          <View style={{ width: "60%", height: 16, backgroundColor: "#eee" }} />
        </View>
      </View>
    </View>
  );

  if (isFirstLoad && !data.length) return <Loading />;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          navigation.navigate(ROUTE_NAMES.PLANT.ADD_NOTE, {
            plantId: plant.plantId,
          })
        }
      >
        <CustomIcon
          name="plus"
          size={24}
          color="#064944"
          type="MaterialCommunityIcons"
        />
      </TouchableOpacity>

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
            renderSkeleton()
          ) : (
            <TimelineItem
              history={item}
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
                  },
                })
              }
              onDelete={handleDelete}
              userId={Number(userId)}
              showDetailModal={showDetailModal}
            />
          )
        }
        keyExtractor={(item, index) =>
          isFirstLoad && !data.length ? index.toString() : item.plantGrowthHistoryId.toString()
        }
        ListEmptyComponent={data.length === 0 && !isFirstLoad ? renderEmpty : null}
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
        history={selectedHistory}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default GrowthHistoryTab;