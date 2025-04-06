import { Flex, Tag, Tooltip } from "antd";
import style from "./Details.module.scss";
import { Icons } from "@/assets";
import { ActionMenuCrop, CustomButton } from "@/components";
import { useModal } from "@/hooks";
import { GetCropDetail, GetHarvestDay } from "@/payloads";
import { useCropStore } from "@/stores";
import { CROP_STATUS, cropStatusColors } from "@/constants";

const CropSectionHeader = ({
  formModal,
  deleteConfirmModal,
  onAddNewHarvest,
}: {
  formModal?: ReturnType<typeof useModal<GetCropDetail>>;
  deleteConfirmModal?: ReturnType<typeof useModal<{ id: number }>>;
  onAddNewHarvest?: () => void;
}) => {
  const { crop } = useCropStore();
  if (!crop) return;

  return (
    <Flex className={style.contentSectionHeader}>
      <Flex className={style.contentSectionTitle}>
        <Flex className={style.contentSectionTitleLeft}>
          <label className={style.title}>{crop.cropName}</label>
          <Tooltip title="Hello">
            <Icons.tag className={style.iconTag} />
          </Tooltip>
          <Tag className={style.statusTag} color={cropStatusColors[crop.status] || "default"}>
            {crop.status || "Unknown"}
          </Tag>
        </Flex>

        <Flex>
          {formModal && deleteConfirmModal && (
            <ActionMenuCrop
              onEdit={() => formModal?.showModal(crop)}
              onDelete={() => deleteConfirmModal?.showModal({ id: crop.cropId })}
            />
          )}

          {onAddNewHarvest && crop.status !== CROP_STATUS.COMPLETED && (
            <Flex>
              <CustomButton
                label="Add New Harvest"
                icon={<Icons.plus />}
                handleOnClick={onAddNewHarvest}
                // disabled={graftedPlant.isCompleted}
              />
            </Flex>
          )}
        </Flex>
      </Flex>
      <label className={style.subTitle}>Code: {crop.cropCode}</label>
    </Flex>
  );
};

export default CropSectionHeader;
