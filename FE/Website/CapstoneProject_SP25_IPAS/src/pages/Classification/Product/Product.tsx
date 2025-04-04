import { Flex } from "antd";
import style from "./Product.module.scss";
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
} from "@/hooks";
import { useEffect, useState } from "react";
import { DEFAULT_MASTER_TYPE_FILTERS, getOptions } from "@/utils";
import { masterTypeService } from "@/services";
import { FilterMasterTypeState } from "@/types";
import { CRITERIA_TARGETS, MASTER_TYPE, ROUTES } from "@/constants";
import MasterTypeFilter from "../MasterType/MasterTypeFilter";
import { productColumns } from "./ProductColumns";
import { useNavigate } from "react-router-dom";

function Product() {
  const navigate = useNavigate();
  const formModal = useModal<GetMasterType>();
  const deleteConfirmModal = useModal<{ ids: number[] }>();
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
      masterTypeService.getMasterTypes(
        page,
        limit,
        sortField,
        sortDirection,
        searchValue,
        CRITERIA_TARGETS.Product,
        // filters,
      ),
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
      : hasChanges(stage, undefined, { isActive: false, typeName: MASTER_TYPE.PRODUCT });
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
      <SectionTitle title="Product Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={productColumns}
          rows={data}
          rowKey="masterTypeCode"
          idName="masterTypeId"
          title={
            <TableTitle
              onSearch={handleSearch}
              filterContent={filterContent}
              addLabel="Add New Product"
              onAdd={() => formModal.showModal()}
            />
          }
          isOnRowEvent={true}
          onRowDoubleClick={(record) => navigate(ROUTES.PRODUCT_DETAIL(record.masterTypeId))}
          handleSortClick={handleSortChange}
          selectedColumn={sortField}
          rotation={rotation}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          handleDelete={(ids) => handleDelete(ids)}
          isLoading={isLoading}
          caption="Product Management Table"
          notifyNoData="No product to display"
          renderAction={(product: GetMasterType) => (
            <ActionMenuMasterType
              onEdit={() => formModal.showModal(product)}
              onDelete={() => deleteConfirmModal.showModal({ ids: [product.masterTypeId] })}
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
        typeCurrent={CRITERIA_TARGETS.Product}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.ids)}
        onCancel={deleteConfirmModal.hideModal}
        itemName="Product"
        actionType="delete"
      />
      {/* Confirm Update Modal */}
      <ConfirmModal
        visible={updateConfirmModal.modalState.visible}
        onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.type)}
        onCancel={updateConfirmModal.hideModal}
        itemName="Product"
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

export default Product;
