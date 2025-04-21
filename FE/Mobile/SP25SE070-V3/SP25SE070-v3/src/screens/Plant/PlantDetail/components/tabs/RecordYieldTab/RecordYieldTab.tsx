import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, ActivityIndicator, Alert } from "react-native";
import {
  HarvestRecord,
  CreateHarvestRecordRequest,
  AvailableHarvest,
  UpdateHarvestRecordRequest,
} from "@/types/harvest";
import Toast from "react-native-toast-message";
import DateRangePicker from "../../../../../../components/DateRangePicker";
import TimelineItem from "./TimelineItem";
import AddRecordModal from "./AddRecordModal";
import ConfirmModal from "../../ConfirmModal";
import { styles } from "./RecordYieldTab.styles";
import { CustomIcon, FloatingAddButton, TextCustom } from "@/components";
import { PlantService } from "@/services";
import UpdateRecordModal from "./UpdateRecordModal";
import { DEFAULT_RECORDS_IN_DETAIL } from "@/constants";
import { usePlantStore } from "@/store";

const RecordYieldTab: React.FC = () => {
  const [records, setRecords] = useState<HarvestRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HarvestRecord | null>(
    null
  );
  const [pendingRecord, setPendingRecord] =
    useState<CreateHarvestRecordRequest | null>(null);
  const [availableHarvests, setAvailableHarvests] = useState<
    AvailableHarvest[]
  >([]);
  const pageSize = DEFAULT_RECORDS_IN_DETAIL;
  const { plant } = usePlantStore();

  if (!plant) return null;

  useEffect(() => {
    const fetchHarvests = async () => {
      try {
        const response = await PlantService.getAvailableHarvestsForPlant(
          plant.plantId
        );
        setAvailableHarvests(response.data);
      } catch (error) {
        console.error("Fetch available harvests error:", error);
      }
    };
    fetchHarvests();
  }, [plant]);

  const fetchRecords = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      setLoading(true);
      try {
        const dateHarvestFrom = startDate
          ? startDate.toISOString().split("T")[0]
          : undefined;
        const dateHarvestTo = endDate
          ? endDate.toISOString().split("T")[0]
          : undefined;

        const response = await PlantService.getPlantRecordHarvest(
          plant.plantId,
          pageSize,
          pageNum,
          dateHarvestFrom,
          dateHarvestTo
        );

        const newRecords = response.data.list;
        setRecords((prev) => (reset ? newRecords : [...prev, ...newRecords]));
        setTotalPage(response.data.totalPage);
        setPage(pageNum);
      } catch (error: any) {
        console.error("Fetch error:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load records.",
        });
      } finally {
        setLoading(false);
      }
    },
    [plant, startDate, endDate]
  );

  useEffect(() => {
    fetchRecords(1, true);
  }, [fetchRecords]);

  const loadMore = () => {
    if (page < totalPage && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchRecords(nextPage);
    }
  };

  const handleDateFilter = () => {
    setPage(1);
    fetchRecords(1, true);
  };

  const handleSubmitRecord = (data: CreateHarvestRecordRequest) => {
    setPendingRecord(data);
    setModalVisible(false);
    setConfirmModalVisible(true);
  };

  const confirmSubmit = async () => {
    if (pendingRecord) {
      const res = await PlantService.createPlantHarvestRecord(pendingRecord);
      if (res.statusCode === 200) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: res.message,
        });
        setPage(1);
        fetchRecords(1, true);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: res.message,
        });
      }
    }
    setConfirmModalVisible(false);
    setPendingRecord(null);
  };

  const handleUpdate = async (data: UpdateHarvestRecordRequest) => {
    if (data.quantity === selectedRecord?.actualQuantity) return;
    const res = await PlantService.updateProductHarvest(
      data.productHarvestHistoryId,
      data.quantity
    );

    if (res.statusCode === 200) {
      Toast.show({
        type: "success",
        text1: "Success",
        text2: res.message,
      });
      setPage(1);
      fetchRecords(1, true);
      setUpdateModalVisible(false);
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: res.message,
      });
    }
  };

  const handleDelete = async (productHarvestHistoryId: number) => {
    Alert.alert(
      "Confirm deletion",
      "Are you sure you want to delete this record?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            var res = await PlantService.deleteRecordHarvest(
              productHarvestHistoryId
            );
            if (res.statusCode === 200) {
              setRecords((prev) =>
                prev.filter(
                  (record) =>
                    record.productHarvestHistoryId !== productHarvestHistoryId
                )
              );
              Toast.show({
                type: "success",
                text1: "Record Deleted",
                text2: "The record has been successfully deleted.",
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

  const groupRecordsByDate = (records: HarvestRecord[]) => {
    const grouped: { date: string; records: HarvestRecord[] }[] = [];
    const dateMap: { [key: string]: HarvestRecord[] } = {};

    records.forEach((record) => {
      const date = new Date(record.recordDate).toLocaleDateString();
      if (!dateMap[date]) {
        dateMap[date] = [];
      }
      dateMap[date].push(record);
    });

    for (const date in dateMap) {
      const sortedRecords = dateMap[date].sort(
        (a, b) => b.productHarvestHistoryId - a.productHarvestHistoryId
      );
      grouped.push({ date, records: sortedRecords });
    }

    return grouped.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const groupedRecords = groupRecordsByDate(records);

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={(date) => {
            setStartDate(date);
            handleDateFilter();
          }}
          onEndDateChange={(date) => {
            setEndDate(date);
            handleDateFilter();
          }}
        />
      </View>

      {!plant.isDead && (
        <FloatingAddButton onPress={() => setModalVisible(true)} />
      )}

      <FlatList
        data={groupedRecords}
        keyExtractor={(item) => item.date}
        renderItem={({ item, index }) => (
          <View style={styles.dateGroup}>
            <View style={styles.recordsContainer}>
              {item.records.map((record, recordIndex) => (
                <TimelineItem
                  key={record.harvestHistoryCode}
                  index={recordIndex}
                  totalItems={item.records.length}
                  record={record}
                  isDead={plant.isDead}
                  onDelete={handleDelete}
                  onEdit={() => {
                    setSelectedRecord(record);
                    setUpdateModalVisible(true);
                  }}
                />
              ))}
            </View>
          </View>
        )}
        contentContainerStyle={styles.content}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <CustomIcon
              name="text"
              size={40}
              color="#ccc"
              type="MaterialCommunityIcons"
            />
            <TextCustom style={styles.emptyText}>
              No yield records found
            </TextCustom>
          </View>
        }
        ListFooterComponent={
          loading ? <ActivityIndicator size="large" color="#FBBF24" /> : null
        }
      />

      <AddRecordModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
        }}
        onSubmit={handleSubmitRecord}
        plantId={plant.plantId}
      />

      {selectedRecord && (
        <UpdateRecordModal
          visible={updateModalVisible}
          onClose={() => {
            setUpdateModalVisible(false);
            setSelectedRecord(null);
          }}
          onSubmit={handleUpdate}
          record={selectedRecord}
        />
      )}

      <ConfirmModal
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        onConfirm={confirmSubmit}
      />
    </View>
  );
};

export default RecordYieldTab;
