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
import { useDelete, useFetchData, useModal } from "@/hooks";
import { useEffect, useState } from "react";
import { getOptions } from "@/utils";
import { farmService, masterTypeService } from "@/services";
import { masterTypeColumns } from "./MasterTypeColumn";
import MasterTypeFilter from "./MasterTypeFilter";
import { FilterMasterTypeState } from "@/types";
import MasterTypeModel from "./MasterTypeModel";

function MasterType() {
  const [filters, setFilters] = useState<FilterMasterTypeState>({
    createDateFrom: "",
    createDateTo: "",
    typeName: [] as string[],
  });
  const formModal = useModal<GetMasterType>();
  const deleteConfirmModal = useModal<{ id: number }>();
  const updateConfirmModal = useModal<{ doc: MasterTypeRequest }>();

  const {
    data,
    fetchData,
    totalRecords,
    totalPages,
    sortField,
    rotation,
    handleSortChange,
    currentPage,
    rowsPerPage,
    searchValue,
    handlePageChange,
    handleRowsPerPageChange,
    handleSearch,
    isLoading,
    isInitialLoad,
  } = useFetchData<GetMasterType>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      masterTypeService.getMasterTypes(page, limit, sortField, sortDirection, searchValue, filters),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, searchValue]);

  // const handleDelete = async () => {
  //   const typeId = deleteConfirmModal.modalState.data?.typeId;
  //   try {
  //     const result = await UserService.deleteUser(id);
  //     if (result.statusCode === 200) {
  //       if ((totalRecords - 1) % rowsPerPage === 0 && currentPage > 1) {
  //         handlePageChange(currentPage - 1);
  //       } else {
  //         fetchData();
  //       }
  //       toast.success(result.message);
  //     } else {
  //       toast.success(result.message);
  //     }
  //   } finally {
  //     deleteConfirmModal.hideModal();
  //   }
  // };

  const { handleDelete } = useDelete(
    farmService.deleteFarmDocuments,
    fetchData,
    deleteConfirmModal,
    {
      currentPage,
      rowsPerPage,
      totalRecords,
      handlePageChange,
    },
  );

  const handleUpdateConfirm = (doc: MasterTypeRequest) => {
    // const oldDoc = legalDocuments.find((d) => d.legalDocumentId === doc.LegalDocumentId);
    // if (!oldDoc) return;
    // // Lấy danh sách resourceID từ oldDoc và doc
    // const oldResourceIds = oldDoc.resources.map((r) => r.resourceID);
    // const newResourceIds = doc.resources.map((r) => r.resourceID);
    // // Kiểm tra nếu có file mới được thêm
    // const hasNewFile = doc.resources.some((r) => r.file);
    // // Kiểm tra nếu resourceID cũ bị mất
    // const hasRemovedResource = oldResourceIds.some((id) => !newResourceIds.includes(id));
    // // So sánh dữ liệu
    // const isChanged =
    //   oldDoc.legalDocumentType !== doc.legalDocumentType ||
    //   oldDoc.legalDocumentName !== doc.legalDocumentName ||
    //   hasNewFile || // Nếu có file mới
    //   hasRemovedResource; // Nếu có resource bị xóa
    // if (isChanged) {
    //   updateConfirmModal.showModal({ doc });
    // } else {
    //   formModal.hideModal();
    // }
  };

  const handleUpdate = async () => {
    const doc = updateConfirmModal.modalState.data?.doc;
    if (!doc) return;
    // try {
    //   setIsLoading(true);
    //   var result = await farmService.updateFarmDocuments(doc);
    //   if (result.statusCode === 200) {
    //     toast.success(result.message);
    //     await fetchFarmDocumentsData();
    //   } else {
    //     toast.error(result.message);
    //   }
    // } finally {
    //   setIsLoading(false);
    //   formModal.hideModal();
    //   updateConfirmModal.hideModal();
    // }
  };

  const handleAdd = async (type: MasterTypeRequest) => {
    // try {
    //   setIsLoading(true);
    //   var result = await farmService.createFarmDocuments(doc);
    //   if (result.statusCode === 200) {
    //     toast.success(result.message);
    //     await fetchFarmDocumentsData();
    //   } else {
    //     toast.error(result.message);
    //   }
    // } finally {
    //   setIsLoading(false);
    //   formModal.hideModal();
    // }
  };

  const updateFilters = (key: keyof FilterMasterTypeState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    fetchData();
  };

  const handleClear = () => {
    setFilters({
      createDateFrom: "",
      createDateTo: "",
      typeName: [],
    });
  };

  const filterContent = (
    <MasterTypeFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={handleClear}
      onApply={handleApply}
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
          isLoading={isLoading}
          isInitialLoad={isInitialLoad}
          caption="Master Type Management Table"
          notifyNoData="No data to display"
          renderAction={(type: GetMasterType) => (
            <ActionMenuMasterType
              onEdit={() => formModal.showModal(type)}
              onDelete={() => deleteConfirmModal.showModal({ id: type.masterTypeId })}
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
        onConfirm={() => handleDelete}
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
