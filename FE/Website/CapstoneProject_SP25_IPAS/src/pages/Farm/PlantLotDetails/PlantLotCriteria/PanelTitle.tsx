import { Flex } from "antd";
import style from "./PlantLotCriteria.module.scss";
import { Icons } from "@/assets";
import { CustomButton, Tooltip } from "@/components";
import { GetCriteriaCheck } from "@/payloads";
import { formatDate } from "@/utils";

interface PanelTitleProps {
  title: string;
  target: string;
  criteriaSetId: number;
  data: GetCriteriaCheck[];
  isAllCompletedCheckUpdate: boolean;
  isAllConditionChecked: boolean;
  updatedCriteria: Record<string, boolean>;
  initialCriteria: Record<string, boolean>;
  handleCancel: () => void;
  handleSave: (
    target: string,
    isAllCompletedCheckUpdate: boolean,
    isAllConditionChecked: boolean,
  ) => void;
  handleDelete: (criteriaSetId: number) => void;
  isCompleted?: boolean;
}

export const PanelTitle = ({
  title,
  target,
  criteriaSetId,
  data,
  isAllCompletedCheckUpdate,
  isAllConditionChecked,
  updatedCriteria,
  initialCriteria,
  handleCancel,
  handleSave,
  handleDelete,
  isCompleted = false,
}: PanelTitleProps) => {
  const completedCount = data.filter((item) => item.isChecked).length;
  const hasChanges = data.some(
    (item) =>
      updatedCriteria[item.criteriaId] !== undefined &&
      updatedCriteria[item.criteriaId] !== initialCriteria[item.criteriaId],
  );
  const isAllInitialCriteriaChecked = data.every((item) => initialCriteria[item.criteriaId]);
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
        {!isCompleted && !isAllInitialCriteriaChecked && (
          <Tooltip title="Delete">
            <Icons.delete
              className={style.deleteIcon}
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(criteriaSetId);
              }}
            />
          </Tooltip>
        )}
        {hasChanges && (
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
        )}
      </Flex>
    </Flex>
  );
};
