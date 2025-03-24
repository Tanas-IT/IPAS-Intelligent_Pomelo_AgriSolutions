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
  CriteriaApplyRequest,
  CriteriaCheckData,
  CriteriaCheckRequest,
  CriteriaDeleteRequest,
  GetCriteriaObject,
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
  const { plant, setPlant, shouldRefetch } = usePlantStore();
  const { styles } = useStyle();
  const { isDirty } = useDirtyStore();
  const criteriaModal = useModal<{ id?: number }>();
  const cancelConfirmModal = useModal();
  const deleteConfirmModal = useModal<{ id: number }>();

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

  const applyCriteria = async (criteria: CriteriaApplyRequest) => {
    var res = await criteriaService.applyCriteria(criteria);
    try {
      setIsLoading(true);
      if (res.statusCode === 200) {
        criteriaModal.hideModal();
        await fetchCriteriaPlant();
        toast.success(res.message);
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

    const payload: CriteriaCheckRequest = {
      plantID: plant?.plantId ? [plant.plantId] : undefined,
      criteriaDatas,
    };

    try {
      setIsLoading(true);

      var res = await criteriaService.checkCriteria(payload);
      if (res.statusCode === 200) {
        toast.success(res.message);
        await fetchCriteriaPlant();
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
      } else {
        toast.error(res.message);
      }
    } finally {
      deleteConfirmModal.hideModal();
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
      <PlantSectionHeader
        isCriteria={true}
        onApplyCriteria={() => criteriaModal.showModal({ id: plant?.plantId })}
      />
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
