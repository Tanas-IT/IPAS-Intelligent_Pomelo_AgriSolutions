import { Flex } from "antd";
import style from "./PlanList.module.scss";
import { ActionMenuPlant, NavigationDot, SectionTitle, Table } from "@/components";
import { GetPlant } from "@/payloads";
import { useFetchData } from "@/hooks";
import { useEffect, useState } from "react";
import { getOptions } from "@/utils";
import { planService } from "@/services";
import ActionMenuPlan from "@/components/UI/ActionMenu/ActionMenuPlan/ActionMenuPlan";
import PlanFilter from "./PlanFilter";
import { planColumns } from "./PlanColumn";
import { TableTitle } from "./TableTitle";
import { GetPlan } from "@/payloads/plan";


function PlanList() {
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
    isInitialLoad,
  } = useFetchData<GetPlan>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      planService.getPlans(page, limit, sortField, sortDirection, searchValue, "21", filters),
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
    <PlanFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={handleClear}
      onApply={handleApply}
    />
  );

  const fakeData: GetPlan[] = [
    {
      planId: 1,
      status: "Active",
      planCode: "P-001",
      createDate: new Date("2023-01-01"),
      startDate: new Date("2023-01-01"),
      endDate: new Date("2023-12-01"),
      updateDate: new Date("2023-12-01"),
      isActive: true,
      notes: "Initial planting process for Pomelo trees.",
      planDetail: "Planting Pomelo trees with required spacing and soil preparation.",
      responsibleBy: "John Doe",
      frequency: "Yearly",
      plantId: 101,
      landPlotId: 1001,
      assignorId: 201,
      pesticideName: "Pesticide A",
      maxVolume: 50,
      minVolume: 10,
      processId: 1,
      cropId: 301,
      growthStageId: 401,
      plantLotId: 501,
      isDelete: false,
      masterTypeId: 601,
      farmId: "F-001"
    },
    {
      planId: 2,
      status: "Inactive",
      planCode: "P-002",
      createDate: new Date("2022-11-15"),
      startDate: new Date("2022-11-15"),
      endDate: new Date("2023-10-10"),
      updateDate: new Date("2023-10-10"),
      isActive: false,
      notes: "Caring process for Pomelo trees.",
      planDetail: "Maintain tree health and growth with appropriate care methods.",
      responsibleBy: "Jane Smith",
      frequency: "Monthly",
      plantId: 102,
      landPlotId: 1002,
      assignorId: 202,
      pesticideName: "Pesticide B",
      maxVolume: 60,
      minVolume: 15,
      processId: 2,
      cropId: 302,
      growthStageId: 402,
      plantLotId: 502,
      isDelete: false,
      masterTypeId: 602,
      farmId: "F-002"
    },
    {
      planId: 3,
      status: "Deleted",
      planCode: "P-003",
      createDate: new Date("2022-06-20"),
      startDate: new Date("2022-06-20"),
      endDate: new Date("2023-09-30"),
      updateDate: new Date("2023-09-30"),
      isActive: false,
      notes: "Harvesting process for Pomelo trees.",
      planDetail: "Harvesting ripe Pomelo fruits from the trees.",
      responsibleBy: "Alice Brown",
      frequency: "Once a year",
      plantId: 103,
      landPlotId: 1003,
      assignorId: 203,
      pesticideName: "Pesticide C",
      maxVolume: 70,
      minVolume: 20,
      processId: 3,
      cropId: 303,
      growthStageId: 403,
      plantLotId: 503,
      isDelete: true,
      masterTypeId: 603,
      farmId: "F-003"
    },
    {
      planId: 4,
      status: "Inactive",
      planCode: "P-004",
      createDate: new Date("2023-05-10"),
      startDate: new Date("2023-05-10"),
      endDate: new Date("2023-11-05"),
      updateDate: new Date("2023-11-05"),
      isActive: false,
      notes: "Grafting process for Pomelo trees.",
      planDetail: "Graft selected Pomelo varieties onto rootstock.",
      responsibleBy: "Bob White",
      frequency: "Bi-annually",
      plantId: 104,
      landPlotId: 1004,
      assignorId: 204,
      pesticideName: "Pesticide D",
      maxVolume: 80,
      minVolume: 30,
      processId: 4,
      cropId: 304,
      growthStageId: 404,
      plantLotId: 504,
      isDelete: false,
      masterTypeId: 604,
      farmId: "F-004"
    }
  ];
  
  

  return (
    <Flex className={style.container}>
      <SectionTitle title="Process Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={planColumns}
          rows={fakeData}
          rowKey="planCode"
          title={<TableTitle onSearch={handleSearch} filterContent={filterContent} />}
          handleSortClick={handleSortChange}
          selectedColumn={sortField}
          rotation={rotation}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          isLoading={false}
          isInitialLoad={isInitialLoad}
          caption="Prlan Management Table"
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
