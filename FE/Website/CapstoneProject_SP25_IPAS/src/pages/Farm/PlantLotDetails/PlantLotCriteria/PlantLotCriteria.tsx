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
  const [initialCriteria, setInitialGroups] = useState<Record<number, boolean>>({});
  const [updatedCriteria, setUpdatedCriteria] = useState<Record<number, boolean>>({});
  const { lot, setLot, markForRefetch } = usePlantLotStore();
  const { styles } = useStyle();
  const { isDirty } = useDirtyStore();
  const criteriaModal = useModal<{ id?: number }>();
  const cancelConfirmModal = useModal();
  const deleteConfirmModal = useModal<{ id: number }>();
  const quantityModal = useModal<{ target: string }>();
  if (!lot) return;

  const fetchCriteriaPlantLot = async () => {
    setIsLoading(true);
    if (isFirstLoad) await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const res = await criteriaService.getCriteriaOfLandPlot(Number(lot.plantLotId));
      if (res.statusCode === 200 && res.data) {
        setCriteriaGroups(res.data ?? []);
        setInitialCriteriaGroups(res.data ?? []);
        const initialState = res.data.reduce((acc, group) => {
          group.criteriaList.forEach((item) => {
            acc[item.criteriaId] = item.isChecked ?? false;
          });
          return acc;
        }, {} as Record<number, boolean>);

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

  const handleCompletedChange = (criteriaId: number, checked: boolean) => {
    setUpdatedCriteria((prev) => {
      const initialValue = initialCriteria[criteriaId];

      if (checked === initialValue) {
        // Nếu giá trị mới bằng giá trị ban đầu, loại bỏ nó khỏi updatedCriteria
        const { [criteriaId]: _, ...rest } = prev;
        return rest;
      }

      // Nếu có thay đổi thực sự, lưu lại
      return {
        ...prev,
        [criteriaId]: checked,
      };
    });
    setCriteriaGroups((prevGroups) =>
      prevGroups.map((group) => ({
        ...group,
        criteriaList: group.criteriaList.map((item) =>
          item.criteriaId === criteriaId ? { ...item, isChecked: checked } : item,
        ),
      })),
    );
  };

  const handleSave = async (
    target?: string,
    isAllCompletedCheckUpdate?: boolean,
    isAllConditionChecked?: boolean,
    quantity?: number,
    supplementQuantity?: number,
  ) => {
    if (!target) return;
    if (!isAllConditionChecked && target === CRITERIA_TARGETS["Plantlot Evaluation"]) {
      toast.error("Please complete all 'Plant Lot Condition' criteria before proceeding.");
      return;
    }

    if (target && isAllCompletedCheckUpdate && !quantity) {
      quantityModal.showModal({ target });
      return;
    }

    const criteriaDatas: CriteriaCheckData[] = Object.entries(updatedCriteria).map(
      ([criteriaId, isChecked]) => ({
        criteriaId: Number(criteriaId),
        isChecked,
      }),
    );

    const payload: CriteriaCheckRequest = {
      plantLotID: lot?.plantLotId ? [lot.plantLotId] : undefined,
      criteriaDatas,
    };

    try {
      setIsLoading(true);
      var res = await criteriaService.checkCriteria(payload);
      if (res.statusCode !== 200) {
        toast.error(res.message);
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

      if (res.statusCode === 200) {
        toast.success(res.message);
        quantityModal.hideModal();
        await fetchCriteriaPlantLot();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    setUpdatedCriteria(initialCriteria);
    setCriteriaGroups(initialCriteriaGroups);
  };

  const handleDeleteConfirm = async (criteriaSetId: number) => {
    deleteConfirmModal.showModal({ id: criteriaSetId });
  };

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
              const isConditionCompleted = group.criteriaList.every(
                (item) => initialCriteria[item.criteriaId],
              ); // ✅ Kiểm tra dựa trên dữ liệu đã load

              const isAllCompletedCheckUpdate = (
                ["Plantlot Condition", "Plantlot Evaluation"] as const
              ).some((target) => {
                // Lọc ra các nhóm thuộc target đang xét
                const filteredGroups = criteriaGroups.filter(
                  (group) => group.target === CRITERIA_TARGETS[target],
                );

                // Nếu target có nhóm nhưng chưa được tick hết -> false
                if (filteredGroups.length === 0) return false;

                return filteredGroups.some((group) => {
                  // Trạng thái ban đầu của nhóm: nhóm đã được tick hết từ đầu chưa?
                  const initialGroupCompleted = group.criteriaList.every(
                    (item) => initialCriteria[item.criteriaId] ?? item.isChecked,
                  );

                  // Trạng thái sau khi cập nhật: nhóm có được tick hết không?
                  const updatedGroupCompleted = group.criteriaList.every(
                    (item) => updatedCriteria[item.criteriaId] ?? item.isChecked,
                  );

                  return !initialGroupCompleted && updatedGroupCompleted;
                  // ✅ Chỉ trả về true nếu nhóm trước đó chưa hoàn thành nhưng giờ đã hoàn thành
                });
              });

              const isAllConditionChecked = (() => {
                const conditionGroups = criteriaGroups.filter(
                  (group) => group.target === CRITERIA_TARGETS["Plantlot Condition"],
                );

                if (conditionGroups.length === 0) return false; // Không có tiêu chí "Condition" nào

                return conditionGroups.every((group) =>
                  group.criteriaList.every(
                    (item) => updatedCriteria[item.criteriaId] ?? item.isChecked,
                  ),
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
                      isAllCompletedCheckUpdate={isAllCompletedCheckUpdate}
                      isAllConditionChecked={isAllConditionChecked}
                      updatedCriteria={updatedCriteria}
                      initialCriteria={initialCriteria}
                      handleCancel={handleCancel}
                      handleSave={handleSave}
                      handleDelete={handleDeleteConfirm}
                      isCompleted={lot.isPassed}
                    />
                  }
                  key={group.masterTypeId}
                >
                  <CriteriaCheckTable
                    data={group.criteriaList}
                    hasCompleteCheck
                    isConditionCompleted={isConditionCompleted}
                    handleCompletedChange={handleCompletedChange}
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
        isOpen={criteriaModal.modalState.visible}
        onClose={handleCloseCriteria}
        onSave={applyCriteria}
        isLoadingAction={isLoading}
      />
      <UpdateQuantityModal
        isOpen={quantityModal.modalState.visible}
        onClose={quantityModal.hideModal}
        onSave={(quantity, supplementQuantity) =>
          handleSave(
            quantityModal.modalState.data?.target,
            true,
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
