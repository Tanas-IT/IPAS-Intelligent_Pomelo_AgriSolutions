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
import { HarvestRequest, GetHarvestDay, RecordHarvestRequest } from "@/payloads";
import { harvestService } from "@/services";
import HarvestDayFilter from "./HarvestDayFilter";
import { HarvestDayColumns } from "./HarvestDayColumns";
import { useCropStore, useDirtyStore } from "@/stores";
import HarvestDayDetail from "./HarvestDayDetail";
import { CROP_STATUS } from "@/constants";
import RecordHarvestModal from "./RecordHarvestModal";
import { toast } from "react-toastify";
import RecordImportModal from "./RecordImportModal";

function HarvestDays() {
  // const [selectedHarvest, setSelectedHarvest] = useState<GetHarvestDay | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const formModal = useModal<GetHarvestDay>();
  const recordModal = useModal<GetHarvestDay>();
  const deleteConfirmModal = useModal<{ ids: number[] }>();
  const updateConfirmModal = useModal<{ harvest: HarvestRequest }>();
  const recordConfirmModal = useModal<{ record: RecordHarvestRequest }>();
  const importModal = useModal<{ harvestId: number }>();
  const importErrorModal = useModal<{ errors: string[] }>();
  const cancelConfirmModal = useModal();
  const { isDirty } = useDirtyStore();
  const {
    crop,
    setCrop,
    isHarvestDetailView,
    setIsHarvestDetailView,
    markForRefetch,
    selectedHarvest,
    setSelectedHarvest,
  } = useCropStore();
  // if (!crop) return;

  const handleViewDetail = (selected: GetHarvestDay) => {
    setSelectedHarvest(selected);
    setIsHarvestDetailView(true); // Đánh dấu đang xem chi tiết
  };

  const handleBackToList = () => {
    setSelectedHarvest(null);
    setIsHarvestDetailView(false);
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
        crop?.cropId,
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
        if (isHarvestDetailView) setIsHarvestDetailView(false);
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

  const handleRecordConfirm = (record: RecordHarvestRequest) => {
    if (isDirty) {
      recordConfirmModal.showModal({ record });
    } else {
      recordModal.hideModal();
    }
  };

  const handleCancelConfirm = (harvest: HarvestRequest, isUpdate: boolean) => {
    const hasUnsavedChanges = isUpdate
      ? hasChanges(harvest, "harvestHistoryId", undefined, ["startTime", "endTime"])
      : hasChanges(harvest, undefined, {
          cropId: crop?.cropId,
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

  const handleRecordCancelConfirm = () => {
    if (isDirty) {
      cancelConfirmModal.showModal();
    } else {
      recordModal.hideModal();
    }
  };

  const { handleUpdate, isUpdating } = useTableUpdate<HarvestRequest>({
    updateService: harvestService.updateHarvest,
    fetchData: isHarvestDetailView ? markForRefetch : fetchData,
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
      if (crop) {
        setCrop({
          ...crop,
          status: CROP_STATUS.HARVESTING,
          landPlotCrops: crop.landPlotCrops || [],
          numberHarvest: crop.numberHarvest || 0,
        });
      }
      setIsHarvestDetailView(false);
    },
  });

  const handleRecord = async (record?: RecordHarvestRequest) => {
    if (!record) return;
    var res = await harvestService.createRecordHarvest(record);
    try {
      setIsActionLoading(true);
      if (res.statusCode === 200) {
        recordModal.hideModal();
        recordConfirmModal.hideModal();
        isHarvestDetailView && markForRefetch();
        toast.success(res.message);
      } else {
        toast.warning(res.message);
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleImportClose = (file: File | null) => {
    if (file) {
      cancelConfirmModal.showModal();
    } else {
      importModal.hideModal();
    }
  };

  const handleImport = async (file: File, harvestId?: number) => {
    if (!harvestId) return;
    try {
      setIsActionLoading(true);
      var res = await harvestService.importRecordHarvest(file, harvestId);
      if (res.statusCode === 200) {
        toast.success(res.message);
        importModal.hideModal();
        isHarvestDetailView && markForRefetch();
      } else {
        const errorList = res.message.split("\n").filter((error) => error.trim() !== "");
        importErrorModal.showModal({ errors: errorList });
      }
    } finally {
      setIsActionLoading(false);
    }
  };

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
      {isHarvestDetailView && selectedHarvest ? (
        <HarvestDayDetail
          selectedHarvest={selectedHarvest}
          actionMenu={
            <ActionMenuHarvest
              isCropComplete={crop?.status === CROP_STATUS.COMPLETED}
              onEdit={() => formModal.showModal(selectedHarvest)}
              onDelete={() =>
                deleteConfirmModal.showModal({ ids: [selectedHarvest.harvestHistoryId] })
              }
              onOpenRecordModal={() => recordModal.showModal(selectedHarvest)}
              onImport={() =>
                importModal.showModal({ harvestId: selectedHarvest.harvestHistoryId })
              }
            />
          }
        />
      ) : (
        <Flex className={style.container}>
          <Flex className={style.table}>
            <Table
              columns={HarvestDayColumns}
              rows={data}
              rowKey="harvestHistoryCode"
              idName="harvestHistoryId"
              isOnRowEvent={true}
              onRowDoubleClick={(record) => handleViewDetail(record)}
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
                  isCropComplete={crop?.status === CROP_STATUS.COMPLETED}
                  onEdit={() => formModal.showModal(harvest)}
                  onDelete={() => deleteConfirmModal.showModal({ ids: [harvest.harvestHistoryId] })}
                  onOpenRecordModal={() => recordModal.showModal(harvest)}
                  onImport={() => importModal.showModal({ harvestId: harvest.harvestHistoryId })}
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
        </Flex>
      )}

      <HarvestModal
        isOpen={formModal.modalState.visible}
        onClose={handleCancelConfirm}
        onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
        isLoadingAction={formModal.modalState.data ? isUpdating : isAdding}
        harvestData={formModal.modalState.data}
      />
      <RecordHarvestModal
        isOpen={recordModal.modalState.visible}
        onClose={handleRecordCancelConfirm}
        onSave={handleRecordConfirm}
        isLoadingAction={isActionLoading}
        harvestData={recordModal.modalState.data}
      />
      <RecordImportModal
        isOpen={importModal.modalState.visible}
        onClose={handleImportClose}
        onSave={(value) => handleImport(value, importModal.modalState.data?.harvestId)}
        isLoadingAction={isActionLoading}
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
      {/* Confirm Record Modal */}
      <ConfirmModal
        visible={recordConfirmModal.modalState.visible}
        onConfirm={() => handleRecord(recordConfirmModal.modalState.data?.record)}
        onCancel={recordConfirmModal.hideModal}
        confirmText="Confirm Harvest Record"
        title="Are you sure you want to record this harvest?"
      />
      {/* Confirm Cancel Modal */}
      <ConfirmModal
        visible={cancelConfirmModal.modalState.visible}
        actionType="unsaved"
        onConfirm={() => {
          cancelConfirmModal.hideModal();
          formModal.hideModal();
          recordModal.hideModal();
        }}
        onCancel={cancelConfirmModal.hideModal}
      />
      {/* Confirm Error Modal */}
      <ConfirmModal
        visible={importErrorModal.modalState.visible}
        onConfirm={importErrorModal.hideModal}
        onCancel={importErrorModal.hideModal}
        actionType="error"
        title="Import Failed"
        noCancel={true}
        description="There were errors in your imported file. Please review the details below."
        errorMessages={importErrorModal.modalState.data?.errors}
      />
    </Flex>
  );
}

export default HarvestDays;
