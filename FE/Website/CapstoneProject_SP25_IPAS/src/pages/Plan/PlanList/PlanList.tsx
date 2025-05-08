import { Flex } from "antd";
import style from "./PlanList.module.scss";
import { ActionMenuPlan, ConfirmModal, NavigationDot, SectionTitle, Table } from "@/components";
import { useFetchData, useFilters, useModal, useTableDelete } from "@/hooks";
import { useEffect } from "react";
import { DEFAULT_PLAN_FILTERS, getOptions } from "@/utils";
import { planService } from "@/services";
import PlanFilter from "./PlanFilter";
import { planColumns } from "./PlanColumn";
import { TableTitle } from "./TableTitle";
import { GetPlan } from "@/payloads/plan";
import { FilterPlanState } from "@/types";
import { ROUTES } from "@/constants";
import { useNavigate } from "react-router-dom";

function PlanList() {
  const deleteConfirmModal = useModal<{ ids: number[] }>();
  const navigate = useNavigate();

  const { filters, updateFilters, applyFilters, clearFilters } = useFilters<FilterPlanState>(
    DEFAULT_PLAN_FILTERS,
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
  } = useFetchData<GetPlan>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      planService.getPlans(page, limit, sortField, sortDirection, searchValue, filters),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue]);

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

  const filterContent = (
    <PlanFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={clearFilters}
      onApply={applyFilters}
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
          isOnRowEvent={true}
          onRowDoubleClick={(record) => navigate(ROUTES.PLAN_DETAIL(record.planId))}
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
