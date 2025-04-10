import {
  ActionMenuRow,
  ConfirmModal,
  NavigationDot,
  SectionTitle,
  Table,
  TableTitle,
} from "@/components";
import { useFetchData, useFilters, useLandPlotOptions, useModal, useTableDelete } from "@/hooks";
import { GetLandRow } from "@/payloads";
import { landRowService } from "@/services";
import { DEFAULT_LAND_ROW_FILTERS, getOptions } from "@/utils";
import { Flex, Segmented, Select } from "antd";
import { useEffect, useState } from "react";
import style from "./LandRow.module.scss";
import { Icons } from "@/assets";
import { VIEW_MODE } from "@/constants";
import { FilterLandRowState } from "@/types";
import { useLocation } from "react-router-dom";
import { LandRowColumns } from "./LandRowColumns";
import AddPlantsModal from "./AddPlantsModal";
import ViewPlantsModal from "./ViewPlantsModal";
import LandRowFilter from "./LandRowFilter";
import SimulationView from "./SimulationView";

function LandRow() {
  const location = useLocation();
  const { options: plotOptions } = useLandPlotOptions();
  const addPlantsModal = useModal<{ row: GetLandRow }>();
  const viewPlantsModal = useModal<{ id: number }>();
  const deleteConfirmModal = useModal<{ ids: number[] }>();
  const [plotId, setPlotId] = useState<number>();
  const [viewMode, setViewMode] = useState<string>(VIEW_MODE.TABLE);
  const viewOptions = [
    { mode: VIEW_MODE.TABLE, icon: <Icons.table /> },
    { mode: VIEW_MODE.SIMULATION, icon: <Icons.map /> },
  ];

  useEffect(() => {
    if (location.state?.plotId) {
      setViewMode(VIEW_MODE.SIMULATION);
      setPlotId(Number(location.state.plotId));
    }
  }, [location.state]);

  useEffect(() => {
    console.log(plotOptions);

    if (plotOptions.length > 0 && !location.state?.plotId) setPlotId(Number(plotOptions[0].value));
    // if (plotOptions.length > 0 && !location.state?.plotId) setPlotId(9);
  }, [plotOptions, location.state]);

  const { filters, updateFilters, applyFilters, clearFilters } = useFilters<FilterLandRowState>(
    DEFAULT_LAND_ROW_FILTERS,
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
  } = useFetchData<GetLandRow>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      landRowService.getLandRows(
        page,
        limit,
        sortField,
        sortDirection,
        searchValue,
        plotId,
        filters,
      ),
  });

  useEffect(() => {
    if (plotId) fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue, plotId]);

  const handlePlotChange = (selectedPlotId: number) => {
    setPlotId(selectedPlotId);
  };

  const { handleDelete } = useTableDelete(
    {
      deleteFunction: landRowService.deleteLandRows,
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
    <LandRowFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={clearFilters}
      onApply={applyFilters}
    />
  );

  return (
    <Flex className={style.container}>
      <Flex className={style.header}>
        <SectionTitle title="Land Row Management" totalRecords={totalRecords} />
        <Flex className={style.controls}>
          <Select
            placeholder="Select Plot"
            options={plotOptions}
            className={style.controlSelect}
            value={plotId}
            onChange={(value) => handlePlotChange(Number(value))}
          />
          <Segmented
            className={style.segment}
            options={viewOptions.map(({ mode, icon }) => ({
              label: mode,
              value: mode,
              icon,
            }))}
            value={viewMode}
            onChange={(value) => setViewMode(value as string)}
          />
        </Flex>
      </Flex>

      <Flex className={style.content}>
        {viewMode === VIEW_MODE.TABLE ? (
          <Table
            columns={LandRowColumns}
            rows={data}
            rowKey="landRowCode"
            idName="landRowId"
            title={
              <TableTitle onSearch={handleSearch} filterContent={filterContent} noAdd={true} />
            }
            handleSortClick={handleSortChange}
            selectedColumn={sortField}
            sortDirection={sortDirection}
            rotation={rotation}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            handleDelete={(ids) => handleDelete(ids)}
            isLoading={isLoading}
            caption="Land Row Management Board"
            notifyNoData="No rows to display"
            renderAction={(row: GetLandRow) => (
              <ActionMenuRow
                id={row.landRowId}
                onAddPlants={() => addPlantsModal.showModal({ row: row })}
                onViewPlants={() => viewPlantsModal.showModal({ id: row.landRowId })}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            )}
          />
        ) : (
          <SimulationView plotId={plotId} />
        )}
      </Flex>

      {viewMode === VIEW_MODE.TABLE && (
        <NavigationDot
          totalPages={totalPages}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          rowsPerPageOptions={getOptions(totalRecords)}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}

      <AddPlantsModal
        isOpen={addPlantsModal.modalState.visible}
        onClose={() => addPlantsModal.hideModal()}
        onSave={() => {}}
        rowData={addPlantsModal.modalState.data?.row}
        isLoadingAction={false}
      />
      <ViewPlantsModal
        isOpen={viewPlantsModal.modalState.visible}
        onClose={() => viewPlantsModal.hideModal()}
        rowId={viewPlantsModal.modalState.data?.id}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.ids)}
        onCancel={deleteConfirmModal.hideModal}
        itemName="Plant"
        actionType="delete"
      />
    </Flex>
  );
}

export default LandRow;
