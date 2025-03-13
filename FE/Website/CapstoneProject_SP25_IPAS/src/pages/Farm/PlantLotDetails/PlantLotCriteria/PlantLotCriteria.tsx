import style from "./PlantLotCriteria.module.scss";
import { Checkbox, Collapse, Divider, Empty, Flex, Table } from "antd";
import { ConfirmModal, CustomButton, LoadingSkeleton, Tooltip } from "@/components";
import { useEffect, useState } from "react";
import { useDirtyStore, usePlantLotStore } from "@/stores";
import LotSectionHeader from "../LotSectionHeader/LotSectionHeader";
import { useModal, useStyle } from "@/hooks";
import { criteriaService, plantLotService } from "@/services";
import {
  CriteriaApplyRequest,
  CriteriaCheckData,
  CriteriaCheckRequest,
  GetCriteriaCheck,
  GetCriteriaObject,
} from "@/payloads";
import { Icons } from "@/assets";
import ApplyCriteriaModal from "../../PlantLot/ApplyCriteriaModal";
import { toast } from "react-toastify";
import UpdateQuantityModal from "./updateQuantityModal";
import { CRITERIA_TARGETS, MESSAGES } from "@/constants";

function PlantLotCriteria() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [criteriaGroups, setCriteriaGroups] = useState<GetCriteriaObject[]>([]);
  const [initialCriteria, setInitialGroups] = useState<Record<number, boolean>>({});
  const [updatedCriteria, setUpdatedCriteria] = useState<Record<number, boolean>>({});
  const { lot, setLot } = usePlantLotStore();
  const { styles } = useStyle();
  const { isDirty } = useDirtyStore();
  const criteriaModal = useModal<{ id?: number }>();
  const cancelConfirmModal = useModal();
  const quantityModal = useModal<{ target: string }>();
  if (!lot) return;

  const fetchCriteriaPlantLot = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // ⏳ Delay 1 giây
    try {
      const res = await criteriaService.getCriteriaOfLandPlot(Number(lot.plantLotId));
      // console.log(res);

      if (res.statusCode === 200) {
        setCriteriaGroups(res.data ?? []);
        const initialState = res.data.reduce((acc, group) => {
          group.criteriaList.forEach((item) => {
            acc[item.criteriaId] = item.isChecked;
          });
          return acc;
        }, {} as Record<number, boolean>);

        setInitialGroups(initialState);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCriteriaPlantLot();
  }, []);

  if (isLoading) return <LoadingSkeleton rows={10} />;

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
    isCompletedCheckUpdate?: boolean,
    quantity?: number,
  ) => {
    if (!target) return;
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

    if (target && isCompletedCheckUpdate && !quantity) {
      quantityModal.showModal({ target });
      return;
    }

    if (target === CRITERIA_TARGETS["Plantlot Evaluation"] && quantity) {
      if (quantity > lot.inputQuantity) {
        toast.error(MESSAGES.LOT_CRITERIA_EVALUATION);
        return;
      }
    } else if (target === CRITERIA_TARGETS["Plantlot Condition"] && quantity) {
      if (quantity > lot.previousQuantity) {
        toast.error(MESSAGES.LOT_CRITERIA_CONDITION);
        return;
      }
    }

    try {
      setIsLoading(true);
      var res = await criteriaService.checkCriteria(payload);
      if (quantity)
        await plantLotService.updateQuantityLot(lot.plantLotId, target, Number(quantity));
      if (res.statusCode === 200) {
        toast.success(res.message);
        quantityModal.hideModal();
        await fetchCriteriaPlantLot();
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (groupKey: string) => {};

  const criteriaColumns = (isConditionCompleted: boolean) => [
    {
      title: "#",
      key: "index",
      align: "center" as const,
      render: (_: any, __: any, rowIndex: number) => rowIndex + 1,
    },
    {
      title: "Name",
      dataIndex: "criteriaName",
      key: "criteriaName",
      align: "center" as const,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      align: "center" as const,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      align: "center" as const,
    },
    {
      title: "Is Completed",
      key: "isChecked",
      align: "center" as const,
      render: (_: any, record: GetCriteriaCheck) => (
        <Checkbox
          className={styles.customCheckbox}
          checked={record.isChecked}
          disabled={isConditionCompleted}
          onChange={(e) => handleCompletedChange(record.criteriaId, e.target.checked)}
        />
      ),
    },
  ];

  const renderPanelTitle = (
    title: string,
    target: string,
    data: GetCriteriaCheck[],
    isCompletedCheckUpdate: boolean,
  ) => {
    const completedCount = data.filter((item) => item.isChecked).length;
    const hasChanges = data.some(
      (item) =>
        updatedCriteria[item.criteriaId] !== undefined &&
        updatedCriteria[item.criteriaId] !== initialCriteria[item.criteriaId],
    );
    return (
      <Flex className={style.headerWrapper} gap={40}>
        <span className={style.panelTitle}>
          {title} - <span className={style.targetText}>{target}</span>
          <span className={style.completedCount}>
            ({completedCount}/{data.length})
          </span>
        </span>
        <Flex align="center" gap={20}>
          <Tooltip title="Delete">
            <Icons.delete
              className={style.deleteIcon}
              onClick={(e) => {
                e.stopPropagation(); // Ngăn chặn mở Collapse khi nhấn nút Delete
                // handleDelete(group.masterTypeId);
              }}
            />
          </Tooltip>
          {hasChanges && (
            <CustomButton
              label="Save"
              height="24px"
              fontSize="14px"
              handleOnClick={(e) => {
                e.stopPropagation();
                handleSave(target, isCompletedCheckUpdate);
              }}
            />
          )}
        </Flex>
      </Flex>
    );
  };

  return (
    <Flex className={style.contentDetailWrapper}>
      <LotSectionHeader
        lot={lot}
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
              const isCompletedCheckUpdate = group.criteriaList.every(
                (item) => updatedCriteria[item.criteriaId] ?? item.isChecked,
              );

              return (
                <Collapse.Panel
                  header={renderPanelTitle(
                    group.masterTypeName,
                    group.target,
                    group.criteriaList,
                    isCompletedCheckUpdate,
                  )}
                  key={group.masterTypeId}
                >
                  <div className={style.criteriaTableWrapper}>
                    <Table
                      columns={criteriaColumns(isConditionCompleted)}
                      dataSource={group.criteriaList}
                      pagination={false}
                      bordered
                      className={style.criteriaTable}
                    />
                  </div>
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
        onSave={(quantity) => handleSave(quantityModal.modalState.data?.target, true, quantity)}
        target={quantityModal.modalState.data?.target}
        isLoadingAction={isLoading}
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
