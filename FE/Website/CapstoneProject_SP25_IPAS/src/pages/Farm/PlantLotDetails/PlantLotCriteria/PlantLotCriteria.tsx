import style from "./PlantLotCriteria.module.scss";
import { Collapse, Divider, Empty, Flex } from "antd";
import { ConfirmModal, CriteriaCheckTable, LoadingSkeleton } from "@/components";
import { useEffect, useState } from "react";
import { useDirtyStore, usePlantLotStore } from "@/stores";
import LotSectionHeader from "../LotSectionHeader/LotSectionHeader";
import { useModal, useStyle } from "@/hooks";
import { criteriaService, plantLotService } from "@/services";
import {
  CriteriaApplyRequest,
  CriteriaCheckData,
  CriteriaCheckRequest,
  CriteriaDeleteRequest,
  GetCriteriaObject,
} from "@/payloads";
import ApplyCriteriaModal from "../../PlantLot/ApplyCriteriaModal";
import { toast } from "react-toastify";
import UpdateQuantityModal from "./UpdateQuantityModal";
import { CRITERIA_TARGETS } from "@/constants";
import { PanelTitle } from "./PanelTitle";

function PlantLotCriteria() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true); // 👈 Thêm state mới
  const [initialCriteriaGroups, setInitialCriteriaGroups] = useState<GetCriteriaObject[]>([]);
  const [criteriaGroups, setCriteriaGroups] = useState<GetCriteriaObject[]>([]);
  const [initialCriteria, setInitialGroups] = useState<Record<number, number>>({});
  const [updatedCriteria, setUpdatedCriteria] = useState<Record<number, number>>({});
  const { lot, setLot, markForRefetch } = usePlantLotStore();
  const { styles } = useStyle();
  const { isDirty } = useDirtyStore();
  const criteriaModal = useModal<{ id?: number }>();
  const cancelConfirmModal = useModal();
  const deleteConfirmModal = useModal<{ id: number }>();
  const quantityModal = useModal<{ target: string; isAllPass: boolean }>();
  if (!lot) return;

  const fetchCriteriaPlantLot = async () => {
    setIsLoading(true);
    if (isFirstLoad) await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const res = await criteriaService.getCriteriaOfLandPlot(Number(lot.plantLotId));
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
    fetchCriteriaPlantLot();
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
        await fetchCriteriaPlantLot();
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueCheckChange = (criteriaId: number, value: number) => {
    if (value === 0) return;
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

  const handleUpdateQuantity = async (
    target?: string,
    isAllCompletedCheckUpdate?: boolean,
    quantity?: number,
    supplementQuantity?: number,
  ) => {
    if (!target && !isAllCompletedCheckUpdate && !quantity) return;
    if (!target) return;

    if (!lot.inputQuantity && target === CRITERIA_TARGETS["Plantlot Evaluation"]) {
      toast.error("Please update check quantity before proceeding.");
      return;
    }

    if (
      (target === CRITERIA_TARGETS["Plantlot Evaluation"] && quantity === lot.lastQuantity) ||
      (target === CRITERIA_TARGETS["Plantlot Condition"] && quantity === lot.inputQuantity)
    ) {
      // Không gọi API nếu số lượng không thay đổi
    } else if (quantity && isAllCompletedCheckUpdate) {
      var resUpdate = await plantLotService.updateQuantityLot(lot.plantLotId, target, quantity);
      if (resUpdate.statusCode !== 200) {
        toast.error(resUpdate.message);
        return;
      } else {
        quantityModal.hideModal();
        toast.success(resUpdate.message);
      }

      setLot({
        ...lot,
        lastQuantity:
          target === CRITERIA_TARGETS["Plantlot Evaluation"] ? quantity : lot.lastQuantity,
        inputQuantity:
          target === CRITERIA_TARGETS["Plantlot Condition"] ? quantity : lot.inputQuantity,
      });
    }

    if (
      target === CRITERIA_TARGETS["Plantlot Condition"] &&
      supplementQuantity !== undefined &&
      !isNaN(supplementQuantity) &&
      supplementQuantity > 0
    ) {
      const resAdditional = await plantLotService.createAdditionalLot(
        lot.plantLotReferenceId ?? lot.plantLotId,
        supplementQuantity,
      );
      if (resAdditional.statusCode !== 200) {
        toast.error(resAdditional.message);
        return;
      } else {
        markForRefetch();
      }
    }
  };

  const handleSave = async (isAllConditionChecked: boolean, target: string) => {
    if (!isAllConditionChecked && target === CRITERIA_TARGETS["Plantlot Evaluation"]) {
      toast.error("Please pass 'Plantlot Condition' before updating 'Plantlot Evaluation'.");
      return;
    }
    const criteriaDatas: CriteriaCheckData[] = Object.entries(updatedCriteria)
      .filter(([, valueChecked]) => valueChecked !== 0) // Lọc ra giá trị khác 0
      .map(([criteriaId, valueChecked]) => ({
        criteriaId: Number(criteriaId),
        valueChecked,
      }));

    const payload: CriteriaCheckRequest = {
      plantLotID: lot?.plantLotId ? [lot.plantLotId] : undefined,
      criteriaDatas,
    };

    try {
      setIsLoading(true);

      var res = await criteriaService.checkCriteria(payload);
      if (res.statusCode === 200) {
        toast.success(res.message);
        await fetchCriteriaPlantLot();
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

  const handleDeleteConfirm = async (criteriaSetId: number) =>
    deleteConfirmModal.showModal({ id: criteriaSetId });

  const handleDelete = async (criteriaSetId?: number) => {
    if (!criteriaSetId) return;
    const deleteCriteria: CriteriaDeleteRequest = {
      plantLotId: [lot.plantLotId],
      criteriaSetId: [criteriaSetId],
    };
    try {
      const res = await criteriaService.deleteCriteriaObject(deleteCriteria);
      if (res.statusCode === 200) {
        toast.success(res.message);
        await fetchCriteriaPlantLot();
      } else {
        toast.error(res.message);
      }
    } finally {
      deleteConfirmModal.hideModal();
    }
  };

  return (
    <Flex className={style.contentDetailWrapper}>
      <LotSectionHeader
        isCriteria={true}
        onApplyCriteria={() => criteriaModal.showModal({ id: lot?.plantLotId })}
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
              const isAllConditionChecked = (() => {
                const conditionGroups = criteriaGroups.filter(
                  (group) => group.target === CRITERIA_TARGETS["Plantlot Condition"],
                );

                if (conditionGroups.length === 0) return false; // Không có tiêu chí "Condition" nào

                return conditionGroups.every((group) =>
                  group.criteriaList.every((item) => initialCriteria[item.criteriaId]),
                );
              })();

              const isAllConditionPassed = (() => {
                const conditionGroups = criteriaGroups.filter(
                  (group) => group.target === CRITERIA_TARGETS["Plantlot Condition"],
                );

                if (conditionGroups.length === 0) return false; // Không có tiêu chí "Condition" nào

                return conditionGroups.every((group) =>
                  group.criteriaList.every((item) => item.isPassed === true),
                );
              })();

              const isAllEvaluationChecked = (() => {
                const evaluationGroups = criteriaGroups.filter(
                  (group) => group.target === CRITERIA_TARGETS["Plantlot Evaluation"],
                );

                if (evaluationGroups.length === 0) return false; // Không có tiêu chí "Evaluation" nào

                return evaluationGroups.every((group) =>
                  group.criteriaList.every((item) => initialCriteria[item.criteriaId]),
                );
              })();

              const isAllEvaluationPassed = (() => {
                const conditionGroups = criteriaGroups.filter(
                  (group) => group.target === CRITERIA_TARGETS["Plantlot Evaluation"],
                );

                if (conditionGroups.length === 0) return false;

                return conditionGroups.every((group) =>
                  group.criteriaList.every((item) => item.isPassed === true),
                );
              })();

              return (
                <Collapse.Panel
                  header={
                    <PanelTitle
                      title={group.masterTypeName}
                      target={group.target}
                      criteriaSetId={group.masterTypeId}
                      data={group.criteriaList}
                      isAllConditionChecked={isAllConditionChecked}
                      isAllConditionPassed={isAllConditionPassed}
                      isAllEvaluationChecked={isAllEvaluationChecked}
                      isAllEvaluationPassed={isAllEvaluationPassed}
                      updatedCriteria={updatedCriteria}
                      initialCriteria={initialCriteria}
                      handleCancel={handleCancel}
                      handleSave={handleSave}
                      handleDelete={handleDeleteConfirm}
                      onUpdateQuantity={(target, isAllPass) =>
                        quantityModal.showModal({ target, isAllPass })
                      }
                      isCompleted={lot.isPassed}
                    />
                  }
                  key={group.masterTypeId}
                >
                  <CriteriaCheckTable
                    data={group.criteriaList}
                    target={group.target}
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
      <ApplyCriteriaModal
        lotId={criteriaModal.modalState.data?.id}
        hasInputQuantity={!!lot.inputQuantity}
        hasLastQuantity={!!lot.lastQuantity}
        isOpen={criteriaModal.modalState.visible}
        onClose={handleCloseCriteria}
        onSave={applyCriteria}
        isLoadingAction={isLoading}
      />
      <UpdateQuantityModal
        isOpen={quantityModal.modalState.visible}
        onClose={quantityModal.hideModal}
        isAllConditionPassed={quantityModal.modalState.data?.isAllPass}
        // isAllConditionPassed={quantityModal.modalState.data?.isAllPass}
        onSave={(quantity, supplementQuantity) =>
          handleUpdateQuantity(
            quantityModal.modalState.data?.target,
            true,
            quantity,
            supplementQuantity,
          )
        }
        target={quantityModal.modalState.data?.target}
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

export default PlantLotCriteria;
