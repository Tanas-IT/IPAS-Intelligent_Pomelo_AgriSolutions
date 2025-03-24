import { Flex } from "antd";
import style from "./PlanList.module.scss";
import { ActionMenuPlant, ConfirmModal, NavigationDot, SectionTitle, Table } from "@/components";
import { GetPlant } from "@/payloads";
import { useFetchData, useModal, useTableDelete } from "@/hooks";
import { useEffect, useState } from "react";
import { getOptions } from "@/utils";
import { planService } from "@/services";
import ActionMenuPlan from "@/components/UI/ActionMenu/ActionMenuPlan";
import PlanFilter from "./PlanFilter";
import { planColumns } from "./PlanColumn";
import { TableTitle } from "./TableTitle";
import { GetPlan } from "@/payloads/plan";
import { toast } from "react-toastify";


function PlanList() {
  const [filters, setFilters] = useState({
    createDateFrom: "",
    createDateTo: "",
    growStages: [] as string[],
    processTypes: [] as string[],
    status: [] as string[],
    frequency: [] as string[],
    isActive: [] as string[],
    assignor: [] as string[],
  });
  const deleteConfirmModal = useModal<{ ids: number[]  }>();

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
  } = useFetchData<GetPlan>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      planService.getPlans(page, limit, sortField, sortDirection, searchValue, filters),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, searchValue, filters]);

  const { handleDelete } = useTableDelete(
      {
        deleteFunction: planService.deletePlan,
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

  const updateFilters = (key: string, value: any) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      return newFilters;
    });
  };

  const handleApply = () => {
    console.log("Applying filters:", filters);
    fetchData();
  };

  const handleClear = () => {
    setFilters({
      createDateFrom: "",
      createDateTo: "",
      growStages: [],
      processTypes: [],
      status: [],
      frequency: [],
      isActive: [],
      assignor: [],
    });
  };



  const filterContent = (
    <PlanFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={handleClear}
      onApply={handleApply}
    />
  );

  return (
    <Flex className={style.container}>
      <SectionTitle title="Plan Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={planColumns}
          rows={data}
          rowKey="planCode"
          idName="planId"
          title={<TableTitle onSearch={handleSearch} filterContent={filterContent} />}
          handleSortClick={handleSortChange}
          selectedColumn={sortField}
          rotation={rotation}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          handleDelete={(ids) => handleDelete(ids)}
          isLoading={isLoading}
          caption="Plan Management Table"
          notifyNoData="No data to display"
          renderAction={(plan: GetPlan) => (
            <ActionMenuPlan
              id={plan.planId}
              onDelete={() => deleteConfirmModal.showModal({ ids: [plan.planId] })}
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
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.ids)}
        onCancel={deleteConfirmModal.hideModal}
        itemName="Plan"
        actionType="delete"
      />
    </Flex>
  );
}

export default PlanList;
