import { Flex } from "antd";
import style from "./PlantCriteria.module.scss";
import { Icons } from "@/assets";
import { CustomButton, Tooltip } from "@/components";
import { GetCriteriaCheck } from "@/payloads";
import { formatDate } from "@/utils";

interface PlantPanelTitleProps {
  title: string;
  target: string;
  criteriaSetId: number;
  data: GetCriteriaCheck[];
  handleDelete: (criteriaSetId: number) => void;
  isCompleted?: boolean;
}

export const PlantPanelTitle = ({
  title,
  target,
  criteriaSetId,
  data,
  handleDelete,
  isCompleted = false,
}: PlantPanelTitleProps) => {
  const completedCount = data.filter((item) => item.isPassed).length;
  const date = data[0].createDate;
  return (
    <Flex className={style.headerWrapper} gap={24}>
      <span className={style.panelTitle}>
        {title} - <span className={style.targetText}>{target}</span>
        <span className={style.date}>({formatDate(date)})</span>
        <span className={style.completedCount}>
          ({completedCount}/{data.length})
        </span>
      </span>
      <Flex align="center" gap={20}>
        <Tooltip title="Delete">
          <Icons.delete
            className={style.deleteIcon}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(criteriaSetId);
            }}
          />
        </Tooltip>

        {/* {hasChanges && (
          <Flex gap={10}>
            <CustomButton
              label="Cancel"
              isCancel={true}
              height="24px"
              fontSize="14px"
              handleOnClick={(e) => {
                e.stopPropagation();
                handleCancel();
              }}
            />
            <CustomButton
              label="Save"
              height="24px"
              fontSize="14px"
              handleOnClick={(e) => {
                e.stopPropagation();
                handleSave(target, isAllCompletedCheckUpdate, isAllConditionChecked);
              }}
            />
          </Flex>
        )} */}
      </Flex>
    </Flex>
  );
};
