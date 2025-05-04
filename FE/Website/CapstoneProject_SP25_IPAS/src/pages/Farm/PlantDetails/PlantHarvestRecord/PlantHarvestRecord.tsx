import {
  ActionMenuRecord,
  ConfirmModal,
  LoadingSkeleton,
  NewRecordModal,
  PlantSectionHeader,
  TimelineFilter,
  UpdateProductHarvestModal,
  UserAvatar,
} from "@/components";
import { Divider, Empty, Flex, InputNumber, Select, Typography } from "antd";
import style from "./PlantHarvestRecord.module.scss";
import { useEffect, useState } from "react";
import { Dayjs } from "dayjs";
import { formatDate, formatDayMonthAndTime } from "@/utils";
import { CreateHarvestRecordRequest, GetPlantRecord, UpdateProductHarvestRequest } from "@/payloads";
import {
  DEFAULT_RECORDS_IN_DETAIL,
  MASTER_TYPE,
  SYSTEM_CONFIG_GROUP,
  SYSTEM_CONFIG_KEY,
} from "@/constants";
import { usePlantStore } from "@/stores";
import { harvestService, plantService } from "@/services";
import {
  useMasterTypeOptions,
  useModal,
  useModifyPermission,
  useSystemConfigOptions,
} from "@/hooks";
import { toast } from "react-toastify";

const { Text } = Typography;

