import {
  ActionMenuPartner,
  ConfirmModal,
  NavigationDot,
  SectionTitle,
  Table,
  TableTitle,
} from "@/components";
import {
  useFetchData,
  useFilters,
  useHasChanges,
  useModal,
  useTableAdd,
  useTableDelete,
  useTableUpdate,
} from "@/hooks";
import { GetPartner, PartnerRequest } from "@/payloads";
import { partnerService } from "@/services";
import { Flex } from "antd";
import { useEffect } from "react";
import style from "./Partner.module.scss";
import { DEFAULT_PARTNER_FILTERS, getOptions } from "@/utils";
import { PartnerColumns } from "./PartnerColumns";
import { FilterPartnerState } from "@/types";
import PartnerFilter from "./PartnerFilter";
import PartnerModal from "./PartnerModal";

function ThirdParty() {
  const formModal = useModal<GetPartner>();
  const deleteConfirmModal = useModal<{ ids: number[] | string[] }>();
  const updateConfirmModal = useModal<{ partner: PartnerRequest }>();
  const cancelConfirmModal = useModal();

  const { filters, updateFilters, applyFilters, clearFilters } = useFilters<FilterPartnerState>(
    DEFAULT_PARTNER_FILTERS,
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
  } = useFetchData<GetPartner>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      partnerService.getPartners(page, limit, sortField, sortDirection, searchValue, filters),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue]);

  const { handleDelete } = useTableDelete(
    {
      deleteFunction: partnerService.deletePartners,
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

  const hasChanges = useHasChanges<PartnerRequest>(data);

  const handleUpdateConfirm = (partner: PartnerRequest) => {
    if (hasChanges(partner, "partnerId")) {
      updateConfirmModal.showModal({ partner });
    } else {
      formModal.hideModal();
    }
  };

  const handleCancelConfirm = (partner: PartnerRequest, isUpdate: boolean) => {
    const hasUnsavedChanges = isUpdate ? hasChanges(partner, "partnerId") : hasChanges(partner);

    if (hasUnsavedChanges) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate, isUpdating } = useTableUpdate<PartnerRequest>({
    updateService: partnerService.updatePartner,
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
    addService: partnerService.createPartner,
    fetchData: fetchData,
    onSuccess: () => formModal.hideModal(),
  });

  const filterContent = (
    <PartnerFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={clearFilters}
      onApply={applyFilters}
    />
  );

  return (
    <Flex className={style.container}>
      <SectionTitle title="Partner Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={PartnerColumns}
          rows={data}
          rowKey="partnerCode"
          idName="partnerId"
          title={
            <TableTitle
              onSearch={handleSearch}
              filterContent={filterContent}
              addLabel="Add New Partner"
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
          caption="Partner Management Table"
          notifyNoData="No partners to display"
          renderAction={(partner: GetPartner) => (
            <ActionMenuPartner
              onEdit={() => formModal.showModal(partner)}
              onDelete={() => deleteConfirmModal.showModal({ ids: [partner.partnerId] })}
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
      <PartnerModal
        isOpen={formModal.modalState.visible}
        onClose={handleCancelConfirm}
        onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
        isLoadingAction={formModal.modalState.data ? isUpdating : isAdding}
        partnerData={formModal.modalState.data}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.ids)}
        onCancel={deleteConfirmModal.hideModal}
        itemName="Partner"
        actionType="delete"
      />
      {/* Confirm Update Modal */}
      <ConfirmModal
        visible={updateConfirmModal.modalState.visible}
        onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.partner)}
        onCancel={updateConfirmModal.hideModal}
        itemName="Partner"
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
export default ThirdParty;
