import {
  ActionMenuGrowthStage,
  ConfirmModal,
  NavigationDot,
  SectionTitle,
  Table,
  TableTitle,
} from "@/components";
import {
  useFetchData,
  useHasChanges,
  useModal,
  useTableAdd,
  useTableDelete,
  useTableUpdate,
} from "@/hooks";
import { GetGrowthStage, GrowthStageRequest } from "@/payloads";
import { growthStageService } from "@/services";
import { Flex } from "antd";
import { useEffect } from "react";
import style from "./GrowthStage.module.scss";
import { getOptions } from "@/utils";
import { growthStageColumns } from "./GrowthStageColumns";
import GrowthStageModal from "./GrowthStageModal";
import { useGrowthStageStore } from "@/stores";

function GrowthStage() {
  const formModal = useModal<GetGrowthStage>();
  const deleteConfirmModal = useModal<{ ids: number[] | string[] }>();
  const updateConfirmModal = useModal<{ stage: GrowthStageRequest }>();
  const cancelConfirmModal = useModal();
  const maxAgeStart = useGrowthStageStore((state) => state.maxAgeStart);

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
  } = useFetchData<GetGrowthStage>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      growthStageService.getGrowthStages(page, limit, sortField, sortDirection, searchValue),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue]);

  const { handleDelete } = useTableDelete(
    {
      deleteFunction: growthStageService.deleteGrowthStages,
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

  const hasChanges = useHasChanges<GrowthStageRequest>(data);

  const handleUpdateConfirm = (stage: GrowthStageRequest) => {
    if (hasChanges(stage, "growthStageId")) {
      updateConfirmModal.showModal({ stage });
    } else {
      formModal.hideModal();
    }
  };

  const handleCancelConfirm = (stage: GrowthStageRequest, isUpdate: boolean) => {
    const hasUnsavedChanges = isUpdate
      ? hasChanges(stage, "growthStageId")
      : hasChanges(stage, undefined, {
          monthAgeStart: maxAgeStart ?? undefined,
        });

    if (hasUnsavedChanges) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate, isUpdating } = useTableUpdate<GrowthStageRequest>({
    updateService: growthStageService.updateGrowthStage,
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
    addService: growthStageService.createGrowthStage,
    fetchData: fetchData,
    onSuccess: () => formModal.hideModal(),
  });

  return (
    <Flex className={style.container}>
      <SectionTitle title="Growth Stage Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={growthStageColumns}
          rows={data}
          rowKey="growthStageCode"
          idName="growthStageId"
          title={
            <TableTitle
              onSearch={handleSearch}
              addLabel="Add New Stage"
              onAdd={() => formModal.showModal()}
              noFilter={true}
            />
          }
          handleSortClick={handleSortChange}
          selectedColumn={sortField}
          rotation={rotation}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          handleDelete={(ids) => handleDelete(ids)}
          isLoading={isLoading}
          caption="Growth Stage Management Table"
          notifyNoData="No data to display"
          renderAction={(stage: GetGrowthStage) => (
            <ActionMenuGrowthStage
              onEdit={() => formModal.showModal(stage)}
              onDelete={() => deleteConfirmModal.showModal({ ids: [stage.growthStageId] })}
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
      <GrowthStageModal
        isOpen={formModal.modalState.visible}
        onClose={handleCancelConfirm}
        onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
        isLoadingAction={formModal.modalState.data ? isUpdating : isAdding}
        growthStageData={formModal.modalState.data}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.ids)}
        onCancel={deleteConfirmModal.hideModal}
        itemName="Stage"
        actionType="delete"
      />
      {/* Confirm Update Modal */}
      <ConfirmModal
        visible={updateConfirmModal.modalState.visible}
        onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.stage)}
        onCancel={updateConfirmModal.hideModal}
        itemName="Stage"
        actionType="update"
        description={`Updating the growth stage will adjust the surrounding stages accordingly.
          Are you sure you want to update this stage? This action cannot be undone.`}
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
  );
}
export default GrowthStage;
