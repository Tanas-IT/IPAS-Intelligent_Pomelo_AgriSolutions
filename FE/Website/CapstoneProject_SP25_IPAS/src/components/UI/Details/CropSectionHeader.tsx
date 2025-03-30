import { Flex, Tag, Tooltip } from "antd";
import style from "./Details.module.scss";
import { Icons } from "@/assets";
import { ActionMenuCrop } from "@/components";
import { useModal } from "@/hooks";
import { GetCropDetail } from "@/payloads";

const CropSectionHeader = ({
  crop,
  formModal,
  deleteConfirmModal,
}: {
  crop?: GetCropDetail;
  formModal?: ReturnType<typeof useModal<GetCropDetail>>;
  deleteConfirmModal?: ReturnType<typeof useModal<{ id: number }>>;
}) => {
  if (!crop) return;
  return (
    <Flex className={style.contentSectionHeader}>
      <Flex className={style.contentSectionTitle}>
        <Flex className={style.contentSectionTitleLeft}>
          <label className={style.title}>{crop.cropName}</label>
          <Tooltip title="Hello">
            <Icons.tag className={style.iconTag} />
          </Tooltip>
          <Tag className={style.statusTag} color={"default"}>
            {crop.status || "Unknown"}
          </Tag>
        </Flex>

        <Flex>
          <ActionMenuCrop
            onEdit={() => formModal?.showModal(crop)}
            onDelete={() => deleteConfirmModal?.showModal({ id: crop.cropId })}
          />
        </Flex>
      </Flex>
      <label className={style.subTitle}>Code: {crop.cropCode}</label>
    </Flex>
  );
};

export default CropSectionHeader;
