import { Button, Flex, Tag, Tooltip } from "antd";
import style from "./Details.module.scss";
import { Icons } from "@/assets";
import { ActionMenuGraftedPlant, ConfirmModal, CustomButton } from "@/components";
import { useDirtyStore, useGraftedPlantStore } from "@/stores";
import { useModal } from "@/hooks";
import { GetGraftedPlantDetail } from "@/payloads";
import { healthStatusColors } from "@/constants";
import CuttingGraftedModal from "./CuttingGraftedModal";
import { useState } from "react";
import { graftedPlantService } from "@/services";
import { toast } from "react-toastify";

const GraftedPlantSectionHeader = ({
  isCriteria = false,
  onApplyCriteria,
  formModal,
  deleteConfirmModal,
}: {
  isCriteria?: boolean;
  onApplyCriteria?: () => void;
  formModal?: ReturnType<typeof useModal<GetGraftedPlantDetail>>;
  deleteConfirmModal?: ReturnType<typeof useModal<{ id: number }>>;
}) => {
  const { graftedPlant, setGraftedPlant } = useGraftedPlantStore();
  const cuttingGraftedModal = useModal();
  const [isLoading, setIsLoading] = useState(false);

  if (!graftedPlant) return;

  const handleCompleteAndCut = async (lotId: number) => {
    setIsLoading(true);
    try {
      var res = await graftedPlantService.updateIsCompletedAndCutting(
        graftedPlant.graftedPlantId,
        lotId,
      );
      if (res.statusCode === 200) {
        setGraftedPlant({ ...graftedPlant, isCompleted: true });
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsLoading(false);
      cuttingGraftedModal.hideModal();
    }
  };

  return (
    <Flex className={style.contentSectionHeader}>
      <Flex className={style.contentSectionTitle}>
        <Flex className={style.contentSectionTitleLeft}>
          <label className={style.title}>{graftedPlant.graftedPlantName}</label>
          <Tooltip title="Hello">
            <Icons.tag className={style.iconTag} />
          </Tooltip>
          <Tag
            className={style.statusTag}
            color={healthStatusColors[graftedPlant.status] || "default"}
          >
            {graftedPlant.status || "Unknown"}
          </Tag>
          <Flex className={style.actionButtons} gap={20}>
            {!graftedPlant.isCompleted ? (
              <Button type="primary" onClick={cuttingGraftedModal.showModal} ghost>
                <Icons.check /> Complete & Move to Lot
              </Button>
            ) : (
              <Flex gap={10}>
                <Tag color="green" className={style.passedTag}>
                  ✅ Grafted Plant Completed
                </Tag>
              </Flex>
            )}
          </Flex>
        </Flex>

        {isCriteria && (
          <Flex>
            <CustomButton
              label="Add New Criteria"
              icon={<Icons.plus />}
              handleOnClick={onApplyCriteria}
              disabled={graftedPlant.isCompleted}
            />
          </Flex>
        )}
        {!isCriteria && (
          <Flex>
            <ActionMenuGraftedPlant
              id={graftedPlant.graftedPlantId}
              isCompleted={graftedPlant.isCompleted}
              noView={true}
              noCriteria
              onEdit={() => formModal?.showModal(graftedPlant)}
              onDelete={() => deleteConfirmModal?.showModal({ id: graftedPlant.graftedPlantId })}
            />
          </Flex>
        )}
      </Flex>
      <label className={style.subTitle}>Code: {graftedPlant.graftedPlantCode}</label>
      <CuttingGraftedModal
        isOpen={cuttingGraftedModal.modalState.visible}
        onClose={cuttingGraftedModal.hideModal}
        onSave={handleCompleteAndCut}
        isLoadingAction={isLoading}
      />
    </Flex>
  );
};

export default GraftedPlantSectionHeader;
