import style from "./GraftedGrowthHistory.module.scss";
import { Divider, Flex } from "antd";
import {
  ConfirmModal,
  GraftedPlantSectionHeader,
  GrowthDetailContent,
  GrowthTimeline,
  LoadingSkeleton,
  NewIssueModal,
  TimelineFilter,
} from "@/components";
import { useEffect, useState } from "react";
import { Dayjs } from "dayjs";
import { useDirtyStore, useGraftedPlantStore } from "@/stores";
import { graftedPlantService } from "@/services";
import { GetGraftedGrowthHistory, GraftedGrowthHistoryRequest } from "@/payloads";
import { useHasChanges, useModal, useTableAdd } from "@/hooks";
import { toast } from "react-toastify";
import { DEFAULT_RECORDS_IN_DETAIL } from "@/constants";

function GraftedGrowthHistory() {
  const { graftedPlant, isGrowthDetailView, setIsGrowthDetailView } = useGraftedPlantStore();
  const { isDirty } = useDirtyStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const visibleCount = DEFAULT_RECORDS_IN_DETAIL;
  const [data, setData] = useState<GetGraftedGrowthHistory[]>([]);
  const [totalIssues, setTotalIssues] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHistory, setSelectedHistory] = useState<GetGraftedGrowthHistory | null>(null);
  const addIssueModal = useModal<GetGraftedGrowthHistory>();
  const cancelConfirmModal = useModal();
  const deleteConfirmModal = useModal<{ id: number }>();

  if (!graftedPlant) return;

  const fetchData = async () => {
    if (isFirstLoad || isLoading) await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const res = await graftedPlantService.getGraftedPlantGrowthHistory(
        graftedPlant.graftedPlantId,
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
      var result = await graftedPlantService.deleteGraftedPlantGrowthHistory(id);
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

  const hasChanges = useHasChanges<GraftedGrowthHistoryRequest>(data);

  const handleCancelConfirm = (req: GraftedGrowthHistoryRequest) => {
    const hasUnsavedChanges = hasChanges(req, undefined, {
      graftedPlantId: graftedPlant.graftedPlantId,
    });

    if (hasUnsavedChanges || isDirty) {
      cancelConfirmModal.showModal();
    } else {
      addIssueModal.hideModal();
    }
  };

  const { handleAdd: handleAddNewIssue, isAdding } = useTableAdd({
    addService: graftedPlantService.createGraftedPlantGrowthHistory,
    fetchData: handleResetData,
    onSuccess: () => {
      addIssueModal.hideModal();
      setIsGrowthDetailView(false);
    },
  });

  const handleViewDetail = (item: GetGraftedGrowthHistory) => {
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
      <GraftedPlantSectionHeader onAddNewIssue={() => addIssueModal.showModal()} />
      <Divider className={style.divider} />
      {isGrowthDetailView ? (
        <GrowthDetailContent
          history={selectedHistory}
          idKey="graftedPlantNoteId"
          onBack={handleBackToList}
          onDelete={(id) => deleteConfirmModal.showModal({ id })}
        />
      ) : (
        <>
          <Flex className={style.contentSectionBody} vertical>
            <TimelineFilter dateRange={dateRange} onDateChange={handleDateChange} />
            <GrowthTimeline
              data={data}
              idKey="graftedPlantNoteId"
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
        idKey="graftedPlantId"
        id={graftedPlant.graftedPlantId}
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

export default GraftedGrowthHistory;
