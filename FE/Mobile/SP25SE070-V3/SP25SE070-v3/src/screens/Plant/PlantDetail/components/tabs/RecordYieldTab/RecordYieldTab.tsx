import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { HarvestRecord, CreateHarvestRecordRequest, AvailableHarvest } from "@/types/harvest";
import Toast from "react-native-toast-message";
import DateRangePicker from "../../DateRangePicker";
import TimelineItem from "../../TimelineItem";
import AddRecordModal from "../../AddRecordModal";
import ConfirmModal from "../../ConfirmModal";
import { styles } from "./RecordYieldTab.styles";
import { CustomIcon, TextCustom } from "@/components";
import { PlantDetailData } from "@/types";
import { PlantService } from "@/services";

interface RecordYieldTabProps {
  plant: PlantDetailData;
}

const RecordYieldTab: React.FC<RecordYieldTabProps> = ({ plant }) => {
  const [records, setRecords] = useState<HarvestRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pendingRecord, setPendingRecord] = useState<CreateHarvestRecordRequest | null>(null);
  const [availableHarvests, setAvailableHarvests] = useState<AvailableHarvest[]>([]);

  const pageSize = 3;

  useEffect(() => {
    const fetchHarvests = async () => {
      try {
        const response = await PlantService.getAvailableHarvestsForPlant(plant.plantId);
        setAvailableHarvests(response.data);
      } catch (error) {
        console.error("Fetch available harvests error:", error);
      }
    };
    fetchHarvests();
  }, [plant.plantId]);

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
    [plant.plantId, startDate, endDate]
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
      try {
        const res = await PlantService.createPlantHarvestRecord(pendingRecord);
        if(res.statusCode === 200) {
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Record created successfully.",
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
        
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to create record.",
        });
      }
    }
    setConfirmModalVisible(false);
    setPendingRecord(null);
  };

  const handleDelete = async (productHarvestHistoryId: number) => {
    // try {
    //   await PlantService.deletePlantRecordHarvest(productHarvestHistoryId);
    //   setRecords((prev) =>
    //     prev.filter(
    //       (record) => record.productHarvestHistoryId !== productHarvestHistoryId
    //     )
    //   );
    //   Toast.show({
    //     type: "success",
    //     text1: "Record Deleted",
    //     text2: "The record has been successfully deleted.",
    //   });
    // } catch (error: any) {
    //   console.error("Delete error:", error);
    //   Toast.show({
    //     type: "error",
    //     text1: "Delete Failed",
    //     text2: error.message || "Could not delete the record.",
    //   });
    // }
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
      grouped.push({ date, records: dateMap[date] });
    }

    return grouped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const groupedRecords = groupRecordsByDate(records);

  return (
    <View style={styles.container}>
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

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <CustomIcon
          name="plus"
          size={24}
          color="white"
          type="MaterialCommunityIcons"
        />
      </TouchableOpacity>

      <FlatList
        data={groupedRecords}
        keyExtractor={(item) => item.date}
        renderItem={({ item, index }) => (
          <View style={styles.dateGroup}>
            <View style={styles.timelineLeft}>
              <TextCustom style={styles.dateText}>{item.date}</TextCustom>
            </View>
            <View style={styles.recordsContainer}>
              {item.records.map((record, recordIndex) => (
                <TimelineItem
                  key={record.productHarvestHistoryId}
                  record={record}
                  isLast={recordIndex === item.records.length - 1}
                // onDelete={() => {
                //   Alert.alert(
                //     "Confirm Delete",
                //     "Are you sure you want to delete this record?",
                //     [
                //       {
                //         text: "Cancel",
                //         style: "cancel",
                //       },
                //       {
                //         text: "Delete",
                //         style: "destructive",
                //         onPress: () => handleDelete(record.productHarvestHistoryId),
                //       },
                //     ]
                //   );
                // }}
                />
              ))}
            </View>
          </View>
        )}
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
        onClose={() => setModalVisible(false)}
        onSubmit={handleSubmitRecord}
        plantId={plant.plantId}
      />

      <ConfirmModal
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        onConfirm={confirmSubmit}
      />
    </View>
  );
};

export default RecordYieldTab;