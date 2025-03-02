import { Flex } from "antd";
import style from "./PlantList.module.scss";
import {
  ActionMenuPlant,
  ConfirmModal,
  NavigationDot,
  SectionTitle,
  Table,
  TableTitle,
} from "@/components";
import { GetPlant, PlantRequest } from "@/payloads";
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
import { DEFAULT_PLANT_FILTERS, getOptions } from "@/utils";
import { plantService } from "@/services";
import PlantFilter from "./PlantFilter";
import { plantColumns } from "./PlantColumns";
import { FilterPlantState } from "@/types";
import PlantModel from "./PlantModal";
import { HEALTH_STATUS } from "@/constants";

function PlantList() {
  const formModal = useModal<GetPlant>();
  const deleteConfirmModal = useModal<{ ids: number[] | string[] }>();
  const updateConfirmModal = useModal<{ plant: PlantRequest }>();
  const cancelConfirmModal = useModal();

  const { filters, updateFilters, applyFilters, clearFilters } = useFilters<FilterPlantState>(
    DEFAULT_PLANT_FILTERS,
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
  } = useFetchData<GetPlant>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      plantService.getPlantList(page, limit, sortField, sortDirection, searchValue, filters),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue]);

  const { handleDelete } = useTableDelete(
    {
      deleteFunction: plantService.deletePlant,
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

  const hasChanges = useHasChanges<PlantRequest>(data);

  const handleUpdateConfirm = (plant: PlantRequest) => {
    if (hasChanges(plant, "plantId")) {
      updateConfirmModal.showModal({ plant });
    } else {
      formModal.hideModal();
    }
  };

  const handleCancelConfirm = (plant: PlantRequest, isUpdate: boolean) => {
    const hasUnsavedChanges = isUpdate
      ? hasChanges(plant, "plantId")
      : hasChanges(plant, undefined, { healthStatus: HEALTH_STATUS.NORMAL });

    if (hasUnsavedChanges) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate } = useTableUpdate<PlantRequest>({
    updateService: plantService.updatePlant,
    fetchData: fetchData,
    onSuccess: () => {
      formModal.hideModal();
      updateConfirmModal.hideModal();
    },
    onError: () => {
      updateConfirmModal.hideModal();
    },
  });

  const { handleAdd } = useTableAdd({
    addService: plantService.createPlant,
    fetchData: fetchData,
    onSuccess: () => formModal.hideModal(),
  });

  const filterContent = (
    <PlantFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={clearFilters}
      onApply={applyFilters}
    />
  );

  return (
    <Flex className={style.container}>
      <SectionTitle title="Plant Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={plantColumns}
          rows={data}
          rowKey="plantCode"
          idName="plantId"
          title={
            <TableTitle
              onSearch={handleSearch}
              filterContent={filterContent}
              addLabel="Add New Type"
              onAdd={() => formModal.showModal()}
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
          caption="Plant Management Board"
          notifyNoData="No plants to display"
          renderAction={(plant: GetPlant) => (
            <ActionMenuPlant
              id={plant.plantId}
              onEdit={() => formModal.showModal(plant)}
              onDelete={() => deleteConfirmModal.showModal({ ids: [plant.plantId] })}
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
        <PlantModel
          isOpen={formModal.modalState.visible}
          onClose={handleCancelConfirm}
          onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
          plantData={formModal.modalState.data}
        />
        {/* Confirm Delete Modal */}
        <ConfirmModal
          visible={deleteConfirmModal.modalState.visible}
          onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.ids)}
          onCancel={deleteConfirmModal.hideModal}
          itemName="Plant"
          actionType="delete"
        />
        {/* Confirm Update Modal */}
        <ConfirmModal
          visible={updateConfirmModal.modalState.visible}
          onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.plant)}
          onCancel={updateConfirmModal.hideModal}
          itemName="Plant"
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

export default PlantList;
