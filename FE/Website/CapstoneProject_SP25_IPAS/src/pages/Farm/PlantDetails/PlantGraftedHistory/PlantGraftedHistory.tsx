import { useEffect, useState } from "react";
import { Flex, Table, Divider, Empty } from "antd";
import { ConfirmModal, LoadingSkeleton, PlantSectionHeader, TimelineFilter } from "@/components";
import style from "./PlantGraftedHistory.module.scss";
import { graftedPlantService } from "@/services";
import { useDirtyStore, usePlantStore } from "@/stores";
import { CreateGraftedPlantsRequest, GetGraftedPlantHistory } from "@/payloads";
import { Dayjs } from "dayjs";
import { columns } from "./columns";
import { useModal } from "@/hooks";
import CreateGraftedModal from "./CreateGraftedModal";
import { toast } from "react-toastify";

function PlantGraftedHistory() {
  const { plant } = usePlantStore();
  const { isDirty } = useDirtyStore();
  const [data, setData] = useState<GetGraftedPlantHistory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const createGraftedModal = useModal();
  const cancelConfirmModal = useModal();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const pageSize = 5;
  if (!plant) return;

  const fetchData = async () => {
    setIsLoading(true);
    if (isFirstLoad) await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const res = await graftedPlantService.getGraftedPlantHistory(
        plant.plantId,
        currentPage,
        dateRange?.[0]?.format("YYYY-MM-DD"),
        dateRange?.[1]?.format("YYYY-MM-DD"),
      );
      if (res.statusCode === 200) {
        setData(res.data.list);
        setTotalPage(res.data.totalPage);
      }
    } catch (error) {
      console.error("Failed to fetch grafted plant history:", error);
    } finally {
      setIsLoading(false);
      setIsFirstLoad(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, dateRange]);

  const handleClose = () => {
    if (isDirty) {
      cancelConfirmModal.showModal();
    } else {
      createGraftedModal.hideModal();
    }
  };

  const onCreateGraftedBranch = async (value: CreateGraftedPlantsRequest) => {
    setIsLoading(true);
    try {
      const res = await graftedPlantService.createGraftedPlants(value);

      if (res.statusCode === 200) {
        toast.success(res.message);
        await fetchData();
        createGraftedModal.hideModal();
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0], dates[1]] as [Dayjs, Dayjs]); // ✅ Đảm bảo đúng kiểu
    } else {
      setDateRange(null);
    }
    setCurrentPage(1);
  };

  if (isFirstLoad) return <LoadingSkeleton rows={10} />;

  return (
    <Flex className={style.contentDetailWrapper}>
      <PlantSectionHeader onCreateGraftedBranch={() => createGraftedModal.showModal()} />
      <Divider className={style.divider} />
      <Flex className={style.contentSectionBody} vertical>
        <TimelineFilter dateRange={dateRange} onDateChange={handleDateChange} />

        {data.length > 0 ? (
          <div className={style.tableWrapper}>
            <Table
              className={style.table}
              columns={columns}
              dataSource={data}
              rowKey="id"
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: totalPage,
                onChange: (page) => setCurrentPage(page),
              }}
              bordered
            />
          </div>
        ) : (
          <Flex justify="center" align="center" style={{ width: "100%" }}>
            <Empty description="No Grafted Data Available" />
          </Flex>
        )}
      </Flex>
      <CreateGraftedModal
        plantId={plant.plantId}
        isOpen={createGraftedModal.modalState.visible}
        onClose={handleClose}
        onSave={onCreateGraftedBranch}
        isLoadingAction={isLoading}
      />
      {/* Confirm Cancel Modal */}
      <ConfirmModal
        visible={cancelConfirmModal.modalState.visible}
        actionType="unsaved"
        onConfirm={() => {
          cancelConfirmModal.hideModal();
          createGraftedModal.hideModal();
        }}
        onCancel={cancelConfirmModal.hideModal}
      />
    </Flex>
  );
}

export default PlantGraftedHistory;
