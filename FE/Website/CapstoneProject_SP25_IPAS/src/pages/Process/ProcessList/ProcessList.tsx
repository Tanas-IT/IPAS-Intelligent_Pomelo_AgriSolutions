import { Flex } from "antd";
import style from "./ProcessList.module.scss";
import { ActionMenuPlant, NavigationDot, SectionTitle, Table } from "@/components";
import { GetPlant } from "@/payloads";
import { useFetchData, useModal, useTableAdd } from "@/hooks";
import { useEffect, useState } from "react";
import { getOptions } from "@/utils";
import { processService, userService } from "@/services";
import { GetProcess, GetProcessList } from "@/payloads/process";
import { processColumns } from "./ProcessColumns";
import ActionMenuProcess from "@/components/UI/ActionMenu/ActionMenuProcess";
import ProcessFilter from "./ProcessFilter";
import TableTitle from "./TableTitle";
import ProcessModal from "./AddProcessModal";


function ProcessList() {
  const formModal = useModal<GetProcessList>();
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
  } = useFetchData<GetProcessList>({
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

  const { handleAdd } = useTableAdd({
      addService: processService.createProcess,
      fetchData: fetchData,
      onSuccess: () => formModal.hideModal(),
    });

  const filterContent = (
    <ProcessFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={handleClear}
      onApply={handleApply}
    />
  );

  return (
    <Flex className={style.container}>
      <SectionTitle title="Process Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={processColumns}
          rows={data}
          rowKey="processCode"
          title={<TableTitle onSearch={handleSearch} filterContent={filterContent} addLabel="Add New Type" onAdd={() => formModal.showModal()} />}
          handleSortClick={handleSortChange}
          selectedColumn={sortField}
          rotation={rotation}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          isLoading={false}
          caption="Process Management Table"
          notifyNoData="No data to display"
          renderAction={(process: GetProcessList) => <ActionMenuProcess id={process.processId} />}
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
      <ProcessModal 
      isOpen={formModal.modalState.visible}
      onClose={formModal.hideModal}
      onSave={handleAdd} />
    </Flex>
  );
}

export default ProcessList;
