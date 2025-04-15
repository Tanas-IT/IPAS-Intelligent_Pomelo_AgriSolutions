import {
  useFetchData,
  useFilters,
  useHasChanges,
  useModal,
  useTableAdd,
  useTableDelete,
  useTableUpdate,
} from "@/hooks";
import style from "./Farm.module.scss";
import { GetEmployee, GetFarmInfo, GetUser2, UserRequest } from "@/payloads";
import { employeeService, farmService, userService } from "@/services";
import { useEffect, useState } from "react";
import { FilterEmployeeState, FilterUserState } from "@/types";
import { DEFAULT_EMPLOYEE_FILTERS, DEFAULT_USER_FILTERS, getOptions } from "@/utils";
import { Flex } from "antd";
import {
  ActionMenuEmployee,
  ActionMenuFarm,
  ActionMenuUser,
  ConfirmModal,
  NavigationDot,
  SectionTitle,
  Table,
  TableTitle,
  UserModal,
} from "@/components";
import { toast } from "react-toastify";
import { FarmColumns } from "./FarmColumns";

function Farm() {
  //   const [isActionLoading, setIsActionLoading] = useState(false);
  //   const formModal = useModal<GetUser2>();
  //   const updateConfirmModal = useModal<{ user: UserRequest }>();
  //   const banConfirmModal = useModal<{ ids: number[] }>();
  //   const unbanConfirmModal = useModal<{ ids: number[] }>();
  //   const deleteConfirmModal = useModal<{ ids: number[] }>();
  //   const cancelConfirmModal = useModal();

  //   const { filters, updateFilters, applyFilters, clearFilters } = useFilters<FilterUserState>(
  //     DEFAULT_USER_FILTERS,
  //     () => fetchData(1),
  //   );

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
  } = useFetchData<GetFarmInfo>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      farmService.getFarms(page, limit, sortField, sortDirection, searchValue),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue]);

  //   const { handleDelete } = useTableDelete(
  //     {
  //       deleteFunction: userService.deleteUsers,
  //       fetchData,
  //       onSuccess: () => {
  //         deleteConfirmModal.hideModal();
  //       },
  //     },
  //     {
  //       currentPage,
  //       rowsPerPage,
  //       totalRecords,
  //       handlePageChange,
  //     },
  //   );

  //   const hasChanges = useHasChanges<UserRequest>(data);

  //   const handleUpdateConfirm = (user: UserRequest) => {
  //     if (hasChanges(user, "userId")) {
  //       updateConfirmModal.showModal({ user });
  //     } else {
  //       formModal.hideModal();
  //     }
  //   };

  //   const handleCancelConfirm = (user: UserRequest, isUpdate: boolean) => {
  //     const hasUnsavedChanges = isUpdate ? hasChanges(user, "userId") : hasChanges(user);

  //     if (hasUnsavedChanges) {
  //       cancelConfirmModal.showModal();
  //     } else {
  //       formModal.hideModal();
  //     }
  //   };

  //   const { handleUpdate, isUpdating } = useTableUpdate<UserRequest>({
  //     updateService: userService.updateUser,
  //     fetchData: fetchData,
  //     onSuccess: () => {
  //       formModal.hideModal();
  //       updateConfirmModal.hideModal();
  //     },
  //     onError: () => {
  //       updateConfirmModal.hideModal();
  //     },
  //   });

  //   const { handleAdd, isAdding } = useTableAdd({
  //     addService: userService.createUser,
  //     fetchData: fetchData,
  //     onSuccess: () => formModal.hideModal(),
  //   });

  //   const handleBanUsers = async (ids?: number[] | string[]) => {
  //     if (!ids) return;

  //     setIsActionLoading(true);
  //     try {
  //       var res = await userService.banUsers(ids);
  //       if (res.statusCode === 200) {
  //         toast.success(res.message);
  //         banConfirmModal.hideModal();
  //         fetchData();
  //       }
  //     } finally {
  //       setIsActionLoading(false);
  //     }
  //   };

  //   const handleUnBanUsers = async (ids?: number[] | string[]) => {
  //     if (!ids) return;

  //     setIsActionLoading(true);
  //     try {
  //       var res = await userService.unBanUsers(ids);
  //       if (res.statusCode === 200) {
  //         toast.success(res.message);
  //         unbanConfirmModal.hideModal();
  //         fetchData();
  //       }
  //     } finally {
  //       setIsActionLoading(false);
  //     }
  //   };

  //   const filterContent = (
  //     <UserFilter
  //       filters={filters}
  //       updateFilters={updateFilters}
  //       onClear={clearFilters}
  //       onApply={applyFilters}
  //     />
  //   );

  return (
    <Flex className={style.container}>
      <SectionTitle title="Farm Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={FarmColumns}
          rows={data}
          rowKey="farmCode"
          idName="farmId"
          title={
            <TableTitle
              onSearch={handleSearch}
              //   filterContent={filterContent}
              addLabel="Add New Farm"
              //   onAdd={() => formModal.showModal()}
            />
          }
          handleSortClick={handleSortChange}
          selectedColumn={sortField}
          sortDirection={sortDirection}
          rotation={rotation}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          isViewCheckbox={false}
          //   handleDelete={(ids) => handleDelete(ids)}
          isLoading={isLoading}
          caption="Farm Management Board"
          notifyNoData="No farms to display"
          renderAction={(farm: GetFarmInfo) => (
            <ActionMenuFarm
              farm={farm}
              onEdit={() => {}}
              onDeactivate={() => {}}
              onActivate={() => {}}
              onDelete={() => {}}
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
        {/* <UserModal
          isOpen={formModal.modalState.visible}
          onClose={handleCancelConfirm}
          onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
          isLoadingAction={formModal.modalState.data ? isUpdating : isAdding}
          userData={formModal.modalState.data}
        /> */}
        {/* Confirm Delete Modal */}
        {/* <ConfirmModal
          visible={deleteConfirmModal.modalState.visible}
          onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.ids)}
          onCancel={deleteConfirmModal.hideModal}
          itemName="User"
          actionType="delete"
        /> */}
        {/* Confirm Update Modal */}
        {/* <ConfirmModal
          visible={updateConfirmModal.modalState.visible}
          onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.user)}
          onCancel={updateConfirmModal.hideModal}
          itemName="User"
          actionType="update"
        />
        <ConfirmModal
          visible={banConfirmModal.modalState.visible}
          onConfirm={() => handleBanUsers(banConfirmModal.modalState.data?.ids)}
          onCancel={banConfirmModal.hideModal}
          itemName="selected user(s)"
          title="Ban Users"
          description={`Are you sure you want to ban ${
            banConfirmModal.modalState.data?.ids.length || 0
          } user(s)? They will not be able to access the system.`}
          confirmText="Ban"
          isDanger
        /> */}

        {/* <ConfirmModal
          visible={unbanConfirmModal.modalState.visible}
          onConfirm={() => handleUnBanUsers(unbanConfirmModal.modalState.data?.ids)}
          onCancel={unbanConfirmModal.hideModal}
          itemName="selected user(s)"
          title="Unban Users"
          description={`Are you sure you want to unban ${
            unbanConfirmModal.modalState.data?.ids.length || 0
          } user(s)? They will regain access to the system.`}
          confirmText="Unban"
        /> */}
        {/* Confirm Cancel Modal */}
        {/* <ConfirmModal
          visible={cancelConfirmModal.modalState.visible}
          actionType="unsaved"
          onConfirm={() => {
            cancelConfirmModal.hideModal();
            formModal.hideModal();
          }}
          onCancel={cancelConfirmModal.hideModal}
        /> */}
      </Flex>
    </Flex>
  );
}

export default Farm;
