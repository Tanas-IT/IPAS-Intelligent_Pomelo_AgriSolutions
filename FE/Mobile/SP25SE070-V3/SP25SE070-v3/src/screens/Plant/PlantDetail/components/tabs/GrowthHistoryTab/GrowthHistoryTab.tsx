import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { RootStackNavigationProp } from "@/constants/Types";
// import NoteDetailModal from "../../NoteDetailModal";
import DateTimePicker from "@react-native-community/datetimepicker";
import { styles } from "./GrowthHistoryTab.styles";
import { CustomIcon, Loading, TextCustom } from "@/components";
import { avt } from "@/assets/images";
import { usePlantStore } from "@/store";
import { GetPlantGrowthHistory } from "@/payloads";
import { DEFAULT_RECORDS_IN_DETAIL, ROUTE_NAMES } from "@/constants";
import { PlantService } from "@/services";
import { Dayjs } from "dayjs";

const currentUser = "John Doe";

const GrowthHistoryTab: React.FC = () => {
  const [data, setData] = useState<GetPlantGrowthHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const visibleCount = DEFAULT_RECORDS_IN_DETAIL;
  const [totalIssues, setTotalIssues] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHistory, setSelectedHistory] =
    useState<GetPlantGrowthHistory | null>(null);
  const navigation = useNavigation<RootStackNavigationProp>();
  const { plant, setPlant } = usePlantStore();
  if (!plant) return;

  const fetchData = async () => {
    if (isFirstLoad || isLoading)
      await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const start = dateRange[0];
      const end = dateRange[1];

      const startDateParam =
        start && end && start <= end
          ? start.toISOString().split("T")[0]
          : undefined;
      const endDateParam =
        start && end && start <= end
          ? end.toISOString().split("T")[0]
          : undefined;

      const res = await PlantService.getPlantGrowthHistory(
        plant.plantId,
        visibleCount,
        currentPage,
        startDateParam,
        endDateParam
      );
      if (res.statusCode === 200) {
        setData((prevData) =>
          currentPage > 1 ? [...prevData, ...res.data.list] : res.data.list
        );
        setTotalIssues(res.data.totalRecord);
      }
    } finally {
      setIsLoading(false);
      setIsFirstLoad(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, dateRange, isLoading]);

  const handleResetData = async () => {
    setData([]);
    setIsLoading(true);
    setCurrentPage(1);
  };

  const handleDateChange = (index: 0 | 1, date: Date | undefined) => {
    if (!date) return;
    const updatedRange: [Date | null, Date | null] = [...dateRange];
    // Kiểm tra điều kiện: End phải sau Start
    if (index === 1 && updatedRange[0] && date < updatedRange[0]) {
      Toast.show({
        type: "error",
        text1: "Invalid Date Range",
        text2: "End date must be after the start date.",
      });
      return;
    }

    if (index === 0 && updatedRange[1] && date > updatedRange[1]) {
      Toast.show({
        type: "error",
        text1: "Invalid Date Range",
        text2: "Start date must be before the end date.",
      });
      return;
    }

    updatedRange[index] = date;
    setDateRange(updatedRange);
    handleResetData();
  };

  const handleDelete = (historyId: number) => {
    Toast.show({
      type: "success",
      text1: "Note Deleted",
      text2: "The note has been successfully deleted.",
    });
  };

  const processResources = (resources?: string[]) => {
    if (!resources) return { images: [], videos: [] };
    const images = resources.filter((url) =>
      /\.(jpg|jpeg|png|gif)$/i.test(url)
    );
    const videos = resources.filter((url) => /\.(mp4|mov|avi)$/i.test(url));
    return { images, videos };
  };

  const showDetailModal = (history: GetPlantGrowthHistory) => {
    setSelectedHistory({
      ...history,
      // ...processResources(history.resources),
    });
    setModalVisible(true);
  };

  if (isFirstLoad) return <Loading />;

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

      {/* <View style={{ padding: 16 }}>
        <Text style={{ fontWeight: "bold" }}>Timeline filter:</Text>
        <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
          <View>
            <Text>Start date</Text>
            <DateTimePicker
              value={dateRange[0] ?? new Date()}
              mode="date"
              display="default"
              onChange={(_, selectedDate) => {
                if (selectedDate) handleDateChange(0, selectedDate);
              }}
            />
          </View>
          <View>
            <Text>End date</Text>
            <DateTimePicker
              value={dateRange[1] ?? new Date()}
              mode="date"
              display="default"
              onChange={(_, selectedDate) => {
                if (selectedDate) handleDateChange(1, selectedDate);
              }}
            />
          </View>
        </View>
      </View> */}

      <ScrollView contentContainerStyle={styles.content}>
        {data.length > 0 ? (
          data.map((history, index) => (
            <View
              key={history.plantGrowthHistoryId}
              style={styles.timelineItem}
            >
              <View style={styles.timelineLeft}>
                <View style={styles.timelineDot} />
                {index < data.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>

              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <View style={styles.timelineDateContainer}>
                    <Image source={avt} style={styles.avatar} />
                    <View style={{ flexDirection: "column" }}>
                      <View style={{ flexDirection: "row", gap: 10 }}>
                        <TextCustom style={styles.timelineAuthor}>
                          {history.noteTakerName}
                        </TextCustom>
                        <TextCustom style={styles.createText}>
                          created this note
                        </TextCustom>
                      </View>
                      <TextCustom style={styles.timelineDate}>
                        {new Date(history.createDate).toLocaleDateString()}
                      </TextCustom>
                    </View>
                  </View>

                  {/* edit/delete nếu là note của user */}
                  {history.noteTakerName === currentUser && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate(ROUTE_NAMES.PLANT.ADD_NOTE, {
                            plantId: plant.plantId,
                            historyId: history.plantGrowthHistoryId,
                            initialData: {
                              content: history.content,
                              issueName: history.issueName,
                              // images: history.resources[0],
                            },
                          })
                        }
                      >
                        <CustomIcon
                          name="pencil"
                          size={20}
                          color="#064944"
                          type="MaterialCommunityIcons"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          handleDelete(history.plantGrowthHistoryId)
                        }
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
                      <TextCustom style={styles.timelineText}>
                        Issues:
                      </TextCustom>
                      <TextCustom style={styles.issueText}>
                        {history.issueName}
                      </TextCustom>
                    </View>
                  )}

                  {history.content && (
                    <View>
                      <TextCustom style={styles.timelineText}>
                        Notes:
                      </TextCustom>
                      <TextCustom style={styles.issueText}>
                        {history.content}
                      </TextCustom>
                    </View>
                  )}

                  {/* nếu có hình ảnh -> nút detail */}
                  {/* {history.plantResources &&
                    history.plantResources.length > 0 && (
                      <TouchableOpacity
                        style={styles.detailButton}
                        onPress={() => showDetailModal(history)}
                      >
                        <TextCustom style={styles.detailButtonText}>
                          View Details
                        </TextCustom>
                      </TouchableOpacity>
                    )} */}
                </View>
              </View>
            </View>
          ))
        ) : (
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
        )}
      </ScrollView>

      {/* <NoteDetailModal
        visible={modalVisible}
        history={selectedHistory}
        onClose={() => setModalVisible(false)}
      /> */}
    </View>
  );
};

export default GrowthHistoryTab;
