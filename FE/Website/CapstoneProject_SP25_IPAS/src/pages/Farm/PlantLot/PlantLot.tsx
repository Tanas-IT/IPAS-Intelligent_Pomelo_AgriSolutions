import { Flex } from "antd";
import style from "./PlantLot.module.scss";
import {
  ActionMenuLot,
  ConfirmModal,
  NavigationDot,
  SectionTitle,
  Table,
  TableTitle,
} from "@/components";
import { GetPlantLot2, PlantLotRequest } from "@/payloads";
import {
  useFetchData,
  useHasChanges,
  useModal,
  useTableAdd,
  useTableDelete,
  useTableUpdate,
} from "@/hooks";
import { useEffect, useState } from "react";
import { getOptions } from "@/utils";
import { plantLotService } from "@/services";
import { PlantLotColumns } from "./PlantLotColumns";
import LotModel from "./LotModal";
import ApplyCriteriaModal from "./ApplyCriteriaModal";

function PlantLot() {
  const formModal = useModal<GetPlantLot2>();
  const criteriaModal = useModal();
  const deleteConfirmModal = useModal<{ ids: number[] | string[] }>();
  const updateConfirmModal = useModal<{ lot: PlantLotRequest }>();
  const cancelConfirmModal = useModal();

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
      plantLotService.getPlantLots(page, limit, sortField, sortDirection, searchValue),
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
    const hasUnsavedChanges = isUpdate ? hasChanges(lot, "plantLotId") : hasChanges(lot);

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
              addLabel="Add New Lot"
              onAdd={() => formModal.showModal()}
              noFilter={true}
            />
          }
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
              onEdit={() => formModal.showModal(lot)}
              onDelete={() => deleteConfirmModal.showModal({ ids: [lot.plantLotId] })}
              onApplyCriteria={() => criteriaModal.showModal()}
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
        <LotModel
          isOpen={formModal.modalState.visible}
          onClose={handleCancelConfirm}
          onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
          isLoadingAction={formModal.modalState.data ? isUpdating : isAdding}
          lotData={formModal.modalState.data}
        />
        <ApplyCriteriaModal
          isOpen={criteriaModal.modalState.visible}
          onClose={criteriaModal.hideModal}
          onSave={criteriaModal.hideModal}
          isLoadingAction={false}
        />
        {/* Confirm Delete Modal */}
        <ConfirmModal
          visible={deleteConfirmModal.modalState.visible}
          onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.ids)}
          onCancel={deleteConfirmModal.hideModal}
          itemName="Lot"
          actionType="delete"
        />
        {/* Confirm Update Modal */}
        <ConfirmModal
          visible={updateConfirmModal.modalState.visible}
          onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.lot)}
          onCancel={updateConfirmModal.hideModal}
          itemName="Lot"
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
    </Flex>
  );
}

export default PlantLot;
