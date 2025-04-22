import style from "./PlantGrowthHistory.module.scss";
import { Divider, Flex } from "antd";
import {
  ActionMenuGrowth,
  ConfirmModal,
  GrowthDetailContent,
  GrowthTimeline,
  LoadingSkeleton,
  NewIssueModal,
  PlantSectionHeader,
  TimelineFilter,
} from "@/components";
import { useEffect, useState } from "react";
import { Dayjs } from "dayjs";
import { useDirtyStore, usePlantStore } from "@/stores";
import { plantService } from "@/services";
import { GetPlantGrowthHistory, PlantGrowthHistoryRequest } from "@/payloads";
import {
  useExportFile,
  useHasChanges,
  useModal,
  useSystemConfigOptions,
  useTableAdd,
  useTableUpdate,
} from "@/hooks";
import { toast } from "react-toastify";
import { DEFAULT_RECORDS_IN_DETAIL, SYSTEM_CONFIG_GROUP, SYSTEM_CONFIG_KEY } from "@/constants";

function PlantGrowthHistory() {
  const { plant, isGrowthDetailView, setIsGrowthDetailView } = usePlantStore();
  if (!plant) return;
  const { isDirty } = useDirtyStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const visibleCount = DEFAULT_RECORDS_IN_DETAIL;
  const [data, setData] = useState<GetPlantGrowthHistory[]>([]);
  const [totalIssues, setTotalIssues] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHistory, setSelectedHistory] = useState<GetPlantGrowthHistory | null>(null);
  const issueModal = useModal<{ item: GetPlantGrowthHistory }>();
  const cancelConfirmModal = useModal();
  const deleteConfirmModal = useModal<{ id: number }>();
  const { options, loading } = useSystemConfigOptions(
    SYSTEM_CONFIG_GROUP.VALIDATION_VARIABLE,
    SYSTEM_CONFIG_KEY.EDIT_IN_DAY,
    true,
  );
  const limitDays = parseInt(String(options?.[0]?.label || "0"), 10);

  const fetchData = async () => {
    if (isFirstLoad || isLoading) await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const res = await plantService.getPlantGrowthHistory(
        plant.plantId,
        visibleCount,
        currentPage,
        dateRange?.[0]?.format("YYYY-MM-DD"),
        dateRange?.[1]?.format("YYYY-MM-DD"),
      );
      if (res.statusCode === 200) {
        setData((prevData) => (currentPage > 1 ? [...prevData, ...res.data.list] : res.data.list));
        setTotalIssues(res.data.totalRecord);
        if (isGrowthDetailView && selectedHistory) {
          const updatedHistory = res.data.list.find(
            (item) => item.plantGrowthHistoryId === selectedHistory?.plantGrowthHistoryId,
          );
          if (updatedHistory) setSelectedHistory(updatedHistory);
        }
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

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates && dates[0] && dates[1] ? [dates[0], dates[1]] : null);
    handleResetData();
  };

  const handleDelete = async () => {
    const id = deleteConfirmModal.modalState.data?.id;
    if (!id) return;
    try {
      var result = await plantService.deletePlantGrowthHistory(id);
      if (result.statusCode === 200) {
        toast.success(result.message);
        await handleResetData();
        if (isGrowthDetailView) setIsGrowthDetailView(false);
      } else {
        toast.error(result.message);
      }
    } finally {
      deleteConfirmModal.hideModal();
    }
  };

  const hasChanges = useHasChanges<PlantGrowthHistoryRequest>(data);

  const handleCancelConfirm = (req: PlantGrowthHistoryRequest, isUpdate: boolean) => {
    const hasUnsavedChanges = isUpdate
      ? hasChanges(req, "plantGrowthHistoryId")
      : hasChanges(req, undefined, { plantId: plant.plantId });

    if (hasUnsavedChanges || isDirty) {
      cancelConfirmModal.showModal();
    } else {
      issueModal.hideModal();
    }
  };

  const { handleAdd: handleAddNewIssue, isAdding } = useTableAdd({
    addService: plantService.createPlantGrowthHistory,
    fetchData: handleResetData,
    onSuccess: () => {
      issueModal.hideModal();
      setIsGrowthDetailView(false);
    },
  });

  const { handleUpdate: handleUpdateIssue, isUpdating } = useTableUpdate({
    updateService: plantService.updatePlantGrowthHistory,
    fetchData: handleResetData,
    onSuccess: () => {
      issueModal.hideModal();
    },
  });

  const useHandleExport = useExportFile(plantService.exportPlantGrowthHistory);
  const handleExport = () => useHandleExport(plant.plantId);

  const handleViewDetail = (item: GetPlantGrowthHistory) => {
    setSelectedHistory(item);
    setIsGrowthDetailView(true);
  };

  const handleBackToList = () => {
    setIsGrowthDetailView(false);
    setSelectedHistory(null);
  };

  if (isFirstLoad) return <LoadingSkeleton rows={10} />;

  return (
    <Flex className={style.contentDetailWrapper}>
      <PlantSectionHeader onAddNewIssue={() => issueModal.showModal()} onExport={handleExport} />
      <Divider className={style.divider} />
      {isGrowthDetailView ? (
        <GrowthDetailContent
          history={selectedHistory}
          limitDays={limitDays}
          isDisable={plant.isDead}
          isLoading={loading}
          actionMenu={(item: GetPlantGrowthHistory) => (
            <ActionMenuGrowth
              onEdit={() => issueModal.showModal({ item: item })}
              onDelete={() => deleteConfirmModal.showModal({ id: item.plantGrowthHistoryId })}
            />
          )}
        />
      ) : (
        <>
          <Flex className={style.contentSectionBody} vertical>
            <TimelineFilter dateRange={dateRange} onDateChange={handleDateChange} />
            <GrowthTimeline
              data={data}
              limitDays={limitDays}
              isDisable={plant.isDead}
              isLoading={isLoading && loading}
              totalIssues={totalIssues}
              onViewDetail={handleViewDetail}
              onLoadMore={() => setCurrentPage((prev) => prev + 1)}
              actionMenu={(item: GetPlantGrowthHistory) => (
                <ActionMenuGrowth
                  onEdit={() => issueModal.showModal({ item: item })}
                  onDelete={() => deleteConfirmModal.showModal({ id: item.plantGrowthHistoryId })}
                />
              )}
            />
          </Flex>
        </>
      )}
      <NewIssueModal
        data={issueModal.modalState.data?.item}
        idKey={issueModal.modalState.data?.item ? "plantGrowthHistoryId" : "plantId"}
        id={
          issueModal.modalState.data?.item
            ? issueModal.modalState.data?.item.plantGrowthHistoryId
            : plant.plantId
        }
        isOpen={issueModal.modalState.visible}
        onClose={handleCancelConfirm}
        onSave={issueModal.modalState.data?.item ? handleUpdateIssue : handleAddNewIssue}
        isLoading={issueModal.modalState.data?.item ? isUpdating : isAdding}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={handleDelete}
        onCancel={deleteConfirmModal.hideModal}
        itemName="Note"
        actionType="delete"
      />
      {/* Confirm Cancel Modal */}
      <ConfirmModal
        visible={cancelConfirmModal.modalState.visible}
        actionType="unsaved"
        onConfirm={() => {
          cancelConfirmModal.hideModal();
          issueModal.hideModal();
        }}
        onCancel={cancelConfirmModal.hideModal}
      />
    </Flex>
  );
}

export default PlantGrowthHistory;
