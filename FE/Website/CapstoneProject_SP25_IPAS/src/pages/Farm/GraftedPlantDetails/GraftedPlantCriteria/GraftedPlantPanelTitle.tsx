import { Flex, Tag } from "antd";
import style from "./GraftedPlantCriteria.module.scss";
import { Icons } from "@/assets";
import { CustomButton, Tooltip } from "@/components";
import { GetCriteriaCheck } from "@/payloads";
import { formatDateRange } from "@/utils";

interface GraftedPlantPanelTitleProps {
  title: string;
  target: string;
  criteriaSetId: number;
  updatedCriteria: Record<string, number | null>;
  initialCriteria: Record<string, number | null>;
  data: GetCriteriaCheck[];
  handleCancel: () => void;
  handleSave: () => void;
  handleDelete: (criteriaSetId: number) => void;
  isCompleted?: boolean;
}

export const GraftedPlantPanelTitle = ({
  title,
  target,
  criteriaSetId,
  updatedCriteria,
  initialCriteria,
  data,
  handleDelete,
  handleCancel,
  handleSave,
  isCompleted = false,
}: GraftedPlantPanelTitleProps) => {
  const completedCount = data.filter((item) => item.isPassed).length;
  const hasChanges = data.some(
    (item) =>
      updatedCriteria[item.criteriaId] !== undefined &&
      updatedCriteria[item.criteriaId] !== initialCriteria[item.criteriaId],
  );
  const isAllInitialCriteriaChecked = data.every((item) => initialCriteria[item.criteriaId]);

  const startDate = data[0].createDate;
  const endDate =
    isAllInitialCriteriaChecked &&
    data.reduce((max, item) => {
      return item.checkedDate && new Date(item.checkedDate) > new Date(max)
        ? item.checkedDate
        : max;
    }, startDate);
  return (
    <Flex className={style.headerWrapper} gap={24}>
      <span className={style.panelTitle}>
        {title} - <span className={style.targetText}>{target}</span>
        <span className={style.date}>{formatDateRange(startDate, endDate || undefined)}</span>
        <span className={style.completedCount}>
          ({completedCount}/{data.length})
        </span>
        <span className={style.statusTag}>
          <Tag
            color={
              completedCount === data.length
                ? "green"
                : isAllInitialCriteriaChecked
                ? "red"
                : "orange"
            }
          >
            {completedCount === data.length
              ? "Pass"
              : isAllInitialCriteriaChecked
              ? "Not Pass"
              : "Checking"}
          </Tag>
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
                handleSave();
              }}
            />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};
