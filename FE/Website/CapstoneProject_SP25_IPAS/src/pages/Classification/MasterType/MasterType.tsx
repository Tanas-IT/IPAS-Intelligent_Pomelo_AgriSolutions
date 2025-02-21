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
} from "@/hooks";
import { useEffect } from "react";
import { DEFAULT_FILTERS, getOptions } from "@/utils";
import { masterTypeService } from "@/services";
import { masterTypeColumns } from "./MasterTypeColumn";
import MasterTypeFilter from "./MasterTypeFilter";
import { FilterMasterTypeState } from "@/types";
import MasterTypeModel from "./MasterTypeModel";

function MasterType() {
  const formModal = useModal<GetMasterType>();
  const deleteConfirmModal = useModal<{ ids: number[] | string[] }>();
  const updateConfirmModal = useModal<{ doc: MasterTypeRequest }>();

  const { filters, updateFilters, applyFilters, clearFilters } = useFilters<FilterMasterTypeState>(
    DEFAULT_FILTERS,
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

  const handleUpdateConfirm = (type: MasterTypeRequest) => {
    handleUpdate(type);
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
        onClose={formModal.hideModal}
        onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
        masterTypeData={formModal.modalState.data}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.ids)}
        onCancel={deleteConfirmModal.hideModal}
        title="Delete Type?"
        description="Are you sure you want to delete this type? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
      />
      {/* Confirm Update Modal */}
      <ConfirmModal
        visible={updateConfirmModal.modalState.visible}
        onConfirm={handleUpdate}
        onCancel={updateConfirmModal.hideModal}
        title="Update Document?"
        description="Are you sure you want to update this document? This action cannot be undone."
        confirmText="Save Changes"
        cancelText="Cancel"
      />
    </Flex>
  );
}

export default MasterType;
