import { Divider, Flex } from "antd";
import style from "./HarvestDays.module.scss";
import {
  ActionMenuHarvest,
  ConfirmModal,
  CropSectionHeader,
  HarvestModal,
  NavigationDot,
  Table,
  TableTitle,
} from "@/components";
import {
  useTableDelete,
  useFetchData,
  useModal,
  useTableUpdate,
  useTableAdd,
  useFilters,
  useHasChanges,
} from "@/hooks";
import { useEffect, useState } from "react";
import { DEFAULT_HARVEST_DAY_FILTERS, getOptions, getUserId } from "@/utils";
import { FilterHarvestDayState } from "@/types";
import { HarvestRequest, GetHarvestDay, GetHarvestDayDetail } from "@/payloads";
import { harvestService } from "@/services";
import HarvestDayFilter from "./HarvestDayFilter";
import { HarvestDayColumns } from "./HarvestDayColumns";
import { useCropStore, useDirtyStore } from "@/stores";
import HarvestDayDetail from "./HarvestDayDetail";
import { CROP_STATUS } from "@/constants";

function HarvestDays() {
  const [selectedHarvest, setSelectedHarvest] = useState<number | null>(null);
  const formModal = useModal<GetHarvestDay>();
  const deleteConfirmModal = useModal<{ ids: number[] }>();
  const updateConfirmModal = useModal<{ harvest: HarvestRequest }>();
  const cancelConfirmModal = useModal();
  const { isDirty } = useDirtyStore();
  const { crop, setCrop, isHarvestDetailView, setIsHarvestDetailView } = useCropStore();
  if (!crop) return;

  const handleViewDetail = (id: number) => {
    setSelectedHarvest(id);
    setIsHarvestDetailView(true); // Đánh dấu đang xem chi tiết
  };

  const handleBackToList = () => {
    setSelectedHarvest(null);
    setIsHarvestDetailView(false); // Quay về danh sách
  };

  const { filters, updateFilters, applyFilters, clearFilters } = useFilters<FilterHarvestDayState>(
    DEFAULT_HARVEST_DAY_FILTERS,
    () => fetchData(),
  );

  const {
    data,
    fetchData,
    totalRecords,
    totalPages,
    sortField,
    sortDirection,
    rotation,
    handleSortChange,
    currentPage,
    rowsPerPage,
    searchValue,
    handlePageChange,
    handleRowsPerPageChange,
    handleSearch,
    isLoading,
  } = useFetchData<GetHarvestDay>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      harvestService.getHarvests(
        page,
        limit,
        sortField,
        sortDirection,
        searchValue,
        crop.cropId,
        filters,
      ),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue]);

  const { handleDelete } = useTableDelete(
    {
      deleteFunction: harvestService.deleteHarvest,
      fetchData,
      onSuccess: () => {
        deleteConfirmModal.hideModal();
      },
    },
    {
      currentPage,
      rowsPerPage,
      totalRecords,
      handlePageChange,
    },
  );

  const hasChanges = useHasChanges<HarvestRequest>(data);

  const handleUpdateConfirm = (harvest: HarvestRequest) => {
    if (hasChanges(harvest, "harvestHistoryId", undefined, ["startTime", "endTime"]) || isDirty) {
      updateConfirmModal.showModal({ harvest });
    } else {
      formModal.hideModal();
    }
  };

  const handleCancelConfirm = (harvest: HarvestRequest, isUpdate: boolean) => {
    const hasUnsavedChanges = isUpdate
      ? hasChanges(harvest, "harvestHistoryId", undefined, ["startTime", "endTime"])
      : hasChanges(harvest, undefined, {
          cropId: crop.cropId,
          ...(harvest.addNewTask && {
            addNewTask: {
              ...harvest.addNewTask,
              assignorId: Number(getUserId()),
            },
          }),
        });

    if (hasUnsavedChanges || isDirty) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate, isUpdating } = useTableUpdate<HarvestRequest>({
    updateService: harvestService.updateHarvest,
    fetchData: fetchData,
    onSuccess: () => {
      formModal.hideModal();
      updateConfirmModal.hideModal();
    },
    onError: () => {
      updateConfirmModal.hideModal();
    },
  });

  const { handleAdd, isAdding } = useTableAdd({
    addService: harvestService.createHarvest,
    fetchData: fetchData,
    onSuccess: () => {
      formModal.hideModal();
      setCrop({ ...crop, status: CROP_STATUS.HARVESTING });
    },
  });

  const filterContent = (
    <HarvestDayFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={clearFilters}
      onApply={applyFilters}
    />
  );

  return (
    <Flex className={style.contentDetailWrapper}>
      <CropSectionHeader onAddNewHarvest={() => formModal.showModal()} />
      <Divider className={style.divider} />
      {isHarvestDetailView ? (
        <HarvestDayDetail selectedHarvest={selectedHarvest} onBack={handleBackToList} />
      ) : (
        <>
          <Flex className={style.container}>
            <Flex className={style.table}>
              <Table
                columns={HarvestDayColumns}
                rows={data}
                rowKey="harvestHistoryCode"
                idName="harvestHistoryId"
                isOnRowEvent={true}
                onRowDoubleClick={(record) => handleViewDetail(record.harvestHistoryId)}
                title={<TableTitle onSearch={handleSearch} filterContent={filterContent} noAdd />}
                isViewCheckbox={false}
                handleSortClick={handleSortChange}
                selectedColumn={sortField}
                rotation={rotation}
                currentPage={currentPage}
                rowsPerPage={rowsPerPage}
                // handleDelete={(ids) => handleDelete(ids)}
                isLoading={isLoading}
                caption="Harvest Day Management Table"
                notifyNoData="No days to display"
                renderAction={(harvest: GetHarvestDay) => (
                  <ActionMenuHarvest
                    onEdit={() => formModal.showModal(harvest)}
                    onDelete={() =>
                      deleteConfirmModal.showModal({ ids: [harvest.harvestHistoryId] })
                    }
                  />
                )}
              />

              <NavigationDot
                totalPages={totalPages}
                currentPage={currentPage}
                rowsPerPage={rowsPerPage}
                onPageChange={handlePageChange}
                rowsPerPageOptions={getOptions(totalRecords)}
                onRowsPerPageChange={handleRowsPerPageChange}
              />
            </Flex>
            <HarvestModal
              isOpen={formModal.modalState.visible}
              onClose={handleCancelConfirm}
              onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
              isLoadingAction={formModal.modalState.data ? isUpdating : isAdding}
              harvestData={formModal.modalState.data}
            />
            {/* Confirm Delete Modal */}
            <ConfirmModal
              visible={deleteConfirmModal.modalState.visible}
              onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.ids)}
              onCancel={deleteConfirmModal.hideModal}
              itemName="Harvest"
              actionType="delete"
            />
            {/* Confirm Update Modal */}
            <ConfirmModal
              visible={updateConfirmModal.modalState.visible}
              onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.harvest)}
              onCancel={updateConfirmModal.hideModal}
              itemName="Harvest"
              actionType="update"
            />
            {/* Confirm Cancel Modal */}
            <ConfirmModal
              visible={cancelConfirmModal.modalState.visible}
              actionType="unsaved"
              onConfirm={() => {
                cancelConfirmModal.hideModal();
                formModal.hideModal();
              }}
              onCancel={cancelConfirmModal.hideModal}
            />
          </Flex>
        </>
      )}
    </Flex>
  );
}

export default HarvestDays;
