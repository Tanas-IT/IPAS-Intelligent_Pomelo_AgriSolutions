import { Flex } from "antd";
import style from "./ProcessList.module.scss";
import { ActionMenuPlant, NavigationDot, SectionTitle, Table } from "@/components";
import { GetPlant } from "@/payloads";
import { useFetchData } from "@/hooks";
import { useEffect, useState } from "react";
import { getOptions } from "@/utils";
import { processService, userService } from "@/services";
import { GetProcess } from "@/payloads/process";
import { processColumns } from "./ProcessColumns";
import ActionMenuProcess from "@/components/UI/ActionMenu/ActionMenuProcess/ActionMenuProcess";
import ProcessFilter from "./ProcessFilter";
import { TableTitle } from "./TableTitle";


function ProcessList() {
  const [filters, setFilters] = useState({
    createDateFrom: "",
    createDateTo: "",
    growthStages: [] as string[],
    processTypes: [] as string[],
    status: [] as string[],
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
  } = useFetchData<GetProcess>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      processService.getProcesses(page, limit, sortField, sortDirection, searchValue, "21", filters),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, searchValue]);

  const updateFilters = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    fetchData();
  };

  const handleClear = () => {
    setFilters({
      createDateFrom: "",
      createDateTo: "",
      growthStages: [],
      processTypes: [],
      status: [],
    });
  };

  const filterContent = (
    <ProcessFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={handleClear}
      onApply={handleApply}
    />
  );

  const fakeData: GetProcess[] = [
    {
      processId: 1,
      processCode: "P-001",
      processName: "Planting Process for Pomelo Tree",
      isDefault: true,
      isActive: true,
      createDate: new Date("2023-01-01"),
      updateDate: new Date("2023-12-01"),
      isDeleted: false,
      farmName: "F-001",
      processStyleName: "ST-001",
      growthStageName: "GS-001",
    },
    {
      processId: 2,
      processCode: "P-002",
      processName: "Caring Process for Pomelo Tree",
      isDefault: false,
      isActive: true,
      createDate: new Date("2022-11-15"),
      updateDate: new Date("2023-10-10"),
      isDeleted: false,
      farmName: "F-002",
      processStyleName: "ST-002",
      growthStageName: "GS-002",
    },
    {
      processId: 3,
      processCode: "P-003",
      processName: "Harvesting Process for Pomelo Tree",
      isDefault: false,
      isActive: false,
      createDate: new Date("2022-06-20"),
      updateDate: new Date("2023-09-30"),
      isDeleted: true,
      farmName: "F-003",
      processStyleName: "ST-003",
      growthStageName: "GS-003",
    },
    {
      processId: 4,
      processCode: "P-004",
      processName: "Grafting Process for Pomelo Tree",
      isDefault: true,
      isActive: false,
      createDate: new Date("2023-05-10"),
      updateDate: new Date("2023-11-05"),
      isDeleted: false,
      farmName: "F-004",
      processStyleName: "ST-004",
      growthStageName: "GS-004",
    }
  ];
  

  return (
    <Flex className={style.container}>
      <SectionTitle title="Process Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={processColumns}
          rows={fakeData}
          rowKey="processCode"
          title={<TableTitle onSearch={handleSearch} filterContent={filterContent} />}
          handleSortClick={handleSortChange}
          selectedColumn={sortField}
          rotation={rotation}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          isLoading={false}
          caption="Process Management Table"
          notifyNoData="No data to display"
          renderAction={(process: GetProcess) => <ActionMenuProcess id={process.processId} />}
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

export default ProcessList;
