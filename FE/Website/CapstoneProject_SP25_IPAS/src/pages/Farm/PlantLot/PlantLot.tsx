import { Flex } from "antd";
import style from "./PlantLot.module.scss";
import {
  ActionMenuLot,
  ApplyLotCriteriaModal,
  ConfirmModal,
  LotModal,
  NavigationDot,
  SectionTitle,
  Table,
  TableTitle,
} from "@/components";
import { CriteriaApplyRequest, GetPlantLot2, PlantLotRequest } from "@/payloads";
import {
  useFetchData,
  useFilters,
  useHasChanges,
  useModal,
  useTableAdd,
  useTableDelete,
  useTableUpdate,
} from "@/hooks";
import { useEffect, useState } from "react";
import { DEFAULT_LOT_FILTERS, getOptions } from "@/utils";
import { criteriaService, plantLotService } from "@/services";
import { PlantLotColumns } from "./PlantLotColumns";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import { FilterPlantLotState } from "@/types";
import PlantLotFilter from "./PlantLotFilter";
import { useDirtyStore } from "@/stores";
import { toast } from "react-toastify";

function PlantLot() {
  const navigate = useNavigate();
  const formModal = useModal<GetPlantLot2>();
  const criteriaModal = useModal<{
    id: number;
    hasInputQuantity?: boolean;
    hasLastQuantity?: boolean;
  }>();
  const deleteConfirmModal = useModal<{ ids: number[] }>();
  const updateConfirmModal = useModal<{ lot: PlantLotRequest }>();
  const cancelConfirmModal = useModal();
  const { isDirty } = useDirtyStore();
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { filters, updateFilters, applyFilters, clearFilters } = useFilters<FilterPlantLotState>(
    DEFAULT_LOT_FILTERS,
    () => fetchData(1),
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
  } = useFetchData<GetPlantLot2>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      plantLotService.getPlantLots(page, limit, sortField, sortDirection, searchValue, filters),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue]);

  const { handleDelete } = useTableDelete(
    {
      deleteFunction: plantLotService.deleteLots,
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

  const hasChanges = useHasChanges<PlantLotRequest>(data);

  const handleUpdateConfirm = (lot: PlantLotRequest) => {
    if (hasChanges(lot, "plantLotId")) {
      updateConfirmModal.showModal({ lot });
    } else {
      formModal.hideModal();
    }
  };

  const handleCancelConfirm = (lot: PlantLotRequest, isUpdate: boolean) => {
    const hasUnsavedChanges = isUpdate
      ? hasChanges(lot, "plantLotId")
      : hasChanges(lot, undefined, { unit: "Plant", isFromGrafted: false });

    if (hasUnsavedChanges) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate, isUpdating } = useTableUpdate<PlantLotRequest>({
    updateService: plantLotService.updateLot,
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
    addService: plantLotService.createLot,
    fetchData: fetchData,
    onSuccess: () => formModal.hideModal(),
  });

  const handleCloseCriteria = () => {
    if (isDirty) {
      cancelConfirmModal.showModal();
    } else {
      criteriaModal.hideModal();
    }
  };

  const applyCriteria = async (criteria: CriteriaApplyRequest) => {
    var res = await criteriaService.applyCriteria(criteria);
    try {
      setIsActionLoading(true);
      if (res.statusCode === 200) {
        criteriaModal.hideModal();
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const filterContent = (
    <PlantLotFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={clearFilters}
      onApply={applyFilters}
    />
  );

  return (
    <Flex className={style.container}>
      <SectionTitle title="Plant Lot Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={PlantLotColumns}
          rows={data}
          rowKey="plantLotCode"
          idName="plantLotId"
          title={
            <TableTitle
              onSearch={handleSearch}
              filterContent={filterContent}
              addLabel="Add New Lot"
              onAdd={() => formModal.showModal()}
            />
          }
          isOnRowEvent={true}
          onRowDoubleClick={(record) => navigate(ROUTES.FARM_PLANT_LOT_DETAIL(record.plantLotId))}
          handleSortClick={handleSortChange}
          selectedColumn={sortField}
          sortDirection={sortDirection}
          rotation={rotation}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          handleDelete={(ids) => handleDelete(ids)}
          isLoading={isLoading}
          caption="Plant Lot Management Board"
          notifyNoData="No lots to display"
          renderAction={(lot: GetPlantLot2) => (
            <ActionMenuLot
              id={lot.plantLotId}
              isCompleted={lot.isPassed}
              onEdit={() => formModal.showModal(lot)}
              onDelete={() => deleteConfirmModal.showModal({ ids: [lot.plantLotId] })}
              onApplyCriteria={() =>
                criteriaModal.showModal({
                  id: lot.plantLotId,
                  hasInputQuantity: !!lot.inputQuantity,
                  hasLastQuantity: !!lot.lastQuantity,
                })
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
        <LotModal
          isOpen={formModal.modalState.visible}
          onClose={handleCancelConfirm}
          onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
          isLoadingAction={formModal.modalState.data ? isUpdating : isAdding}
          lotData={formModal.modalState.data}
        />
        <ApplyLotCriteriaModal
          lotId={criteriaModal.modalState.data?.id}
          hasInputQuantity={criteriaModal.modalState.data?.hasInputQuantity ?? false}
          hasLastQuantity={criteriaModal.modalState.data?.hasLastQuantity ?? false}
          isOpen={criteriaModal.modalState.visible}
          onClose={handleCloseCriteria}
          onSave={applyCriteria}
          isLoadingAction={isActionLoading}
        />
        {/* Confirm Delete Modal */}
        <ConfirmModal
          visible={deleteConfirmModal.modalState.visible}
          onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.ids)}
          onCancel={deleteConfirmModal.hideModal}
          itemName="Plant Lot"
          actionType="delete"
        />
        {/* Confirm Update Modal */}
        <ConfirmModal
          visible={updateConfirmModal.modalState.visible}
          onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.lot)}
          onCancel={updateConfirmModal.hideModal}
          itemName="Plant Lot"
          actionType="update"
        />
        {/* Confirm Cancel Modal */}
        <ConfirmModal
          visible={cancelConfirmModal.modalState.visible}
          actionType="unsaved"
          onConfirm={() => {
            criteriaModal.hideModal();
            cancelConfirmModal.hideModal();
            formModal.hideModal();
          }}
          onCancel={cancelConfirmModal.hideModal}
        />
      </Flex>
    </Flex>
  );
}

export default PlantLot;
