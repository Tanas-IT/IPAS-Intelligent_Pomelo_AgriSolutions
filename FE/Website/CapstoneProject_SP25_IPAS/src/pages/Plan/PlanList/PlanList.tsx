import { Flex } from "antd";
import style from "./PlanList.module.scss";
import { ActionMenuPlant, NavigationDot, SectionTitle, Table } from "@/components";
import { GetPlant } from "@/payloads";
import { useFetchData } from "@/hooks";
import { useEffect, useState } from "react";
import { getOptions } from "@/utils";
import { planService } from "@/services";
import ActionMenuPlan from "@/components/UI/ActionMenu/ActionMenuPlan";
import PlanFilter from "./PlanFilter";
import { planColumns } from "./PlanColumn";
import { TableTitle } from "./TableTitle";
import { GetPlan } from "@/payloads/plan";


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
          title={<TableTitle onSearch={handleSearch} filterContent={filterContent} />}
          handleSortClick={handleSortChange}
          selectedColumn={sortField}
          rotation={rotation}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          isLoading={false}
          caption="Plan Management Table"
          notifyNoData="No data to display"
          renderAction={(plan: GetPlan) => <ActionMenuPlan id={plan.planId} />}
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
    </Flex>
  );
}

export default PlanList;
