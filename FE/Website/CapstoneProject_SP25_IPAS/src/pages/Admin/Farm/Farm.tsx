import {
  useFetchData,
  useFilters,
  useHasChanges,
  useModal,
  useTableDelete,
  useTableUpdate,
} from "@/hooks";
import style from "./Farm.module.scss";
import { AdminFarmRequest, GetFarmInfo } from "@/payloads";
import { farmService } from "@/services";
import { useEffect, useState } from "react";
import { FilterFarmState } from "@/types";
import { DEFAULT_FARM_FILTERS, getOptions } from "@/utils";
import { Flex } from "antd";
import {
  ActionMenuFarm,
  ConfirmModal,
  NavigationDot,
  SectionTitle,
  Table,
  TableTitle,
} from "@/components";
import { toast } from "react-toastify";
import { FarmColumns } from "./FarmColumns";
import FarmFilter from "./FarmFilter";
import FarmModal from "./FarmModal";

function Farm() {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const formModal = useModal<GetFarmInfo>();
  const updateConfirmModal = useModal<{ farm: AdminFarmRequest }>();
  const changeStatusConfirmModal = useModal<{ ids: number[]; type: "activate" | "deactivate" }>();
  const deleteConfirmModal = useModal<{ ids: number[] }>();
  const cancelConfirmModal = useModal();

  const { filters, updateFilters, applyFilters, clearFilters } = useFilters<FilterFarmState>(
    DEFAULT_FARM_FILTERS,
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
  } = useFetchData<GetFarmInfo>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      farmService.getFarms(page, limit, sortField, sortDirection, searchValue, filters),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue]);

  const { handleDelete } = useTableDelete(
    {
      deleteFunction: farmService.deleteFarm,
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

  const hasChanges = useHasChanges<AdminFarmRequest>(data);

  const handleUpdateConfirm = (farm: AdminFarmRequest) => {
    if (hasChanges(farm, "farmId")) {
      updateConfirmModal.showModal({ farm });
    } else {
      formModal.hideModal();
    }
  };

  const handleCancelConfirm = (farm: AdminFarmRequest, isUpdate: boolean) => {
    const hasUnsavedChanges = isUpdate ? hasChanges(farm, "farmId") : hasChanges(farm);

    if (hasUnsavedChanges) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate, isUpdating } = useTableUpdate<AdminFarmRequest>({
    updateService: farmService.updateFarm,
    fetchData: fetchData,
    onSuccess: () => {
      formModal.hideModal();
      updateConfirmModal.hideModal();
    },
    onError: () => {
      updateConfirmModal.hideModal();
    },
  });

  //   const { handleAdd, isAdding } = useTableAdd({
  //     addService: userService.createUser,
  //     fetchData: fetchData,
  //     onSuccess: () => formModal.hideModal(),
  //   });

  const handleChangeStatus = async (
    ids?: number[] | string[],
    type?: "activate" | "deactivate",
  ) => {
    if (!ids || !type) return;
    setIsActionLoading(true);
    try {
      var res = await farmService.updateStatusFarm(ids);
      if (res.statusCode === 200) {
        toast.success(
          type === "deactivate"
            ? "Farm(s) deactivated successfully."
            : "Farm(s) activated successfully.",
        );
        changeStatusConfirmModal.hideModal();
        fetchData();
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const filterContent = (
    <FarmFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={clearFilters}
      onApply={applyFilters}
    />
  );

  return (
    <Flex className={style.container}>
      <SectionTitle title="Farm Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={FarmColumns}
          rows={data}
          rowKey="farmCode"
          idName="farmId"
          title={<TableTitle onSearch={handleSearch} filterContent={filterContent} noAdd />}
          handleSortClick={handleSortChange}
          selectedColumn={sortField}
          sortDirection={sortDirection}
          rotation={rotation}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          isViewCheckbox={false}
          isLoading={isLoading}
          caption="Farm Management Board"
          notifyNoData="No farms to display"
          renderAction={(farm: GetFarmInfo) => (
            <ActionMenuFarm
              farm={farm}
              onEdit={() => formModal.showModal(farm)}
              onDeactivate={() =>
                changeStatusConfirmModal.showModal({
                  ids: [farm.farmId],
                  type: "deactivate",
                })
              }
              onActivate={() =>
                changeStatusConfirmModal.showModal({
                  ids: [farm.farmId],
                  type: "activate",
                })
              }
              onDelete={() => deleteConfirmModal.showModal({ ids: [farm.farmId] })}
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
        <FarmModal
          isOpen={formModal.modalState.visible}
          onClose={handleCancelConfirm}
          onSave={handleUpdateConfirm}
          isLoadingAction={isUpdating}
          farmData={formModal.modalState.data}
        />
        {/* Confirm Delete Modal */}
        <ConfirmModal
          visible={deleteConfirmModal.modalState.visible}
          onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.ids)}
          onCancel={deleteConfirmModal.hideModal}
          itemName="Farm"
          actionType="delete"
        />
        {/* Confirm Update Modal */}
        <ConfirmModal
          visible={updateConfirmModal.modalState.visible}
          onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.farm)}
          onCancel={updateConfirmModal.hideModal}
          itemName="Farm"
          actionType="update"
        />
        <ConfirmModal
          visible={changeStatusConfirmModal.modalState.visible}
          onConfirm={() =>
            handleChangeStatus(
              changeStatusConfirmModal.modalState.data?.ids,
              changeStatusConfirmModal.modalState.data?.type,
            )
          }
          onCancel={changeStatusConfirmModal.hideModal}
          itemName="selected farm(s)"
          title={
            changeStatusConfirmModal.modalState.data?.type === "deactivate"
              ? "Deactivate Farms"
              : "Activate Farms"
          }
          description={`Are you sure you want to ${
            changeStatusConfirmModal.modalState.data?.type === "deactivate"
              ? "deactivate"
              : "activate"
          } ${changeStatusConfirmModal.modalState.data?.ids.length || 0} farm(s)? ${
            changeStatusConfirmModal.modalState.data?.type === "deactivate"
              ? "They will no longer be accessible until reactivated."
              : "They will be re-enabled and accessible again."
          }`}
          confirmText={
            changeStatusConfirmModal.modalState.data?.type === "deactivate"
              ? "Deactivate"
              : "Activate"
          }
          isDanger={changeStatusConfirmModal.modalState.data?.type === "deactivate"}
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

export default Farm;
