import { ActionMenuPlant, CustomButton } from "@/components";
import { Flex, Tag, Tooltip } from "antd";
import style from "./Details.module.scss";
import { GetPlantDetail } from "@/payloads";
import { Icons } from "@/assets";
import { healthStatusColors } from "@/constants";
import { useModal } from "@/hooks";
import { usePlantStore } from "@/stores";
import { formatDate } from "@/utils";

const PlantSectionHeader = ({
  formModal,
  deleteConfirmModal,
  markAsDeadModal,
  onApplyCriteria,
  onCreateGraftedBranch,
  onAddNewIssue,
}: {
  formModal?: ReturnType<typeof useModal<GetPlantDetail>>;
  deleteConfirmModal?: ReturnType<typeof useModal<{ id: number }>>;
  markAsDeadModal?: ReturnType<typeof useModal<{ id: number }>>;
  onApplyCriteria?: () => void;
  onCreateGraftedBranch?: () => void;
  onAddNewIssue?: () => void;
}) => {
  const { plant } = usePlantStore();
  if (!plant) return;
  return (
    <Flex className={style.contentSectionHeader}>
      <Flex className={style.contentSectionTitle}>
        <Flex className={style.contentSectionTitleLeft}>
          <label className={style.title}>{plant.plantName}</label>
          <Tooltip title="Plant">
            <Icons.tag className={style.iconTag} />
          </Tooltip>
          <Tag
            className={style.statusTag}
            color={healthStatusColors[plant.healthStatus] || "default"}
          >
            {plant.healthStatus || "Unknown"}
          </Tag>
          {onCreateGraftedBranch &&
            (plant.isPassed ? (
              <Tag color="green" className={style.passedTag}>
                ✅ Grafting Eligible ({formatDate(plant.passedDate)})
              </Tag>
            ) : (
              <Tag color="red" className={style.passedTag}>
                ❌ Not Eligible
              </Tag>
            ))}
        </Flex>
        {onApplyCriteria && !plant.isDead && (
          <Flex>
            <CustomButton
              label="Add New Criteria"
              icon={<Icons.plus />}
              handleOnClick={onApplyCriteria}
            />
          </Flex>
        )}
        {!onApplyCriteria && formModal && (
          <Flex>
            <ActionMenuPlant
              isPlantDead={plant.isDead}
              onEdit={() => formModal?.showModal(plant)}
              onDelete={() => deleteConfirmModal?.showModal({ id: plant.plantId })}
              onMarkAsDead={() => markAsDeadModal?.showModal({ id: plant.plantId })}
            />
          </Flex>
        )}
        {!onApplyCriteria && !formModal && onCreateGraftedBranch && (
          <Flex>
            <CustomButton
              label="Create Grafted Plants"
              icon={<Icons.plus />}
              disabled={!plant.isPassed}
              handleOnClick={onCreateGraftedBranch}
            />
          </Flex>
        )}
        {onAddNewIssue && !plant.isDead && (
          <Flex>
            <CustomButton
              label="Add New Issue"
              icon={<Icons.plus />}
              handleOnClick={onAddNewIssue}
            />
          </Flex>
        )}
      </Flex>
      <label className={style.subTitle}>Code: {plant.plantCode}</label>
    </Flex>
  );
};

export default PlantSectionHeader;
