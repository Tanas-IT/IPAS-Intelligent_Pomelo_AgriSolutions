import style from "./PlantGrowthHistory.module.scss";
import { Avatar, Divider, Empty, Flex } from "antd";
import { Icons, Images } from "@/assets";
import {
  ConfirmModal,
  CustomButton,
  LoadingSkeleton,
  NewIssueModal,
  PlantSectionHeader,
  TimelineFilter,
} from "@/components";
import { PlantGrowthDetail } from "@/pages";
import { useEffect, useState } from "react";
import { formatDayMonthAndTime } from "@/utils";
import { Dayjs } from "dayjs";
import { useDirtyStore, usePlantStore } from "@/stores";
import { plantService } from "@/services";
import { GetPlantGrowthHistory, PlantGrowthHistoryRequest } from "@/payloads";
import { useHasChanges, useModal, useTableAdd } from "@/hooks";
import { toast } from "react-toastify";
import { LOCAL_STORAGE_KEYS } from "@/constants";

interface PlantGrowthHistoryProps {
  activeTab: string;
}

function PlantGrowthHistory({ activeTab }: PlantGrowthHistoryProps) {
  const { plant } = usePlantStore();
  const { isDirty } = useDirtyStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const visibleCount = 3;
  const [data, setData] = useState<GetPlantGrowthHistory[]>([]);
  const [totalIssues, setTotalIssues] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailView, setIsDetailView] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<GetPlantGrowthHistory | null>(null);
  const addIssueModal = useModal<GetPlantGrowthHistory>();
  const cancelConfirmModal = useModal();
  const deleteConfirmModal = useModal<{ id: number }>();

  if (!plant) return;

  useEffect(() => {
    setIsDetailView(false);
  }, [activeTab]);

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
  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleDelete = async () => {
    const id = deleteConfirmModal.modalState.data?.id;
    if (!id) return;
    try {
      var result = await plantService.deletePlantGrowthHistory(id);
      if (result.statusCode === 200) {
        toast.success(result.message);
        await handleResetData();
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
      noteTaker: localStorage.getItem(LOCAL_STORAGE_KEYS.FULL_NAME) ?? "",
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
      setIsDetailView(false);
    },
  });

  const handleViewDetail = (item: GetPlantGrowthHistory) => {
    setSelectedHistory(item);
    setIsDetailView(true);
  };

  const handleBackToList = () => {
    setIsDetailView(false);
    setSelectedHistory(null);
  };

  if (isFirstLoad) return <LoadingSkeleton rows={10} />;

  return (
    <Flex className={style.contentDetailWrapper}>
      <PlantSectionHeader onAddNewIssue={() => addIssueModal.showModal()} />
      <Divider className={style.divider} />
      {isDetailView ? (
        <PlantGrowthDetail history={selectedHistory} onBack={handleBackToList} />
      ) : (
        <>
          <Flex className={style.contentSectionBody} vertical>
            <TimelineFilter dateRange={dateRange} onDateChange={handleDateChange} />
            {/* 📌 Timeline Issue */}
            <Flex className={style.historyTimeline}>
              {isLoading ? (
                <LoadingSkeleton rows={5} />
              ) : data.length === 0 ? (
                <Flex justify="center" align="center" style={{ width: "100%" }}>
                  <Empty description="No Growth History Data Available" />
                </Flex>
              ) : (
                data.map((item, index) => (
                  <>
                    <Flex
                      key={index}
                      className={style.historyContainer}
                      onClick={() => handleViewDetail(item)}
                    >
                      <Flex className={style.historyWrapper}>
                        <div className={style.historyDot} />
                        <div className={style.historyDash} />
                      </Flex>
                      <div className={style.timelineDetail}>
                        <Flex gap={10} align="center">
                          <Avatar src={Images.avatar} size={30} shape="circle" />
                          <span className={style.userName}>{item.noteTaker}</span>
                          <span>created this note</span>
                          <span className={style.createdDate}>
                            {formatDayMonthAndTime(item.createDate)}
                          </span>
                        </Flex>
                        <Flex className={style.infoRow}>
                          <span className={style.label}>Issue:</span>
                          <span className={style.noteContent}>{item.issueName}</span>
                        </Flex>
                        <Flex className={style.infoRow}>
                          <span className={style.label}>Note:</span>
                          <span className={style.noteContent}>{item.content}</span>
                        </Flex>
                        <Flex justify="space-between">
                          <Flex className={style.infoRow}>
                            <span className={style.label}>Media:</span>
                            <span>
                              {item.numberImage} Images | {item.numberVideos} Videos
                            </span>
                          </Flex>
                          <Icons.delete
                            className={style.iconEdit}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteConfirmModal.showModal({ id: item.plantGrowthHistoryId });
                            }}
                          />
                        </Flex>
                      </div>
                    </Flex>
                    {index < data.length - 1 && <Divider className={style.dividerBold} />}
                  </>
                ))
              )}
            </Flex>
            {/* Load More Button */}
            {data.length != totalIssues && (
              <Flex justify="center" className={style.loadMoreWrapper}>
                <span onClick={handleLoadMore}>Load More</span>
              </Flex>
            )}
          </Flex>
        </>
      )}
      <NewIssueModal
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
