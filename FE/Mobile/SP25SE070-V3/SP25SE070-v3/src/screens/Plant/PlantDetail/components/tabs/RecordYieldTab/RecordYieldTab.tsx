import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { PlantDetailData } from '@/types/plant';
import { HarvestRecord, CreateHarvestRecordRequest } from '@/types/harvest';
import CustomIcon from 'components/CustomIcon';
import TextCustom from 'components/TextCustom';
import Toast from 'react-native-toast-message';
import DateRangePicker from '../../DateRangePicker';
import TimelineItem from '../../TimelineItem';
import AddRecordModal from '../../AddRecordModal';
import ConfirmModal from '../../ConfirmModal';
import { styles } from './RecordYieldTab.styles';

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

    const masterTypeOptions = [
        { id: 32, name: 'Grade 3' },
        { id: 33, name: 'Grade 2' },
        { id: 34, name: 'Grade 1' },
    ];

    const harvestHistoryOptions = [
        { id: 7, code: 'HH007' },
        { id: 8, code: 'HH008' },
        { id: 9, code: 'HH009' },
    ];

    const fetchRecords = useCallback(async (pageNum: number, reset: boolean = false) => {
        setLoading(true);
        try {
            const response = await mockFetchRecords(pageNum, startDate, endDate);
            const newRecords = response.data.map((record) => ({
                ...record,
                recordDate: new Date().toISOString(),
            }));

            setRecords((prev) => (reset ? newRecords : [...prev, ...newRecords]));
            setTotalPage(response.totalPage);
            setPage(pageNum);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to load records.',
            });
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

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
                await mockCreateRecord(pendingRecord);
                Toast.show({
                    type: 'success',
                    text1: 'Success',
                    text2: 'Record created successfully.',
                });
                setPage(1);
                fetchRecords(1, true);
            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to create record.',
                });
            }
        }
        setConfirmModalVisible(false);
        setPendingRecord(null);
    };

    // nhóm records theo ngày
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

        return grouped;
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
                <CustomIcon name="plus" size={24} color="white" type="MaterialCommunityIcons" />
            </TouchableOpacity>
            
            {/* timeline */}
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
                                />
                            ))}
                        </View>
                    </View>
                )}
                onEndReached={loadMore}
                onEndReachedThreshold={0.1}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <CustomIcon name="text" size={40} color="#ccc" type="MaterialCommunityIcons" />
                        <TextCustom style={styles.emptyText}>No yield records found</TextCustom>
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
                masterTypeOptions={masterTypeOptions}
                harvestHistoryOptions={harvestHistoryOptions}
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

// fake
const mockFetchRecords = async (page: number, startDate: Date | null, endDate: Date | null) => {
    const mockData: HarvestRecord[] = page === 1
        ? [
            {
                productHarvestHistoryId: 39,
                plantId: 1,
                plantName: "Green Skin Pomelo A",
                unit: "kg",
                actualQuantity: 80,
                harvestHistoryId: 7,
                harvestHistoryCode: "HH007",
                harvestDate: "2024-09-01T00:00:00",
                masterTypeId: 32,
                productName: "Grade 3",
                cropName: "Pomelo",
                recordDate: new Date().toISOString(),
            },
            {
                productHarvestHistoryId: 40,
                plantId: 2,
                plantName: "Green Skin Pomelo A",
                unit: "kg",
                actualQuantity: 90,
                harvestHistoryId: 8,
                harvestHistoryCode: "HH008",
                harvestDate: "2024-09-02T00:00:00",
                masterTypeId: 32,
                productName: "Grade 3",
                cropName: "Pomelo",
                recordDate: new Date().toISOString(),
            },
        ]
        : [
            {
                productHarvestHistoryId: 41,
                plantId: 3,
                plantName: "Green Skin Pomelo B",
                unit: "kg",
                actualQuantity: 100,
                harvestHistoryId: 9,
                harvestHistoryCode: "HH009",
                harvestDate: "2024-09-03T00:00:00",
                masterTypeId: 33,
                productName: "Grade 2",
                cropName: "Pomelo",
                recordDate: new Date().toISOString(),
            },
        ];

    return {
        data: mockData,
        totalPage: 2,
        totalRecord: 3,
    };
};

const mockCreateRecord = async (data: CreateHarvestRecordRequest) => {
    return Promise.resolve();
};



export default RecordYieldTab;