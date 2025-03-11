import { ActionMenuPlant } from "@/components";
import { Flex, Tag, Tooltip } from "antd";
import style from "./PlantDetail.module.scss";
import { GetPlantDetail } from "@/payloads";
import { Icons } from "@/assets";
import { healthStatusColors } from "@/constants";
import { useModal } from "@/hooks";

const PlantSectionHeader = ({
  plant,
  formModal,
  deleteConfirmModal,
  markAsDeadModal,
}: {
  plant: GetPlantDetail;
  formModal: ReturnType<typeof useModal<GetPlantDetail>>;
  deleteConfirmModal: ReturnType<typeof useModal<{ id: number }>>;
  markAsDeadModal: ReturnType<typeof useModal<{ id: number }>>;
}) => {
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
        <Flex>
          <ActionMenuPlant
            isPlantDead={plant.isDead}
            noView={true}
            onEdit={() => formModal.showModal(plant)}
            onDelete={() => deleteConfirmModal.showModal({ id: plant.plantId })}
            onMarkAsDead={() => markAsDeadModal.showModal({ id: plant.plantId })}
          />
        </Flex>
      </Flex>
      <label className={style.subTitle}>Code: {plant.plantCode}</label>
    </Flex>
  );
};

export default PlantSectionHeader;
