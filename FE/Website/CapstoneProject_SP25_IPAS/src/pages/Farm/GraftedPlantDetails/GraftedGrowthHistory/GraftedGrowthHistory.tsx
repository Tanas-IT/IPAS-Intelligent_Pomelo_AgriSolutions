import style from "./GraftedGrowthHistory.module.scss";
import { Divider, Flex } from "antd";
import {
  ActionMenuGrowth,
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
import {
  useHasChanges,
  useModal,
  useSystemConfigOptions,
  useTableAdd,
  useTableUpdate,
} from "@/hooks";
import { toast } from "react-toastify";
import {
  DEFAULT_RECORDS_IN_DETAIL,
  GRAFTED_STATUS,
  SYSTEM_CONFIG_GROUP,
  SYSTEM_CONFIG_KEY,
} from "@/constants";

function GraftedGrowthHistory() {
  const { graftedPlant, isGrowthDetailView, setIsGrowthDetailView } = useGraftedPlantStore();
  if (!graftedPlant) return;
  const { isDirty } = useDirtyStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const visibleCount = DEFAULT_RECORDS_IN_DETAIL;
  const [data, setData] = useState<GetGraftedGrowthHistory[]>([]);
  const [totalIssues, setTotalIssues] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedHistory, setSelectedHistory] = useState<GetGraftedGrowthHistory | null>(null);
  const issueModal = useModal<{ item: GetGraftedGrowthHistory }>();
  const cancelConfirmModal = useModal();
  const deleteConfirmModal = useModal<{ id: number }>();
  const canAddNote = !graftedPlant.isDead && graftedPlant.status !== GRAFTED_STATUS.USED;
  const { options, loading } = useSystemConfigOptions(
    SYSTEM_CONFIG_GROUP.VALIDATION_VARIABLE,
    SYSTEM_CONFIG_KEY.EDIT_IN_DAY,
    true,
  );
  const limitDays = parseInt(String(options?.[0]?.label || "0"), 10);

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
        if (isGrowthDetailView && selectedHistory) {
          const updatedHistory = res.data.list.find(
            (item) => item.graftedPlantNoteId === selectedHistory?.graftedPlantNoteId,
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

  const handleCancelConfirm = (req: GraftedGrowthHistoryRequest, isUpdate: boolean) => {
    const hasUnsavedChanges = isUpdate
      ? hasChanges(req, "graftedPlantNoteId")
      : hasChanges(req, undefined, { graftedPlantId: graftedPlant.graftedPlantId });

    if (hasUnsavedChanges || isDirty) {
      cancelConfirmModal.showModal();
    } else {
      issueModal.hideModal();
    }
  };

  const { handleAdd: handleAddNewIssue, isAdding } = useTableAdd({
    addService: graftedPlantService.createGraftedPlantGrowthHistory,
    fetchData: handleResetData,
    onSuccess: () => {
      issueModal.hideModal();
      setIsGrowthDetailView(false);
    },
  });

  const { handleUpdate: handleUpdateIssue, isUpdating } = useTableUpdate({
    updateService: graftedPlantService.updateGraftedPlantGrowthHistory,
    fetchData: handleResetData,
    onSuccess: () => {
      issueModal.hideModal();
    },
  });

  const handleExport = async () => {
    const { blob, filename } = await graftedPlantService.exportGraftedPlantGrowthHistory(
      graftedPlant.graftedPlantId,
    );

    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement("a"), {
      href: url,
      download: filename,
    });

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

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
      <GraftedPlantSectionHeader
        onAddNewIssue={() => issueModal.showModal()}
        onExport={handleExport}
      />
      <Divider className={style.divider} />
      {isGrowthDetailView ? (
        <GrowthDetailContent
          history={selectedHistory}
          limitDays={limitDays}
          isDisable={!canAddNote}
          isLoading={loading}
          actionMenu={(item: GetGraftedGrowthHistory) => (
            <ActionMenuGrowth
              onEdit={() => issueModal.showModal({ item: item })}
              onDelete={() => deleteConfirmModal.showModal({ id: item.graftedPlantNoteId })}
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
              isDisable={!canAddNote}
              isLoading={isLoading && loading}
              totalIssues={totalIssues}
              onViewDetail={handleViewDetail}
              onLoadMore={() => setCurrentPage((prev) => prev + 1)}
              actionMenu={(item: GetGraftedGrowthHistory) => (
                <ActionMenuGrowth
                  onEdit={() => issueModal.showModal({ item: item })}
                  onDelete={() => deleteConfirmModal.showModal({ id: item.graftedPlantNoteId })}
                />
              )}
            />
          </Flex>
        </>
      )}
      <NewIssueModal
        data={issueModal.modalState.data?.item}
        idKey={issueModal.modalState.data?.item ? "graftedPlantNoteId" : "graftedPlantId"}
        id={
          issueModal.modalState.data?.item
            ? issueModal.modalState.data?.item.graftedPlantNoteId
            : graftedPlant.graftedPlantId
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

export default GraftedGrowthHistory;
