import { useFetchData, useFilters, useHasChanges, useModal, useTableDelete } from "@/hooks";
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

  const areSkillsChanged = (oldSkills: Skill[], newSkills: Skill[]) => {
    if (!oldSkills.length && !newSkills.length) return false; // cả 2 đều rỗng

    const sortedOld = [...oldSkills].sort((a, b) => a.skillID - b.skillID);
    const sortedNew = [...newSkills].sort((a, b) => a.skillID - b.skillID);

    return JSON.stringify(sortedOld) !== JSON.stringify(sortedNew);
  };

  const handleUpdateEmployee = async (userId: number, newRole?: string, isActive?: boolean) => {
    try {
      const farmId = Number(getFarmId());

      setIsUpdateLoading(true);
      const request: AddUserFarmRequest = {
        farmId,
        userId,
        roleName: newRole ?? ROLE.EMPLOYEE,
        isActive: isActive ?? true,
      };

      const res = await employeeService.updateEmployee(request);

      if (res.statusCode === 200) {
        if (newRole) {
          toast.success(`User role updated to ${newRole}`);
        } else if (isActive !== undefined) {
          toast.success(`User has been ${isActive ? "activated" : "deactivated"}`);
        }
        await fetchData();
      } else {
        toast.warning(res.message || "Failed to update employee");
      }
    } finally {
      setIsUpdateLoading(false);
    }
  };

  const handleUpdateEmployeeSkills = async (userId: number, skills?: Skill[]) => {
    try {
      const farmId = Number(getFarmId());
      const employee = data.find((emp) => emp.userId === userId);

      if (!employee) return;

      const oldSkills: Skill[] = (employee.skills || []).map((s) => ({
        skillID: s.skillID,
        scoreOfSkill: s.scoreOfSkill,
      }));

      const newSkills = skills ?? [];

      if (!areSkillsChanged(oldSkills, newSkills)) {
        editSkillsModal.hideModal(); // Không thay đổi, đóng form
        return;
      }

      setIsUpdateLoading(true);
      const request: AddUserFarmRequest = {
        farmId,
        userId,
        skills: skills ?? [],
      };

      const res = await employeeService.updateEmployee(request);

      if (res.statusCode === 200) {
        toast.success("Employee skills updated successfully");
        editSkillsModal.hideModal();

        await fetchData();
      } else {
        toast.warning(res.message || "Failed to update employee");
      }
    } finally {
      setIsUpdateLoading(false);
    }
  };

  const handleAdd = async (userId: number, skills?: Skill[]) => {
    try {
      setIsAddLoading(true);
      const farmId = Number(getFarmId());
      const request: AddUserFarmRequest = {
        farmId,
        userId,
        roleName: ROLE.EMPLOYEE,
        isActive: true,
        skills,
      };

      const res = await employeeService.addNewUserInFarm(request);
      if (res.statusCode === 200 || res.statusCode === 201) {
        toast.success(res.message || "Employee added successfully");
        addEmployeeModal.hideModal();
        await fetchData();
      } else {
        toast.warning(res.message || "Failed to add employee");
      }
    } catch (error) {
      toast.warning("An error occurred while adding the employee");
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
            handleUpdateEmployeeSkills(
              editSkillsModal.modalState.data?.employee.userId ?? 0,
              skills,
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
