import style from "./PlantCriteria.module.scss";
import { Collapse, Divider, Empty, Flex } from "antd";
import {
  ApplyPlantCriteriaModal,
  ConfirmModal,
  CriteriaPlantCheckTable,
  LoadingSkeleton,
  PlantSectionHeader,
} from "@/components";
import { useEffect, useState } from "react";
import { useDirtyStore, usePlantStore } from "@/stores";
import { useModal, useStyle } from "@/hooks";
import { criteriaService } from "@/services";
import {
  CriteriaCheckData,
  CriteriaDeleteRequest,
  CriteriaPlantCheckRequest,
  GetCriteriaObject,
  PlantCriteriaApplyRequest,
  ResetCriteriaPlantRequest,
} from "@/payloads";
import { toast } from "react-toastify";
import { PlantPanelTitle } from "./PlantPanelTitle";

function PlantCriteria() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [initialCriteriaGroups, setInitialCriteriaGroups] = useState<GetCriteriaObject[]>([]);
  const [criteriaGroups, setCriteriaGroups] = useState<GetCriteriaObject[]>([]);
  const [initialCriteria, setInitialGroups] = useState<Record<number, number>>({});
  const [updatedCriteria, setUpdatedCriteria] = useState<Record<number, number>>({});
  const { plant, setPlant } = usePlantStore();
  const { styles } = useStyle();
  const { isDirty } = useDirtyStore();
  const criteriaModal = useModal<{ id?: number }>();
  const cancelConfirmModal = useModal();
  const deleteConfirmModal = useModal<{ id: number }>();
  const resetConfirmModal = useModal<{ id: number; isPass: boolean }>();

  if (!plant) return;

  const fetchCriteriaPlant = async () => {
    setIsLoading(true);
    if (isFirstLoad) await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const res = await criteriaService.getCriteriaOfPlant(Number(plant.plantId));
      if (res.statusCode === 200) {
        setCriteriaGroups(res.data ?? []);
        setInitialCriteriaGroups(res.data ?? []);
        const initialState =
          res.data &&
          res.data.reduce((acc, group) => {
            group.criteriaList.forEach((item) => {
              acc[item.criteriaId] = item.valueChecked ?? 0;
            });
            return acc;
          }, {} as Record<number, number>);

        setInitialGroups(initialState);
      }
    } finally {
      setIsLoading(false);
      setIsFirstLoad(false);
    }
  };

  useEffect(() => {
    fetchCriteriaPlant();
  }, []);

  if (isFirstLoad) return <LoadingSkeleton rows={10} />;

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
      setIsLoading(true);
      if (res.statusCode === 200) {
        criteriaModal.hideModal();
        await fetchCriteriaPlant();
        toast.success(res.message);
        setPlant({ ...plant, isPassed: res.data.isPassed });
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setUpdatedCriteria(initialCriteria);
    setCriteriaGroups(initialCriteriaGroups);
  };

  const handleSave = async () => {
    const criteriaDatas: CriteriaCheckData[] = Object.entries(updatedCriteria)
      .filter(([, valueChecked]) => valueChecked !== 0) // Lọc ra giá trị khác 0
      .map(([criteriaId, valueChecked]) => ({
        criteriaId: Number(criteriaId),
        valueChecked,
      }));

    const payload: CriteriaPlantCheckRequest = {
      plantIds: plant?.plantId ? [plant.plantId] : undefined,
      criteriaDatas,
    };

    try {
      setIsLoading(true);

      var res = await criteriaService.checkPlantCriteria(payload);

      if (res.statusCode === 200) {
        toast.success(res.message);
        await fetchCriteriaPlant();
        if (res.data.isPassed) setPlant({ ...plant, isPassed: res.data.isPassed });
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async (criteriaSetId: number) =>
    deleteConfirmModal.showModal({ id: criteriaSetId });

  const handleDelete = async (criteriaSetId?: number) => {
    if (!criteriaSetId) return;
    const deleteCriteria: CriteriaDeleteRequest = {
      plantId: [plant.plantId],
      criteriaSetId: [criteriaSetId],
    };
    try {
      const res = await criteriaService.deleteCriteriaObject(deleteCriteria);
      if (res.statusCode === 200) {
        toast.success(res.message);
        await fetchCriteriaPlant();
        setUpdatedCriteria([]);
      } else {
        toast.error(res.message);
      }
    } finally {
      deleteConfirmModal.hideModal();
    }
  };

  const handleResetConfirm = async (criteriaSetId: number, isPass: boolean) =>
    resetConfirmModal.showModal({ id: criteriaSetId, isPass: isPass });

  const handleReset = async (criteriaSetId?: number) => {
    if (!criteriaSetId) return;
    setIsLoading(true);
    try {
      const req: ResetCriteriaPlantRequest = {
        plantId: plant.plantId,
        masterTypeId: criteriaSetId,
      };
      const res = await criteriaService.resetPlantCriteria(req);
      if (res.statusCode === 200) {
        toast.success(res.message);
        resetConfirmModal.hideModal();
        await fetchCriteriaPlant();
        setUpdatedCriteria([]);
        if (res.data.isPassed == false) setPlant({ ...plant, isPassed: res.data.isPassed });
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueCheckChange = (criteriaId: number, value: number) => {
    setUpdatedCriteria((prev) => {
      const initialValue = initialCriteria[criteriaId];

      if (value === initialValue) {
        // Nếu giá trị mới bằng giá trị ban đầu, loại bỏ nó khỏi updatedCriteria
        const { [criteriaId]: _, ...rest } = prev;
        return rest;
      }

      // Nếu có thay đổi thực sự, lưu lại
      return {
        ...prev,
        [criteriaId]: value,
      };
    });
    setCriteriaGroups((prevGroups) =>
      prevGroups.map((group) => ({
        ...group,
        criteriaList: group.criteriaList.map((item) =>
          item.criteriaId === criteriaId ? { ...item, valueChecked: value } : item,
        ),
      })),
    );
  };

  return (
    <Flex className={style.contentDetailWrapper}>
      <PlantSectionHeader onApplyCriteria={() => criteriaModal.showModal({ id: plant?.plantId })} />
      <Divider className={style.divider} />
      {criteriaGroups.length > 0 ? (
        <Flex className={style.contentSectionBody}>
          <Collapse
            className={`${styles.customCollapse} ${style.criteriaCollapse}`}
            defaultActiveKey={[]}
            ghost
          >
            {criteriaGroups.map((group) => {
              return (
                <Collapse.Panel
                  header={
                    <PlantPanelTitle
                      title={group.masterTypeName}
                      target={group.target}
                      criteriaSetId={group.masterTypeId}
                      updatedCriteria={updatedCriteria}
                      initialCriteria={initialCriteria}
                      data={group.criteriaList}
                      handleCancel={handleCancel}
                      handleSave={handleSave}
                      handleDelete={handleDeleteConfirm}
                      handleReset={handleResetConfirm}
                    />
                  }
                  key={group.masterTypeId}
                >
                  <CriteriaPlantCheckTable
                    data={group.criteriaList}
                    handleValueCheckChange={handleValueCheckChange}
                  />
                </Collapse.Panel>
              );
            })}
          </Collapse>
        </Flex>
      ) : (
        <Flex justify="center" align="center" style={{ width: "100%" }}>
          <Empty description="No criteria available" />
        </Flex>
      )}
      <ApplyPlantCriteriaModal
        plantIds={
          criteriaModal.modalState.data?.id ? [criteriaModal.modalState.data.id] : undefined
        }
        isOpen={criteriaModal.modalState.visible}
        onClose={handleCloseCriteria}
        onSave={applyCriteria}
        isLoadingAction={isLoading}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.id)}
        onCancel={deleteConfirmModal.hideModal}
        actionType="delete"
      />
      {/* Confirm Reset Modal */}
      <ConfirmModal
        visible={resetConfirmModal.modalState.visible}
        onConfirm={() => handleReset(resetConfirmModal.modalState.data?.id)}
        onCancel={resetConfirmModal.hideModal}
        title={
          resetConfirmModal.modalState.data?.isPass
            ? "Reset Criteria?"
            : "Reset Incomplete Criteria?"
        }
        description={
          resetConfirmModal.modalState.data?.isPass
            ? "Are you sure you want to reset it? This action cannot be undone."
            : "This criterion has not passed yet. Are you sure you want to reset it and clear all input values?"
        }
      />
      {/* Confirm Cancel Modal */}
      <ConfirmModal
        visible={cancelConfirmModal.modalState.visible}
        actionType="unsaved"
        onConfirm={() => {
          criteriaModal.hideModal();
          cancelConfirmModal.hideModal();
        }}
        onCancel={cancelConfirmModal.hideModal}
      />
    </Flex>
  );
}

export default PlantCriteria;
