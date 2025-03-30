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
import { DEFAULT_GRAFTED_PLANT_FILTERS, getOptions } from "@/utils";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GraftedPlantFilter from "./GraftedPlantFilter";
import { Flex } from "antd";
import {
  ActionMenuGraftedPlant,
  ApplyGraftedPlantCriteriaModal,
  ConfirmModal,
  GraftedPlantModal,
  NavigationDot,
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
  const updateConfirmModal = useModal<{ graftedPlant: GraftedPlantRequest }>();
  const cancelConfirmModal = useModal();
  const { isDirty } = useDirtyStore();
  const [isActionLoading, setIsActionLoading] = useState(false);

  const { filters, updateFilters, applyFilters, clearFilters } =
    useFilters<FilterGraftedPlantState>(DEFAULT_GRAFTED_PLANT_FILTERS, () => fetchData());

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
          title={<TableTitle onSearch={handleSearch} filterContent={filterContent} noAdd={true} />}
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
          isLoading={isLoading}
          caption="Grafted Plant Management Board"
          notifyNoData="No grafted plants to display"
          renderAction={(grPlant: GetGraftedPlant) => (
            <ActionMenuGraftedPlant
              id={grPlant.graftedPlantId}
              isCompleted={grPlant.isCompleted}
              onEdit={() => formModal.showModal(grPlant)}
              onDelete={() => deleteConfirmModal.showModal({ ids: [grPlant.graftedPlantId] })}
              onApplyCriteria={() =>
                criteriaModal.showModal({
                  ids: [grPlant.graftedPlantId],
                })
              }
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
          onConfirm={() => handleUpdate(updateConfirmModal.modalState.data?.graftedPlant)}
          onCancel={updateConfirmModal.hideModal}
          itemName="Plant"
          actionType="update"
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