function PlantHarvestRecord() {
  const { plant } = usePlantStore();
  if (!plant) return;
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const { options: productOptions } = useMasterTypeOptions(MASTER_TYPE.PRODUCT);
  const [productFilter, setProductFilter] = useState<number>();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [quantityRange, setQuantityRange] = useState<[number | null, number | null]>([null, null]);
  const visibleCount = DEFAULT_RECORDS_IN_DETAIL;
  const [data, setData] = useState<GetPlantRecord[]>([]);
  const [totalIssues, setTotalIssues] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const deleteConfirmModal = useModal<{ id: number }>();
  const newRecordModal = useModal();
  const formModal = useModal<{ id: number; quantity: number }>();
  const { options, loading } = useSystemConfigOptions(
    SYSTEM_CONFIG_GROUP.VALIDATION_VARIABLE,
    SYSTEM_CONFIG_KEY.RECORD_AFTER_DATE,
    true,
  );

  const limitDays = parseInt(String(options?.[0]?.label || "0"), 10);

  const fetchData = async () => {
    if (isFirstLoad || isLoading) await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const res = await plantService.getPlantRecordHarvest(
        plant.plantId,
        visibleCount,
        currentPage,
        dateRange?.[0]?.format("YYYY-MM-DD"),
        dateRange?.[1]?.format("YYYY-MM-DD"),
        productFilter,
        quantityRange[0],
        quantityRange[1],
      );
      if (res.statusCode === 200) {
        setData((prevData) => (currentPage > 1 ? [...prevData, ...res.data.list] : res.data.list));
        setTotalIssues(res.data.totalRecord);
      }
    } finally {
      setIsLoading(false);
      setIsFirstLoad(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, dateRange, productFilter, isLoading]);

  const handleResetData = async () => {
    setData([]);
    setIsLoading(true);
    setCurrentPage(1);
  };

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates && dates[0] && dates[1] ? [dates[0], dates[1]] : null);
    handleResetData();
  };

  const handleProductChange = (value: number) => {
    setProductFilter(value);
    handleResetData();
  };

  const handleQuantityChange = (values: [number | null, number | null]) => {
    setQuantityRange(values);
    if (values[0] !== null && values[1] !== null && values[0] <= values[1]) {
      handleResetData();
    }
  };

  const handleDelete = async () => {
    const id = deleteConfirmModal.modalState.data?.id;
    if (!id) return;
    try {
      var result = await harvestService.deleteRecordHarvest(id);
      if (result.statusCode === 200) {
        toast.success(result.message);
        await handleResetData();
      } else {
        toast.warning(result.message);
      }
    } finally {
      deleteConfirmModal.hideModal();
    }
  };

  const handleUpdateProductHarvest = async (values: UpdateProductHarvestRequest) => {
    const res = await harvestService.updateProductHarvest(values);
    if (res.statusCode === 200) {
      toast.success(res.message);
      formModal.hideModal();
      await handleResetData();
    } else {
      toast.warning(res.message);
    }
  };

  const handleCreatePlantHarvestRecord = async (values: CreateHarvestRecordRequest) => {
    const res = await plantService.createPlantHarvestRecord(values);
    if (res.statusCode === 200) {
      toast.success(res.message);
      newRecordModal.hideModal();
      await handleResetData();
    } else {
      toast.warning(res.message);
    }
  };

  if (isFirstLoad) return <LoadingSkeleton rows={10} />;
  return (
    <Flex className={style.contentDetailWrapper}>
      <PlantSectionHeader onAddNewRecord={newRecordModal.showModal} />
      <Divider className={style.divider} />
      <Flex className={style.contentSectionBody} vertical>
        <Flex gap={20}>
          <TimelineFilter dateRange={dateRange} onDateChange={handleDateChange} />
          <Select
            placeholder="Select Product"
            value={productFilter}
            onChange={handleProductChange}
            allowClear
            style={{ width: 150 }}
            options={productOptions}
          />

          <Flex gap={10} align="center">
            <Text>Yield:</Text>
            <InputNumber
              placeholder="From"
              value={quantityRange[0]}
              onChange={(value) => handleQuantityChange([value, quantityRange[1]])}
              min={0}
              style={{ width: 100 }}
            />
            <Text>-</Text>
            <InputNumber
              placeholder="To"
              value={quantityRange[1]}
              onChange={(value) => handleQuantityChange([quantityRange[0], value])}
              min={0}
              style={{ width: 100 }}
            />
          </Flex>
        </Flex>

        <Flex className={style.historyTimeline}>
          {isLoading ? (
            <LoadingSkeleton rows={5} />
          ) : data.length === 0 ? (
            <Flex justify="center" align="center" style={{ width: "100%" }}>
              <Empty description="No Record Data Available" />
            </Flex>
          ) : (
            data.map((record, index) => {
              const { canEdit, isEmployee } = useModifyPermission(
                record.recordDate,
                record.userID,
                limitDays,
                loading,
              );
              return (
                <>
                  <Flex key={index} className={style.historyContainer}>
                    <Flex className={style.historyWrapper}>
                      <div className={style.historyDot} />
                      <div className={style.historyDash} />
                    </Flex>
                    <div className={style.timelineDetail}>
                      <Flex gap={10} align="center">
                        <UserAvatar avatarURL={record?.avartarRecord} size={30} />
                        <span className={style.userName}>{record.recordBy}</span>
                        <span>recorded a harvest</span>
                        <span className={style.createdDate}>
                          {formatDayMonthAndTime(record.recordDate)}
                        </span>
                      </Flex>
                      <Flex className={style.infoRow}>
                        <span className={style.label}>Crop Name:</span>
                        <span className={style.noteContent}>{record.cropName}</span>
                      </Flex>
                      <Flex className={style.infoRow}>
                        <span className={style.label}>Harvest Date:</span>
                        <span className={style.noteContent}>{formatDate(record.harvestDate)}</span>
                      </Flex>
                      <Flex className={style.infoRow}>
                        <span className={style.label}>Product Name:</span>
                        <span className={style.noteContent}>{record.productName}</span>
                      </Flex>
                      <Flex justify="space-between">
                        <Flex className={style.infoRow}>
                          <span className={style.label}>Yield:</span>
                          <span className={style.noteContent}>
                            {record.actualQuantity} {record.unit}
                          </span>
                        </Flex>
                        {canEdit && !plant.isDead && (
                          <ActionMenuRecord
                            onEdit={() =>
                              formModal.showModal({
                                id: record.productHarvestHistoryId,
                                quantity: record.actualQuantity,
                              })
                            }
                            {...(!isEmployee && {
                              onDelete: () =>
                                deleteConfirmModal.showModal({
                                  id: record.productHarvestHistoryId,
                                }),
                            })}
                          />
                        )}
                      </Flex>
                    </div>
                  </Flex>
                  {index < data.length - 1 && <Divider className={style.dividerBold} />}
                </>
              );
            })
          )}
        </Flex>

        {/* Load More Button */}
        {data.length !== totalIssues && (
          <Flex justify="center" className={style.loadMoreWrapper}>
            <span onClick={() => setCurrentPage((prev) => prev + 1)}>Load More</span>
          </Flex>
        )}
      </Flex>
      <NewRecordModal
        isOpen={newRecordModal.modalState.visible}
        onClose={newRecordModal.hideModal}
        onSave={handleCreatePlantHarvestRecord}
        isLoadingAction={false}
      />
      <UpdateProductHarvestModal
        isPlant
        isOpen={formModal.modalState.visible}
        onClose={formModal.hideModal}
        onSave={(value) => handleUpdateProductHarvest(value)}
        quantity={formModal.modalState.data?.quantity}
        productHarvestId={formModal.modalState.data?.id}
        isLoadingAction={false}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={handleDelete}
        onCancel={deleteConfirmModal.hideModal}
        itemName="Record"
        actionType="delete"
      />
    </Flex>
  );
}
export default PlantHarvestRecord;
