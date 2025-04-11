import { Flex, Select } from "antd";
import style from "./MasterType.module.scss";
import {
  ActionMenuMasterType,
  ConfirmModal,
  NavigationDot,
  SectionTitle,
  Table,
  TableTitle,
  MasterTypesModal,
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
  useSystemConfigOptions,
} from "@/hooks";
import { useEffect, useState } from "react";
import { DEFAULT_MASTER_TYPE_FILTERS, getOptions } from "@/utils";
import { masterTypeService } from "@/services";
import { FilterMasterTypeState } from "@/types";
import { masterTypeColumns } from "./MasterTypeColumns";
import MasterTypeFilter from "./MasterTypeFilter";
import { SYSTEM_CONFIG_KEY } from "@/constants";

function MasterType() {
  const formModal = useModal<GetMasterType>();
  const deleteConfirmModal = useModal<{ ids: number[] }>();
  const updateConfirmModal = useModal<{ type: MasterTypeRequest }>();
  const cancelConfirmModal = useModal();
  const { options: typeOptions, loading } = useSystemConfigOptions(SYSTEM_CONFIG_KEY.TYPE_NAME);
  const [typeName, setTypeName] = useState<string>("");

  useEffect(() => {
    if (typeOptions.length > 0 && !typeName) setTypeName(String(typeOptions[0].value));
  }, [typeOptions]);

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
      masterTypeService.getMasterTypes(
        page,
        limit,
        sortField,
        sortDirection,
        searchValue,
        typeName,
        filters,
      ),
  });

  useEffect(() => {
    if (typeName) fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue, typeName]);

  const handleTypeChange = (type: string) => {
    setTypeName(type);
  };

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
      : hasChanges(stage, undefined, { isActive: false, typeName: typeName });
    if (hasUnsavedChanges) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate, isUpdating } = useTableUpdate<MasterTypeRequest>({
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

  const { handleAdd, isAdding } = useTableAdd({
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
              extraContent={
                <Select
                  placeholder="Select Type"
                  value={typeName}
                  style={{ width: "20rem" }}
                  loading={loading}
                  options={typeOptions}
                  onChange={(value) => handleTypeChange(value)}
                />
              }
              sectionRightSize="small"
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
      <MasterTypesModal
        isOpen={formModal.modalState.visible}
        onClose={handleCancelConfirm}
        onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
        isLoadingAction={formModal.modalState.data ? isUpdating : isAdding}
        masterTypeData={formModal.modalState.data}
        typeCurrent={typeName}
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
