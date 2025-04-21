import { useFetchData, useFilters, useModal, useTableDelete } from "@/hooks";
import style from "./EmployeeList.module.scss";
import { AddUserFarmRequest, GetEmployee, Skill } from "@/payloads";
import { employeeService } from "@/services";
import { useEffect, useState } from "react";
import { FilterEmployeeState } from "@/types";
import { DEFAULT_EMPLOYEE_FILTERS, getFarmId, getOptions } from "@/utils";
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
import { ROLE } from "@/constants";
import EditEmployeeSkillsModal from "./EditEmployeeSkillsModal";
function EmployeeList() {
  const [isAddLoading, setIsAddLoading] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const addEmployeeModal = useModal<{ userId: number }>();
  const editSkillsModal = useModal<{ employee: GetEmployee }>();
  const deleteConfirmModal = useModal<{ ids: number[] }>();

  const { filters, updateFilters, applyFilters, clearFilters } = useFilters<FilterEmployeeState>(
    DEFAULT_EMPLOYEE_FILTERS,
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
  } = useFetchData<GetEmployee>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      employeeService.getEmployeeList(page, limit, sortField, sortDirection, searchValue, filters),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue]);
console.log("data", data);

const handleUpdateEmployee = async (
  userId: number,
  newRole?: string,
  isActive?: boolean,
  skills?: Skill[]
) => {
  try {
    setIsUpdateLoading(true);
    const farmId = Number(getFarmId());
    const request: AddUserFarmRequest = {
      farmId,
      userId,
      roleName: newRole ?? ROLE.EMPLOYEE,
      isActive: isActive ?? true,
      skills: skills ?? [],
    };
    console.log("ré update", request);
    

    const res = await employeeService.updateEmployee(request);
    console.log("res update", res);
    
    if (res.statusCode === 200) {
      if (newRole) {
        toast.success(`User role updated to ${newRole}`);
      } else if (isActive !== undefined) {
        toast.success(`User has been ${isActive ? "activated" : "deactivated"}`);
      } else if (skills) {
        toast.success("Employee skills updated successfully");
        editSkillsModal.hideModal();
      }
      await fetchData();
    } else {
      toast.error(res.message || "Failed to update employee");
    }
  } catch (error) {
    toast.error("An error occurred while updating the employee");
  } finally {
    setIsUpdateLoading(false);
  }
};

  const handleAdd = async (userId: number, skills: Skill[]) => {
    try {
      setIsAddLoading(true);
      const farmId = Number(getFarmId());
      const request: AddUserFarmRequest = {
        farmId,
        userId,
        roleName: ROLE.EMPLOYEE,
        isActive: true,
        skills
      };

      const res = await employeeService.addNewUserInFarm(request);
      if (res.statusCode === 200 || res.statusCode === 201) {
        toast.success(res.message || "Employee added successfully");
        addEmployeeModal.hideModal();
        await fetchData();
      } else {
        toast.error(res.message || "Failed to add employee");
      }
    } catch (error) {
      toast.error("An error occurred while adding the employee");
    } finally {
      setIsAddLoading(false);
    }
  };

  const { handleDelete } = useTableDelete(
    {
      deleteFunction: employeeService.deleteUserInFarm,
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
            <ActionMenuEmployee
              employee={em}
              onConfirmUpdate={handleUpdateEmployee}
              onEditSkills={() => editSkillsModal.showModal({ employee: em })}
              onDelete={() => deleteConfirmModal.showModal({ ids: [em.userId] })}
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
        <AddEmployeeModel
          isOpen={addEmployeeModal.modalState.visible}
          onClose={addEmployeeModal.hideModal}
          onSave={handleAdd}
          isLoadingAction={isAddLoading}
        />
        <EditEmployeeSkillsModal
          isOpen={editSkillsModal.modalState.visible}
          onClose={editSkillsModal.hideModal}
          onSave={(skills) =>
            handleUpdateEmployee(
              editSkillsModal.modalState.data?.employee.userId ?? 0,
              undefined,
              undefined,
              skills
            )
          }
          initialSkills={editSkillsModal.modalState.data?.employee.skills ?? []}
          isLoadingAction={isUpdateLoading}
        />
        {/* Confirm Delete Modal */}
        <ConfirmModal
          visible={deleteConfirmModal.modalState.visible}
          onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.ids)}
          onCancel={deleteConfirmModal.hideModal}
          itemName="Employee"
          actionType="delete"
        />
      </Flex>
    </Flex>
  );
}

export default EmployeeList;
