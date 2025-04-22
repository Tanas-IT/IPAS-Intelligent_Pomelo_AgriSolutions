import { Flex } from "antd";
import style from "./PlantList.module.scss";
import {
  ActionMenuPlant,
  ApplyPlantCriteriaModal,
  ConfirmModal,
  NavigationDot,
  PlantMarkAsDeadModal,
  SectionTitle,
  Table,
  TableTitle,
  PlantModal,
} from "@/components";
import { GetPlant, PlantCriteriaApplyRequest, PlantRequest } from "@/payloads";
import {
  useFetchData,
  useFilters,
  useHasChanges,
  useModal,
  useTableAdd,
  useTableDelete,
  useTableUpdate,
} from "@/hooks";
import { useEffect, useState } from "react";
import { DEFAULT_PLANT_FILTERS, getOptions, isEmployee } from "@/utils";
import { criteriaService, plantService } from "@/services";
import PlantFilter from "./PlantFilter";
import { plantColumns } from "./PlantColumns";
import { FilterPlantState } from "@/types";
import { HEALTH_STATUS, ROUTES } from "@/constants";
import PlantImportModal from "./PlantImportModal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDirtyStore } from "@/stores";

function PlantList() {
  const navigate = useNavigate();
  const formModal = useModal<GetPlant>();
  const [isPlantActionLoading, setIsPlantActionLoading] = useState(false);
  const importErrorModal = useModal<{ errors: string[] }>();
  const importModal = useModal();
  const markAsDeadModal = useModal<{ id: number }>();
  const deleteConfirmModal = useModal<{ ids: number[] }>();
  const updateConfirmModal = useModal<{ plant: PlantRequest }>();
  const markAsDeadConfirmModal = useModal<{ id: number }>();
  const criteriaModal = useModal<{ ids: number[] }>();
  const cancelConfirmModal = useModal();
  const { isDirty } = useDirtyStore();

  const { filters, updateFilters, applyFilters, clearFilters } = useFilters<FilterPlantState>(
    DEFAULT_PLANT_FILTERS,
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
  } = useFetchData<GetPlant>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      plantService.getPlantList(page, limit, sortField, sortDirection, searchValue, filters),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue]);

  const { handleDelete } = useTableDelete(
    {
      deleteFunction: plantService.deletePlants,
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

  const hasChanges = useHasChanges<PlantRequest>(data);

  const handleUpdateConfirm = (plant: PlantRequest) => {
    if (hasChanges(plant, "plantId")) {
      updateConfirmModal.showModal({ plant });
    } else {
      formModal.hideModal();
    }
  };

  const handleCancelConfirm = (plant: PlantRequest, isUpdate: boolean) => {
    const hasUnsavedChanges = isUpdate
      ? hasChanges(plant, "plantId")
      : hasChanges(plant, undefined, { healthStatus: HEALTH_STATUS.HEALTHY });

    if (hasUnsavedChanges) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate, isUpdating } = useTableUpdate<PlantRequest>({
    updateService: plantService.updatePlant,
    fetchData: fetchData,
    onSuccess: () => {
      formModal.hideModal();
      updateConfirmModal.hideModal();
    },
    onError: () => {
      updateConfirmModal.hideModal();
    },
  });

  const { handleAdd, isAdding } = useTableAdd({
    addService: plantService.createPlant,
    fetchData: fetchData,
    onSuccess: () => formModal.hideModal(),
  });

  const handleImportClose = (file: File | null) => {
    if (file) {
      cancelConfirmModal.showModal();
    } else {
      importModal.hideModal();
    }
  };

  const handleImport = async (file: File) => {
    try {
      setIsPlantActionLoading(true);
      var res = await plantService.importPlants(file);
      if (res.statusCode === 200) {
        toast.success(res.message);
        importModal.hideModal();
        await fetchData();
      } else {
        const errorList = res.message.split("\n").filter((error) => error.trim() !== "");
        importErrorModal.showModal({ errors: errorList });
      }
    } finally {
      setIsPlantActionLoading(false);
    }
  };

  const handleMarkAsDead = async (plantId?: number) => {
    if (!plantId) return;
    try {
      markAsDeadConfirmModal.hideModal();
      setIsPlantActionLoading(true);
      var res = await plantService.updatePlantDead(plantId);
      if (res.statusCode === 200) {
        toast.success(res.message);
        markAsDeadModal.hideModal();
        await fetchData();
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsPlantActionLoading(false);
    }
  };

  const handleCloseCriteria = () => {
    if (isDirty) {
      cancelConfirmModal.showModal();
    } else {
      criteriaModal.hideModal();
    }
  };

  const applyCriteria = async (criteria: PlantCriteriaApplyRequest) => {
    var res = await criteriaService.applyPlantCriteria(criteria);
    try {
      setIsPlantActionLoading(true);
      if (res.statusCode === 200) {
        criteriaModal.hideModal();
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsPlantActionLoading(false);
    }
  };

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
          idName="plantId"
          title={
            <TableTitle
              onSearch={handleSearch}
              filterContent={filterContent}
              addLabel="Add New Plant"
              importLabel="Import Plants"
              onAdd={() => formModal.showModal()}
              onImport={() => importModal.showModal()}
              noAdd={isEmployee()}
              noImport={isEmployee()}
            />
          }
          isOnRowEvent={true}
          onRowDoubleClick={(record) => navigate(ROUTES.FARM_PLANT_DETAIL(record.plantId))}
          handleSortClick={handleSortChange}
          selectedColumn={sortField}
          sortDirection={sortDirection}
          rotation={rotation}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          handleDelete={(ids) => handleDelete(ids)}
          onApplyCriteria={(ids) =>
            criteriaModal.showModal({
              ids: ids,
            })
          }
          isLoading={isLoading}
          caption="Plant Management Board"
          notifyNoData="No plants to display"
          renderAction={(plant: GetPlant) => (
            <ActionMenuPlant
              id={plant.plantId}
              isPlantDead={plant.isDead}
              onEdit={() => formModal.showModal(plant)}
              onDelete={() => deleteConfirmModal.showModal({ ids: [plant.plantId] })}
              onApplyCriteria={() =>
                criteriaModal.showModal({
                  ids: [plant.plantId],
                })
              }
              onMarkAsDead={() => markAsDeadModal.showModal({ id: plant.plantId })}
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
        <PlantModal
          isOpen={formModal.modalState.visible}
          onClose={handleCancelConfirm}
          onSave={formModal.modalState.data ? handleUpdateConfirm : handleAdd}
          isLoadingAction={formModal.modalState.data ? isUpdating : isAdding}
          plantData={formModal.modalState.data}
        />
        <PlantImportModal
          isOpen={importModal.modalState.visible}
          onClose={handleImportClose}
          onSave={handleImport}
          isLoadingAction={isPlantActionLoading}
        />
        <ApplyPlantCriteriaModal
          plantIds={criteriaModal.modalState.data?.ids}
          isOpen={criteriaModal.modalState.visible}
          onClose={handleCloseCriteria}
          onSave={applyCriteria}
          isLoadingAction={isPlantActionLoading}
        />
        <PlantMarkAsDeadModal
          isOpen={markAsDeadModal.modalState.visible}
          onClose={markAsDeadModal.hideModal}
          onSave={markAsDeadConfirmModal.showModal}
          isLoadingAction={isPlantActionLoading}
        />
        {/* Confirm Delete Modal */}
        <ConfirmModal
          visible={deleteConfirmModal.modalState.visible}
          onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.ids)}
          onCancel={deleteConfirmModal.hideModal}
          itemName="Plant"
          actionType="delete"
        />
        {/* Confirm Update Modal */}
        <ConfirmModal
          visible={updateConfirmModal.modalState.visible}
          onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.plant)}
          onCancel={updateConfirmModal.hideModal}
          itemName="Plant"
          actionType="update"
        />
        {/* Confirm Mark as Dead Modal */}
        <ConfirmModal
          visible={markAsDeadConfirmModal.modalState.visible}
          onConfirm={() => handleMarkAsDead(markAsDeadModal.modalState.data?.id)}
          onCancel={markAsDeadConfirmModal.hideModal}
          confirmText="Mark as Dead"
          title="Mark Plant as Dead?"
        />
        {/* Confirm Cancel Modal */}
        <ConfirmModal
          visible={cancelConfirmModal.modalState.visible}
          actionType="unsaved"
          onConfirm={() => {
            cancelConfirmModal.hideModal();
            formModal.hideModal();
            importModal.hideModal();
            criteriaModal.hideModal();
          }}
          onCancel={cancelConfirmModal.hideModal}
        />
        {/* Confirm Error Modal */}
        <ConfirmModal
          visible={importErrorModal.modalState.visible}
          onConfirm={importErrorModal.hideModal}
          onCancel={importErrorModal.hideModal}
          actionType="error"
          title="Import Failed"
          noCancel={true}
          description="There were errors in your imported file. Please review the details below."
          errorMessages={importErrorModal.modalState.data?.errors}
        />
      </Flex>
    </Flex>
  );
}

export default PlantList;
