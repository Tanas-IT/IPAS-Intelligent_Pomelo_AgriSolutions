import { useFetchData, useFilters, useModal } from "@/hooks";
import style from "./EmployeeList.module.scss";
import { GetEmployee } from "@/payloads";
import { employeeService } from "@/services";
import { useEffect } from "react";
import { FilterEmployeeState } from "@/types";
import { DEFAULT_EMPLOYEE_FILTERS, getOptions } from "@/utils";
import { Flex } from "antd";
import {
  ActionMenuEmployee,
  ConfirmModal,
  NavigationDot,
  SectionTitle,
  Table,
  TableTitle,
} from "@/components";
import { EmployeeColumns } from "./EmployeeColumns";
import EmployeeFilter from "./EmployeeFilter";
import { toast } from "react-toastify";
import AddEmployeeModel from "./AddEmployeeModal";
function EmployeeList() {
  const addEmployeeModal = useModal<{ userId: number }>();

  const { filters, updateFilters, applyFilters, clearFilters } = useFilters<FilterEmployeeState>(
    DEFAULT_EMPLOYEE_FILTERS,
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
  } = useFetchData<GetEmployee>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      employeeService.getEmployeeList(page, limit, sortField, sortDirection, searchValue, filters),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue]);

  const handleUpdateRole = async (userId: number, newRole: string) => {
    var res = await employeeService.updateRole(userId, newRole);

    if (res.statusCode === 200) {
      toast.success(res.message);
      await fetchData();
    } else {
      toast.error(res.message);
    }
  };

  const handleAdd = async (userId: number) => {
    console.log(userId);
  };

  const filterContent = (
    <EmployeeFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={clearFilters}
      onApply={applyFilters}
    />
  );

  return (
    <Flex className={style.container}>
      <SectionTitle title="Employee Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={EmployeeColumns}
          rows={data}
          rowKey="userId"
          idName="userId"
          title={
            <TableTitle
              onSearch={handleSearch}
              filterContent={filterContent}
              addLabel="Add New Employee"
              onAdd={addEmployeeModal.showModal}
            />
          }
          handleSortClick={handleSortChange}
          selectedColumn={sortField}
          sortDirection={sortDirection}
          rotation={rotation}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          isLoading={isLoading}
          caption="Employee Management Board"
          notifyNoData="No employees to display"
          isViewCheckbox={false}
          renderAction={(em: GetEmployee) => (
            <ActionMenuEmployee employee={em} onConfirmUpdate={handleUpdateRole} />
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
        <AddEmployeeModel
          isOpen={addEmployeeModal.modalState.visible}
          onClose={addEmployeeModal.hideModal}
          onSave={handleAdd} // Truyền đúng userId
          isLoadingAction={false}
        />
      </Flex>
    </Flex>
  );
}

export default EmployeeList;
