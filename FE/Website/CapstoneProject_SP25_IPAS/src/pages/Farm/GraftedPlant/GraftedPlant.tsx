import { HEALTH_STATUS, ROUTES } from "@/constants";
import {
  useFetchData,
  useFilters,
  useHasChanges,
  useModal,
  useTableDelete,
  useTableUpdate,
} from "@/hooks";
import { CriteriaApplyRequest, GetGraftedPlant, GraftedPlantRequest } from "@/payloads";
import { criteriaService, graftedPlantService } from "@/services";
import { useDirtyStore } from "@/stores";
import { FilterGraftedPlantState } from "@/types";
import { DEFAULT_GRAFTED_PLANT_FILTERS, getOptions, isEmployee } from "@/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GraftedPlantFilter from "./GraftedPlantFilter";
import { Flex } from "antd";
import {
  ActionMenuGraftedPlant,
  ApplyGraftedPlantCriteriaModal,
  ConfirmModal,
  ConvertToPlantModal,
  CuttingGraftedModal,
  GraftedPlantModal,
  NavigationDot,
  PlantMarkAsDeadModal,
  SectionTitle,
  Table,
  TableTitle,
} from "@/components";
import style from "./GraftedPlant.module.scss";
import { GraftedPlantColumns } from "./GraftedPlantColumns";
import { toast } from "react-toastify";

