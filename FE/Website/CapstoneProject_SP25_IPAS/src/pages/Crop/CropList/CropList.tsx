import { Flex } from "antd";
import style from "./CropList.module.scss";
import {
  ActionMenuCrop,
  ConfirmModal,
  CropModal,
  NavigationDot,
  SectionTitle,
  Table,
  TableTitle,
} from "@/components";
import { CropRequest, GetCrop2 } from "@/payloads";
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
import { DEFAULT_CROP_FILTERS, getOptions } from "@/utils";
import { cropService } from "@/services";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import { FilterCropState } from "@/types";
import { useDirtyStore } from "@/stores";
import { toast } from "react-toastify";
import CropFilter from "./CropFilter";
import { CropColumns } from "./CropColumns";

function CropList() {
  const navigate = useNavigate();
  const formModal = useModal<GetCrop2>();
  const deleteConfirmModal = useModal<{ ids: number[] | string[] }>();
  const updateConfirmModal = useModal<{ crop: CropRequest }>();
  const cancelConfirmModal = useModal();

  const { filters, updateFilters, applyFilters, clearFilters } = useFilters<FilterCropState>(
    DEFAULT_CROP_FILTERS,
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
  } = useFetchData<GetCrop2>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      cropService.getCropsOfFarm(page, limit, sortField, sortDirection, searchValue, filters),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue]);

  const { handleDelete } = useTableDelete(
    {
      deleteFunction: cropService.deleteCrop,
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

  const hasChanges = useHasChanges<CropRequest>(data);

  const handleUpdateConfirm = (crop: CropRequest) => {
    if (hasChanges(crop, "cropId")) {
      updateConfirmModal.showModal({ crop });
    } else {
      formModal.hideModal();
    }
  };

  const handleCancelConfirm = (crop: CropRequest, isUpdate: boolean) => {
    const hasUnsavedChanges = isUpdate ? hasChanges(crop, "cropId") : hasChanges(crop);

    if (hasUnsavedChanges) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate, isUpdating } = useTableUpdate<CropRequest>({
    updateService: cropService.updateCrop,
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
    addService: cropService.createCrop,
    fetchData: fetchData,
    onSuccess: () => formModal.hideModal(),
  });

  const filterContent = (
    <CropFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={clearFilters}
      onApply={applyFilters}
    />
  );

  return (
    <Flex className={style.container}>
      <SectionTitle title="Crop Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={CropColumns}
          rows={data}
          rowKey="cropCode"
          idName="cropId"
          title={
            <TableTitle
              onSearch={handleSearch}
              filterContent={filterContent}
              addLabel="Add New Crop"
              onAdd={() => formModal.showModal()}
            />
          }
          isOnRowEvent={true}
          onRowDoubleClick={(record) => navigate(ROUTES.CROP_DETAIL(record.cropId))}
          handleSortClick={handleSortChange}
          selectedColumn={sortField}
          sortDirection={sortDirection}
          rotation={rotation}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          handleDelete={(ids) => handleDelete(ids)}
          isLoading={isLoading}
          caption="Crop Management Board"
          notifyNoData="No crops to display"
          isViewCheckbox={false}
          renderAction={(crop: GetCrop2) => (
            <ActionMenuCrop
              id={crop.cropId}
              onEdit={() => formModal.showModal(crop)}
              onDelete={() => deleteConfirmModal.showModal({ ids: [crop.cropId] })}
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
        <CropModal
          isOpen={formModal.modalState.visible}
          onClose={handleCancelConfirm}
          onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
          isLoadingAction={formModal.modalState.data ? isUpdating : isAdding}
          cropData={formModal.modalState.data}
        />
        {/* Confirm Delete Modal */}
        <ConfirmModal
          visible={deleteConfirmModal.modalState.visible}
          onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.ids)}
          onCancel={deleteConfirmModal.hideModal}
          itemName="Crop"
          actionType="delete"
        />
        {/* Confirm Update Modal */}
        <ConfirmModal
          visible={updateConfirmModal.modalState.visible}
          onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.crop)}
          onCancel={updateConfirmModal.hideModal}
          itemName="Crop"
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

export default CropList;
