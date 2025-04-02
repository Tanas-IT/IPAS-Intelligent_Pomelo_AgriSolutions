import style from "./PlantGrowthHistory.module.scss";
import { Divider, Flex } from "antd";
import {
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
import { useHasChanges, useModal, useTableAdd } from "@/hooks";
import { toast } from "react-toastify";
import { DEFAULT_RECORDS_IN_DETAIL } from "@/constants";

function PlantGrowthHistory() {
  const { plant, isGrowthDetailView, setIsGrowthDetailView } = usePlantStore();
  const { isDirty } = useDirtyStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const visibleCount = DEFAULT_RECORDS_IN_DETAIL;
  const [data, setData] = useState<GetPlantGrowthHistory[]>([]);
  const [totalIssues, setTotalIssues] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHistory, setSelectedHistory] = useState<GetPlantGrowthHistory | null>(null);
  const addIssueModal = useModal<GetPlantGrowthHistory>();
  const cancelConfirmModal = useModal();
  const deleteConfirmModal = useModal<{ id: number }>();

  if (!plant) return;

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

  const handleCancelConfirm = (req: PlantGrowthHistoryRequest) => {
    const hasUnsavedChanges = hasChanges(req, undefined, {
      plantId: plant.plantId,
    });

    if (hasUnsavedChanges || isDirty) {
      cancelConfirmModal.showModal();
    } else {
      addIssueModal.hideModal();
    }
  };

  const { handleAdd: handleAddNewIssue, isAdding } = useTableAdd({
    addService: plantService.createPlantGrowthHistory,
    fetchData: handleResetData,
    onSuccess: () => {
      addIssueModal.hideModal();
      setIsGrowthDetailView(false);
    },
  });

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
      <PlantSectionHeader onAddNewIssue={() => addIssueModal.showModal()} />
      <Divider className={style.divider} />
      {isGrowthDetailView ? (
        <GrowthDetailContent
          history={selectedHistory}
          idKey="plantGrowthHistoryId"
          onBack={handleBackToList}
          onDelete={(id) => deleteConfirmModal.showModal({ id })}
        />
      ) : (
        <>
          <Flex className={style.contentSectionBody} vertical>
            <TimelineFilter dateRange={dateRange} onDateChange={handleDateChange} />
            <GrowthTimeline
              data={data}
              idKey="plantGrowthHistoryId"
              isLoading={isLoading}
              totalIssues={totalIssues}
              onViewDetail={handleViewDetail}
              onLoadMore={() => setCurrentPage((prev) => prev + 1)}
              onDelete={(id) => deleteConfirmModal.showModal({ id })}
            />
          </Flex>
        </>
      )}
      <NewIssueModal
        data={data[0]}
        idKey="plantId"
        isOpen={addIssueModal.modalState.visible}
        onClose={handleCancelConfirm}
        onSave={handleAddNewIssue}
        isLoading={isAdding}
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
          addIssueModal.hideModal();
        }}
        onCancel={cancelConfirmModal.hideModal}
      />
    </Flex>
  );
}

export default PlantGrowthHistory;