function GraftedPlant() {
  const navigate = useNavigate();
  const formModal = useModal<GetGraftedPlant>();
  const criteriaModal = useModal<{ ids: number[] }>();
  const deleteConfirmModal = useModal<{ ids: number[] }>();
  const removeLotConfirmModal = useModal<{ ids: number[] }>();
  const addToLotModal = useModal<{ ids: number[] }>();
  const convertModal = useModal<{ id: number }>();
  const updateConfirmModal = useModal<{ graftedPlant: GraftedPlantRequest }>();
  const markAsDeadModal = useModal<{ id: number }>();
  const markAsDeadConfirmModal = useModal<{ id: number }>();
  const cancelConfirmModal = useModal();
  const { isDirty } = useDirtyStore();
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { filters, updateFilters, applyFilters, clearFilters } =
    useFilters<FilterGraftedPlantState>(DEFAULT_GRAFTED_PLANT_FILTERS, () => fetchData(1));

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
  } = useFetchData<GetGraftedPlant>({
    fetchFunction: (page, limit, sortField, sortDirection, searchValue) =>
      graftedPlantService.getGraftedPlants(
        page,
        limit,
        sortField,
        sortDirection,
        searchValue,
        filters,
      ),
  });

  useEffect(() => {
    fetchData();
  }, [currentPage, rowsPerPage, sortField, sortDirection, searchValue]);

  const { handleDelete } = useTableDelete(
    {
      deleteFunction: graftedPlantService.deleteGraftedPlants,
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

  const hasChanges = useHasChanges<GraftedPlantRequest>(data);

  const handleUpdateConfirm = (graftedPlant: GraftedPlantRequest) => {
    if (hasChanges(graftedPlant, "graftedPlantId")) {
      updateConfirmModal.showModal({ graftedPlant });
    } else {
      formModal.hideModal();
    }
  };

  const handleCancelConfirm = (graftedPlant: GraftedPlantRequest, isUpdate: boolean) => {
    const hasUnsavedChanges = isUpdate
      ? hasChanges(graftedPlant, "graftedPlantId")
      : hasChanges(graftedPlant, undefined, { status: HEALTH_STATUS.HEALTHY });

    if (hasUnsavedChanges) {
      cancelConfirmModal.showModal();
    } else {
      formModal.hideModal();
    }
  };

  const { handleUpdate, isUpdating } = useTableUpdate<GraftedPlantRequest>({
    updateService: graftedPlantService.updateGraftedPlant,
    fetchData: fetchData,
    onSuccess: () => {
      formModal.hideModal();
      updateConfirmModal.hideModal();
    },
    onError: () => {
      updateConfirmModal.hideModal();
    },
  });

  const handleCloseCriteria = () => {
    if (isDirty) {
      cancelConfirmModal.showModal();
    } else {
      criteriaModal.hideModal();
    }
  };

  const applyCriteria = async (criteria: CriteriaApplyRequest) => {
    var res = await criteriaService.applyCriteria(criteria);
    try {
      setIsActionLoading(true);
      if (res.statusCode === 200) {
        criteriaModal.hideModal();
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkAsDead = async (id?: number) => {
    if (!id) return;
    try {
      markAsDeadConfirmModal.hideModal();
      setIsActionLoading(true);
      var res = await graftedPlantService.updateGraftedPlantDead(id);
      if (res.statusCode === 200) {
        toast.success(res.message);
        markAsDeadModal.hideModal();
        await fetchData();
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const onAddToLot = async (lotId: number, graftedPlantIds?: number[]) => {
    if (!graftedPlantIds) return;
    var res = await graftedPlantService.groupGraftedPlant(graftedPlantIds, lotId);
    try {
      setIsActionLoading(true);
      if (res.statusCode === 200) {
        addToLotModal.hideModal();
        toast.success(res.message);
        await fetchData();
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const removeFromLot = async (ids?: number[]) => {
    if (!ids) return;
    var res = await graftedPlantService.unGroupGraftedPlant(ids);
    try {
      setIsActionLoading(true);
      if (res.statusCode === 200) {
        removeLotConfirmModal.hideModal();
        toast.success(res.message);
        await fetchData();
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const convertToPlant = async (landRowId: number, plantIndex: number, graftedId?: number) => {
    if (!graftedId) return;
    var res = await graftedPlantService.convertToPlant(graftedId, landRowId, plantIndex);
    try {
      setIsActionLoading(true);
      if (res.statusCode === 200) {
        convertModal.hideModal();
        toast.success(res.message);
        await fetchData();
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const filterContent = (
    <GraftedPlantFilter
      filters={filters}
      updateFilters={updateFilters}
      onClear={clearFilters}
      onApply={applyFilters}
    />
  );

  return (
    <Flex className={style.container}>
      <SectionTitle title="Grafted Plant Management" totalRecords={totalRecords} />
      <Flex className={style.table}>
        <Table
          columns={GraftedPlantColumns}
          rows={data}
          rowKey="graftedPlantCode"
          idName="graftedPlantId"
          title={
            <TableTitle
              onSearch={handleSearch}
              filterContent={filterContent}
              noAdd={isEmployee()}
            />
          }
          isOnRowEvent={true}
          onRowDoubleClick={(record) =>
            navigate(ROUTES.FARM_GRAFTED_PLANT_DETAIL(record.graftedPlantId))
          }
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
          onGroupGraftedPlant={(ids) =>
            addToLotModal.showModal({
              ids: ids,
            })
          }
          onUnGroupGraftedPlant={(ids) => removeFromLot(ids)}
          isLoading={isLoading}
          caption="Grafted Plant Management Board"
          notifyNoData="No grafted plants to display"
          renderAction={(grPlant: GetGraftedPlant) => (
            <ActionMenuGraftedPlant
              graftedPlant={grPlant}
              onEdit={() => formModal.showModal(grPlant)}
              onDelete={() => deleteConfirmModal.showModal({ ids: [grPlant.graftedPlantId] })}
              onApplyCriteria={() =>
                criteriaModal.showModal({
                  ids: [grPlant.graftedPlantId],
                })
              }
              onMarkAsDead={() => markAsDeadModal.showModal({ id: grPlant.graftedPlantId })}
              onAddToLot={() => addToLotModal.showModal({ ids: [grPlant.graftedPlantId] })}
              onRemoveFromLot={() =>
                removeLotConfirmModal.showModal({ ids: [grPlant.graftedPlantId] })
              }
              onConvertToPlant={() => convertModal.showModal({ id: grPlant.graftedPlantId })}
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
        <GraftedPlantModal
          isOpen={formModal.modalState.visible}
          onClose={handleCancelConfirm}
          onSave={formModal.modalState.data ? handleUpdateConfirm : () => {}}
          isLoadingAction={formModal.modalState.data ? isUpdating : false}
          graftedPlantData={formModal.modalState.data}
        />
        <ApplyGraftedPlantCriteriaModal
          graftedPlantIds={criteriaModal.modalState.data?.ids}
          isOpen={criteriaModal.modalState.visible}
          onClose={handleCloseCriteria}
          onSave={applyCriteria}
          isLoadingAction={isActionLoading}
        />
        <CuttingGraftedModal
          isMove
          isOpen={addToLotModal.modalState.visible}
          onClose={addToLotModal.hideModal}
          onSave={(lotId) => onAddToLot(lotId, addToLotModal.modalState.data?.ids)}
          isLoadingAction={isActionLoading}
        />
        <ConvertToPlantModal
          isOpen={convertModal.modalState.visible}
          onClose={convertModal.hideModal}
          onSave={(rowId, plantIndex) =>
            convertToPlant(rowId, plantIndex, convertModal.modalState.data?.id)
          }
          isLoadingAction={isActionLoading}
        />
        <PlantMarkAsDeadModal
          isOpen={markAsDeadModal.modalState.visible}
          onClose={markAsDeadModal.hideModal}
          onSave={markAsDeadConfirmModal.showModal}
          isLoadingAction={isActionLoading}
          entityType="GraftedPlant"
        />
        {/* Confirm Mark as Dead Modal */}
        <ConfirmModal
          visible={markAsDeadConfirmModal.modalState.visible}
          onConfirm={() => handleMarkAsDead(markAsDeadModal.modalState.data?.id)}
          onCancel={markAsDeadConfirmModal.hideModal}
          confirmText="Mark as Dead"
          title="Mark Grafted Plan as Dead?"
        />
        {/* Confirm Delete Modal */}
        <ConfirmModal
          visible={deleteConfirmModal.modalState.visible}
          onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.ids)}
          onCancel={deleteConfirmModal.hideModal}
          itemName="Grafted Plant"
          actionType="delete"
        />
        {/* Confirm Update Modal */}
        <ConfirmModal
          visible={updateConfirmModal.modalState.visible}
          onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.graftedPlant)}
          onCancel={updateConfirmModal.hideModal}
          itemName="Grafted Plant"
          actionType="update"
        />
        {/* Confirm remove from lot Modal */}
        <ConfirmModal
          visible={removeLotConfirmModal.modalState.visible}
          onConfirm={() => removeFromLot(removeLotConfirmModal.modalState.data?.ids)}
          onCancel={removeLotConfirmModal.hideModal}
          title="Remove Grafted Plant from Lot"
          description="Are you sure you want to remove this grafted plant from the lot? This action will not delete the plant but will unassign it from the current lot."
          confirmText="Remove"
          cancelText="Cancel"
          isDanger={true}
        />

        {/* Confirm Cancel Modal */}
        <ConfirmModal
          visible={cancelConfirmModal.modalState.visible}
          actionType="unsaved"
          onConfirm={() => {
            criteriaModal.hideModal();
            cancelConfirmModal.hideModal();
            formModal.hideModal();
          }}
          onCancel={cancelConfirmModal.hideModal}
        />
      </Flex>
    </Flex>
  );
}

export default GraftedPlant;
