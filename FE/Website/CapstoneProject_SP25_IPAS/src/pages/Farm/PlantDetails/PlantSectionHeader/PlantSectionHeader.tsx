import { ActionMenuPlant, CustomButton } from "@/components";
import { Flex, Tag, Tooltip } from "antd";
import style from "./PlantSectionHeader.module.scss";
import { GetPlantDetail } from "@/payloads";
import { Icons } from "@/assets";
import { healthStatusColors } from "@/constants";
import { useModal } from "@/hooks";
import { usePlantStore } from "@/stores";

const PlantSectionHeader = ({
  isCriteria = false,
  isDetail = false,
  formModal,
  deleteConfirmModal,
  markAsDeadModal,
  onApplyCriteria,
}: {
  isCriteria?: boolean;
  isDetail?: boolean;
  formModal?: ReturnType<typeof useModal<GetPlantDetail>>;
  deleteConfirmModal?: ReturnType<typeof useModal<{ id: number }>>;
  markAsDeadModal?: ReturnType<typeof useModal<{ id: number }>>;
  onApplyCriteria?: () => void;
}) => {
  const { plant, setPlant } = usePlantStore();
  if (!plant) return;
  return (
    <Flex className={style.contentSectionHeader}>
      <Flex className={style.contentSectionTitle}>
        <Flex className={style.contentSectionTitleLeft}>
          <label className={style.title}>{plant.plantName}</label>
          <Tooltip title="Hello">
            <Icons.tag className={style.iconTag} />
          </Tooltip>
          <Tag
            className={style.statusTag}
            color={healthStatusColors[plant.healthStatus] || "default"}
          >
            {plant.healthStatus || "Unknown"}
          </Tag>
        </Flex>
        {isCriteria && (
          <Flex>
            <CustomButton
              label="Add New Criteria"
              icon={<Icons.plus />}
              handleOnClick={onApplyCriteria}
            />
          </Flex>
        )}
        {!isCriteria && isDetail && (
          <Flex>
            <ActionMenuPlant
              isPlantDead={plant.isDead}
              noView={true}
              onEdit={() => formModal?.showModal(plant)}
              onDelete={() => deleteConfirmModal?.showModal({ id: plant.plantId })}
              onMarkAsDead={() => markAsDeadModal?.showModal({ id: plant.plantId })}
            />
          </Flex>
        )}
      </Flex>
      <label className={style.subTitle}>Code: {plant.plantCode}</label>
    </Flex>
  );
};

export default PlantSectionHeader;
