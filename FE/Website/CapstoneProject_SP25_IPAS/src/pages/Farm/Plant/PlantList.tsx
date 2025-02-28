import { Flex } from "antd";
import style from "./PlantList.module.scss";
import { ActionMenuPlant, NavigationDot, SectionTitle, Table } from "@/components";
import { GetPlant, PlantRequest } from "@/payloads";
import { useFetchData, useFilters, useModal } from "@/hooks";
import { useEffect, useState } from "react";
import { DEFAULT_PLANT_FILTERS, getOptions } from "@/utils";
import { plantService, userService } from "@/services";
import PlantFilter from "./PlantFilter";
import { plantColumns } from "./PlantColumns";
import { TableTitle } from "./TableTitle";
import { ExpandedColumns } from "./ExpandedColumns";
import { Farm, FilterPlantState } from "@/types";

function PlantList() {
  const formModal = useModal<GetPlant>();
  const deleteConfirmModal = useModal<{ ids: number[] | string[] }>();
  const updateConfirmModal = useModal<{ stage: PlantRequest }>();
  const cancelConfirmModal = useModal();

  const { filters, updateFilters, applyFilters, clearFilters } = useFilters<FilterPlantState>(
    DEFAULT_PLANT_FILTERS,
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
  } = useFetchData<GetPlant>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      plantService.getPlantList(page, limit, sortField, sortDirection, searchValue, filters),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue]);

  // const { handleDelete } = useTableDelete(
  //   {
  //     deleteFunction: masterTypeService.deleteMasterTypes,
  //     fetchData,
  //     onSuccess: () => {
  //       deleteConfirmModal.hideModal();
  //     },
  //   },
  //   {
  //     currentPage,
  //     rowsPerPage,
  //     totalRecords,
  //     handlePageChange,
  //   },
  // );

  const filterContent = (
    <PlantFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={clearFilters}
      onApply={applyFilters}
    />
  );

  return (
    <Flex className={style.container}>
      <SectionTitle title="Plant Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={plantColumns}
          rows={data}
          rowKey="plantCode"
          title={<TableTitle onSearch={handleSearch} filterContent={filterContent} />}
          handleSortClick={handleSortChange}
          selectedColumn={sortField}
          sortDirection={sortDirection}
          rotation={rotation}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          isLoading={isLoading}
          caption="Plant Management Board"
          notifyNoData="No plants to display"
          renderAction={(plant: GetPlant) => <ActionMenuPlant id={plant.plantId} />}
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

export default PlantList;
