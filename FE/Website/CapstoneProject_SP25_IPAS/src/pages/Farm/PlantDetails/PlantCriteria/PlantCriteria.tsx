import style from "./PlantCriteria.module.scss";
import { Checkbox, Collapse, Divider, Empty, Flex, Table } from "antd";
import {
  ApplyPlantCriteriaModal,
  ConfirmModal,
  CriteriaPlantCheckTable,
  LoadingSkeleton,
} from "@/components";
import { useEffect, useState } from "react";
import { useDirtyStore, usePlantLotStore, usePlantStore } from "@/stores";
import { useModal, useStyle } from "@/hooks";
import { criteriaService, plantLotService } from "@/services";
import {
  CriteriaApplyRequest,
  CriteriaCheckData,
  CriteriaCheckRequest,
  CriteriaDeleteRequest,
  GetCriteriaObject,
} from "@/payloads";
import { toast } from "react-toastify";
import { CRITERIA_TARGETS } from "@/constants";
import PlantSectionHeader from "../PlantSectionHeader/PlantSectionHeader";
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

  const handlePassChange = () => {};

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
                      data={group.criteriaList}
                      handleDelete={() => {}}
                    />
                  }
                  key={group.masterTypeId}
                >
                  <CriteriaPlantCheckTable
                    data={group.criteriaList}
                    target={group.target}
                    handleValueCheckChange={() => {}}
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
        plantId={criteriaModal.modalState.data?.id}
        isOpen={criteriaModal.modalState.visible}
        onClose={handleCloseCriteria}
        onSave={applyCriteria}
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

export default PlantCriteria;
