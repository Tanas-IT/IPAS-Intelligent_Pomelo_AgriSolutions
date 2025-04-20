import { useFetchData, useHasChanges, useModal, useTableAdd, useTableUpdate } from "@/hooks";
import style from "./TagManagement.module.scss";
import { GetTag, TagRequest } from "@/payloads";
import { tagService } from "@/services";
import { useEffect, useState } from "react";
import { getOptions } from "@/utils";
import { Flex } from "antd";
import {
  ActionMenuTag,
  ConfirmModal,
  NavigationDot,
  SectionTitle,
  Table,
  TableTitle,
} from "@/components";
import { toast } from "react-toastify";
import { TagManagementCols } from "./TagManagementCols";
import TagModal from "./TagModal";

function TagManagement() {
  const [isActionLoading, setIsActionLoading] = useState(false);
  const formModal = useModal<GetTag>();
  const updateConfirmModal = useModal<{ tag: TagRequest }>();
  const deleteConfirmModal = useModal<{ id: string }>();
  const cancelConfirmModal = useModal();

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
  } = useFetchData<GetTag>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      tagService.getTags(page, limit, sortField, sortDirection, searchValue),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue]);

  const hasChanges = useHasChanges<TagRequest>(data);

  const handleUpdateConfirm = (tag: TagRequest) => {
    if (hasChanges(tag, "tagId")) {
      updateConfirmModal.showModal({ tag });
    } else {
      formModal.hideModal();
    }
  };

  const handleCancelConfirm = (tag: TagRequest, isUpdate: boolean) => {
    const hasUnsavedChanges = isUpdate ? hasChanges(tag, "tagId") : hasChanges(tag);

    if (hasUnsavedChanges) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate, isUpdating } = useTableUpdate<TagRequest>({
    updateService: tagService.updateTag,
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
    addService: tagService.createUser,
    fetchData: fetchData,
    onSuccess: () => formModal.hideModal(),
  });

  const handleDelete = async (id?: string) => {
    if (!id) return;

    setIsActionLoading(true);
    try {
      var res = await tagService.deleteTag(id);
      if (res.statusCode === 200) {
        toast.success(res.message);
        deleteConfirmModal.hideModal();
        fetchData();
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <Flex className={style.container}>
      <SectionTitle title="Tag Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={TagManagementCols}
          rows={data}
          rowKey="tagId"
          idName="tagId"
          title={
            <TableTitle
              onSearch={handleSearch}
              noFilter
              addLabel="Add New Tag"
              onAdd={() => formModal.showModal()}
            />
          }
          handleSortClick={handleSortChange}
          selectedColumn={sortField}
          sortDirection={sortDirection}
          rotation={rotation}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          isViewCheckbox={false}
          isLoading={isLoading}
          caption="Tag Management Board"
          notifyNoData="No tags to display"
          renderAction={(tag: GetTag) => (
            <ActionMenuTag
              onEdit={() => formModal.showModal(tag)}
              onDelete={() => deleteConfirmModal.showModal({ id: tag.tagId })}
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
        <TagModal
          isOpen={formModal.modalState.visible}
          onClose={handleCancelConfirm}
          onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
          isLoadingAction={formModal.modalState.data ? isUpdating : isAdding}
          tagData={formModal.modalState.data}
        />
        {/* Confirm Delete Modal */}
        <ConfirmModal
          visible={deleteConfirmModal.modalState.visible}
          onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.id)}
          onCancel={deleteConfirmModal.hideModal}
          itemName="Tag"
          actionType="delete"
        />
        {/* Confirm Update Modal */}
        <ConfirmModal
          visible={updateConfirmModal.modalState.visible}
          onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.tag)}
          onCancel={updateConfirmModal.hideModal}
          itemName="Tag"
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
    </Flex>
  );
}

export default TagManagement;
