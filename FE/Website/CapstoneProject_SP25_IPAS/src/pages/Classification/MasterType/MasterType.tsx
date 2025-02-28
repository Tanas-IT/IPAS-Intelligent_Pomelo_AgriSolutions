import { Flex } from "antd";
import style from "./MasterType.module.scss";
import {
  ActionMenuMasterType,
  ConfirmModal,
  NavigationDot,
  SectionTitle,
  Table,
  TableTitle,
} from "@/components";
import { GetMasterType, MasterTypeRequest } from "@/payloads";
import {
  useTableDelete,
  useFetchData,
  useModal,
  useTableUpdate,
  useTableAdd,
  useFilters,
  useHasChanges,
} from "@/hooks";
import { useEffect } from "react";
import { DEFAULT_MASTER_TYPE_FILTERS, getOptions } from "@/utils";
import { masterTypeService } from "@/services";
import { masterTypeColumns } from "./MasterTypeColumn";
import MasterTypeFilter from "./MasterTypeFilter";
import { FilterMasterTypeState } from "@/types";
import MasterTypeModel from "./MasterTypeModal";

function MasterType() {
  const formModal = useModal<GetMasterType>();
  const deleteConfirmModal = useModal<{ ids: number[] | string[] }>();
  const updateConfirmModal = useModal<{ type: MasterTypeRequest }>();
  const cancelConfirmModal = useModal();

  const { filters, updateFilters, applyFilters, clearFilters } = useFilters<FilterMasterTypeState>(
    DEFAULT_MASTER_TYPE_FILTERS,
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
  } = useFetchData<GetMasterType>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      masterTypeService.getMasterTypes(page, limit, sortField, sortDirection, searchValue, filters),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue]);

  const { handleDelete } = useTableDelete(
    {
      deleteFunction: masterTypeService.deleteMasterTypes,
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

  const hasChanges = useHasChanges<MasterTypeRequest>(data);

  const handleUpdateConfirm = (type: MasterTypeRequest) => {
    if (hasChanges(type, "masterTypeId")) {
      updateConfirmModal.showModal({ type });
    } else {
      formModal.hideModal();
    }
  };

  const handleCancelConfirm = (stage: MasterTypeRequest, isUpdate: boolean) => {
    const hasUnsavedChanges = isUpdate
      ? hasChanges(stage, "masterTypeId")
      : hasChanges(stage, undefined, { isActive: false });
    if (hasUnsavedChanges) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate } = useTableUpdate<MasterTypeRequest>({
    updateService: masterTypeService.updateMasterType,
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
    addService: masterTypeService.createMasterType,
    fetchData: fetchData,
    onSuccess: () => formModal.hideModal(),
  });

  const filterContent = (
    <MasterTypeFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={clearFilters}
      onApply={applyFilters}
    />
  );

  return (
    <Flex className={style.container}>
      <SectionTitle title="Master Type Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={masterTypeColumns}
          rows={data}
          rowKey="masterTypeCode"
          idName="masterTypeId"
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
          rotation={rotation}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          handleDelete={(ids) => handleDelete(ids)}
          isLoading={isLoading}
          caption="Master Type Management Table"
          notifyNoData="No data to display"
          renderAction={(type: GetMasterType) => (
            <ActionMenuMasterType
              onEdit={() => formModal.showModal(type)}
              onDelete={() => deleteConfirmModal.showModal({ ids: [type.masterTypeId] })}
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
      <MasterTypeModel
        isOpen={formModal.modalState.visible}
        onClose={handleCancelConfirm}
        onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
        masterTypeData={formModal.modalState.data}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.ids)}
        onCancel={deleteConfirmModal.hideModal}
        itemName="Type"
        actionType="delete"
      />
      {/* Confirm Update Modal */}
      <ConfirmModal
        visible={updateConfirmModal.modalState.visible}
        onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.type)}
        onCancel={updateConfirmModal.hideModal}
        itemName="Type"
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
  );
}

export default MasterType;
