import { Flex } from "antd";
import style from "./PackageList.module.scss";
import { ActionMenuPlant, NavigationDot, SectionTitle, Table } from "@/components";
import { GetPlant } from "@/payloads";
import { useFetchData } from "@/hooks";
import { useEffect, useState } from "react";
import { getOptions } from "@/utils";
import { packageService, planService } from "@/services";
// import ActionMenuPlan from "@/components/UI/ActionMenu/ActionMenuPlan/ActionMenuPlan";
import { GetPlan } from "@/payloads/plan";
import PackageFilter from "./PackageFilter";
import { packageColumns } from "./PackageColumns";
import { TableTitle } from "./TableTitle";
import { GetPackage } from "@/payloads/package";
import ActionMenuPlan from "@/components/UI/ActionMenu/ActionMenuPlan";


function PackageList() {
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
  } = useFetchData<GetPackage>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      packageService.getPackage(page, limit, sortField, sortDirection, searchValue, filters),
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
    <PackageFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={handleClear}
      onApply={handleApply}
    />
  );

  return (
    <Flex className={style.container}>
      <SectionTitle title="Package Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={packageColumns}
          rows={data}
          rowKey="packageCode"
          title={<TableTitle onSearch={handleSearch} filterContent={filterContent} />}
          handleSortClick={handleSortChange}
          selectedColumn={sortField}
          rotation={rotation}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          isLoading={false}
          caption="Package Management Table"
          notifyNoData="No data to display"
          // renderAction={(packagee: GetPackage) => <ActionMenuPlan id={packagee.packageId} />}
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

export default PackageList;
