import { Flex } from "antd";
import style from "./Product.module.scss";
import {
  ConfirmModal,
  NavigationDot,
  SectionTitle,
  Table,
  TableTitle,
  MasterTypesModal,
  ActionMenuProduct,
  ApplyProductCriteriaModal,
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
import { masterTypeService, productService } from "@/services";
import { FilterMasterTypeState } from "@/types";
import { CRITERIA_TARGETS, MASTER_TYPE, ROUTES } from "@/constants";
import MasterTypeFilter from "../MasterType/MasterTypeFilter";
import { productColumns } from "./ProductColumns";
import { useNavigate } from "react-router-dom";
import { useDirtyStore } from "@/stores";
import { toast } from "react-toastify";

function Product() {
  const navigate = useNavigate();
  const [isActionLoading, setIsActionLoading] = useState(false);
  const formModal = useModal<GetMasterType>();
  const deleteConfirmModal = useModal<{ ids: number[] }>();
  const updateConfirmModal = useModal<{ type: MasterTypeRequest }>();
  const criteriaModal = useModal<{ id: number }>();
  const cancelConfirmModal = useModal();
  const { isDirty } = useDirtyStore();

  const { filters, updateFilters, applyFilters, clearFilters } = useFilters<FilterMasterTypeState>(
    DEFAULT_MASTER_TYPE_FILTERS,
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

  const handleCloseCriteria = () => {
    if (isDirty) {
      cancelConfirmModal.showModal();
    } else {
      criteriaModal.hideModal();
    }
  };

  const applyCriteria = async (productId: number, criteriaSetId: number) => {
    var res = await productService.applyProductCriteria(productId, criteriaSetId);
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
            <ActionMenuProduct
              onEdit={() => formModal.showModal(product)}
              onDelete={() => deleteConfirmModal.showModal({ ids: [product.masterTypeId] })}
              onApplyCriteria={() =>
                criteriaModal.showModal({
                  id: product.masterTypeId,
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
      </Flex>
      <MasterTypesModal
        isProduct={true}
        isOpen={formModal.modalState.visible}
        onClose={handleCancelConfirm}
        onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
        isLoadingAction={formModal.modalState.data ? isUpdating : isAdding}
        masterTypeData={formModal.modalState.data}
        typeCurrent={CRITERIA_TARGETS.Product}
      />
      <ApplyProductCriteriaModal
        productId={criteriaModal.modalState.data?.id}
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
          criteriaModal.hideModal();
        }}
        onCancel={cancelConfirmModal.hideModal}
      />
    </Flex>
  );
}

export default Product;
