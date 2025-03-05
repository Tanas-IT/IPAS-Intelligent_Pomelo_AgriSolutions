import { ActionMenuRow, NavigationDot, SectionTitle, Table, TableTitle } from "@/components";
import { useFetchData, useLandPlotOptions, useModal } from "@/hooks";
import { GetLandPlotSimulate, GetLandRow } from "@/payloads";
import { landPlotService, landRowService } from "@/services";
import { getOptions } from "@/utils";
import { Flex, Segmented, Select } from "antd";
import { useEffect, useState } from "react";
import { LandRowColumns } from "./LandRowColumns";
import style from "./LandRow.module.scss";
import { Icons } from "@/assets";
import { VIEW_MODE } from "@/constants";
import SimulationView from "./SimulationView";
import { useLocation } from "react-router-dom";
import AddPlantsModal from "./AddPlantsModal";
import ViewPlantsModal from "./ViewPlantsModal";

function LandRow() {
  const location = useLocation();
  const { options: plotOptions } = useLandPlotOptions();
  const addPlantsModal = useModal<{ row: GetLandRow }>();
  const viewPlantsModal = useModal<{ id: number }>();
  const [plotId, setPlotId] = useState<number>();
  const [plotData, setPlotData] = useState<GetLandPlotSimulate>();
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
    // if (plotOptions.length > 0 && !location.state?.plotId) setPlotId(Number(plotOptions[0].value));
    if (plotOptions.length > 0 && !location.state?.plotId) setPlotId(10);
  }, [plotOptions, location.state]);

  useEffect(() => {
    const fetchPlotData = async () => {
      if (plotId) {
        const res = await landPlotService.getLandPlotSimulate(plotId);
        if (res.statusCode === 200) {
          setPlotData(res.data);
        }
      }
    };

    fetchPlotData();
  }, [plotId]);

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
      landRowService.getLandRows(page, limit, sortField, sortDirection, searchValue, plotId),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue, plotId]);

  const handlePlotChange = (selectedPlotId: number) => {
    setPlotId(selectedPlotId);
  };

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
            title={<TableTitle onSearch={handleSearch} addLabel="Add New Row" onAdd={() => {}} />}
            handleSortClick={handleSortChange}
            selectedColumn={sortField}
            sortDirection={sortDirection}
            rotation={rotation}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
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
          <SimulationView plotData={plotData} />
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
    </Flex>
  );
}

export default LandRow;
