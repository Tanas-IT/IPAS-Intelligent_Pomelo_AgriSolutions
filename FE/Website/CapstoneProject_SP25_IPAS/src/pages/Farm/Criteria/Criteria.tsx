import React, { useEffect, useState } from "react";
import { List, Collapse, Flex, Tag } from "antd";
import style from "./Criteria.module.scss";
import {
  ActionMenuCriteria,
  ConfirmModal,
  LoadingSkeleton,
  NavigationDot,
  SectionTitle,
  TableTitle,
} from "@/components";
import { DEFAULT_CRITERIA_FILTERS, formatDate, getCriteriaOptions } from "@/utils";
import {
  useFetchData,
  useFilters,
  useHasChanges,
  useModal,
  useTableAdd,
  useTableDelete,
  useTableUpdate,
} from "@/hooks";
import { criteriaService, masterTypeService } from "@/services";
import { CriteriaMasterRequest, GetCriteriaByMasterType } from "@/payloads";
import CriteriaTable from "./CriteriaTable";
import { FilterCriteriaState } from "@/types";
import CriteriaFilter from "./CriteriaFitler";
import CriteriaModel from "./CriteriaModal";
import { useDirtyStore } from "@/stores";

const { Panel } = Collapse;

function CriteriaList() {
  const formModal = useModal<GetCriteriaByMasterType>();
  const deleteConfirmModal = useModal<{ id: number[] }>();
  const updateConfirmModal = useModal<{ criteria: CriteriaMasterRequest }>();
  const cancelConfirmModal = useModal();
  const { isDirty } = useDirtyStore();

  const { filters, updateFilters, applyFilters, clearFilters } = useFilters<FilterCriteriaState>(
    DEFAULT_CRITERIA_FILTERS,
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
    rowsPerPage = 3,
    searchValue,
    handlePageChange,
    handleRowsPerPageChange,
    handleSearch,
    isLoading,
  } = useFetchData<GetCriteriaByMasterType>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      criteriaService.getCriteriaSet(
        page,
        limit ?? 3,
        sortField,
        sortDirection,
        searchValue,
        filters,
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

  const hasChanges = useHasChanges<CriteriaMasterRequest>(data);

  const handleUpdateConfirm = (criteria: CriteriaMasterRequest) => {
    if (hasChanges(criteria, "masterTypeId") || isDirty) {
      updateConfirmModal.showModal({ criteria });
    } else {
      formModal.hideModal();
    }
  };

  const handleCancelConfirm = (criteria: CriteriaMasterRequest, isUpdate: boolean) => {
    const hasUnsavedChanges = isUpdate
      ? hasChanges(criteria, "masterTypeId")
      : hasChanges(criteria, undefined, { isActive: false });
    if (hasUnsavedChanges || isDirty) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate, isUpdating } = useTableUpdate<CriteriaMasterRequest>({
    updateService: criteriaService.updateCriteria,
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
    addService: criteriaService.createCriteria,
    fetchData: fetchData,
    onSuccess: () => formModal.hideModal(),
  });

  const filterContent = (
    <CriteriaFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={clearFilters}
      onApply={applyFilters}
    />
  );

  return (
    <Flex className={style.container}>
      <Flex className={style.header}>
        <SectionTitle title="Criteria Management" totalRecords={totalRecords} />
        <TableTitle
          onSearch={handleSearch}
          filterContent={filterContent}
          addLabel="Add New Criteria"
          onAdd={() => formModal.showModal()}
        />
      </Flex>
      <Flex className={style.table}>
        <List
          itemLayout="vertical"
          dataSource={data}
          renderItem={(item) => (
            <List.Item key={item.masterTypeId} className={style.itemWrapper}>
              <Flex vertical gap={4} className={style.criteriaHeader}>
                <Flex justify="space-between">
                  <Flex align="center" gap={20}>
                    <Flex align="center" gap={8}>
                      <h3 className={style.criteriaTitle}>{item.masterTypeName}</h3>
                      <p>({formatDate(item.createDate)})</p>
                    </Flex>
                    <Tag color={item.isActive ? "green" : "red"} className={style.tag}>
                      {item.isActive ? "Active" : "Inactive"}
                    </Tag>
                  </Flex>
                  <ActionMenuCriteria
                    onEdit={() => formModal.showModal(item)}
                    onDelete={() => deleteConfirmModal.showModal({ id: [item.masterTypeId] })}
                  />
                </Flex>

                <p className={style.criteriaTarget}>
                  <b>Target:</b> {item.target}
                </p>
                <p className={style.criteriaDescription}>
                  <b>Description:</b> {item.masterTypeDescription}
                </p>
              </Flex>

              <Collapse>
                <Panel header="View Criteria" key="1">
                  <CriteriaTable criteria={item.criterias} />
                </Panel>
              </Collapse>
            </List.Item>
          )}
        />
      </Flex>
      <NavigationDot
        totalPages={totalPages}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        rowsPerPageOptions={getCriteriaOptions(totalRecords)}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
      <CriteriaModel
        isOpen={formModal.modalState.visible}
        onClose={handleCancelConfirm}
        onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
        isLoadingAction={formModal.modalState.data ? isUpdating : isAdding}
        criteriaData={formModal.modalState.data}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.id)}
        onCancel={deleteConfirmModal.hideModal}
        itemName="Criteria"
        actionType="delete"
      />
      {/* Confirm Update Modal */}
      <ConfirmModal
        visible={updateConfirmModal.modalState.visible}
        onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.criteria)}
        onCancel={updateConfirmModal.hideModal}
        itemName="Criteria"
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

export default CriteriaList;
