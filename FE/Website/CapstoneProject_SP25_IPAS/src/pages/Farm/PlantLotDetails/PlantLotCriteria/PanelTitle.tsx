import { Flex, Tag } from "antd";
import style from "./PlantLotCriteria.module.scss";
import { Icons } from "@/assets";
import { CustomButton, MapControls, Tooltip } from "@/components";
import { GetCriteriaCheck } from "@/payloads";
import { formatDateRange } from "@/utils";
import { usePlantLotStore } from "@/stores";
import { CRITERIA_TARGETS } from "@/constants";

interface PanelTitleProps {
  title: string;
  target: string;
  targetDisplay: string;
  criteriaSetId: number;
  data: GetCriteriaCheck[];
  isAllConditionChecked: boolean;
  isAllConditionPassed: boolean;
  isAllEvaluationChecked: boolean;
  isAllEvaluationPassed: boolean;
  updatedCriteria: Record<string, number | null>;
  initialCriteria: Record<string, number | null>;
  handleCancel: () => void;
  handleSave: (isAllConditionChecked: boolean, target: string) => void;
  handleDelete: (criteriaSetId: number) => void;
  onUpdateQuantity: (target: string, isAllPass: boolean) => void;
  isCompleted?: boolean;
}

const PanelTitle = ({
  title,
  target,
  targetDisplay,
  criteriaSetId,
  data,
  isAllConditionChecked,
  isAllConditionPassed,
  isAllEvaluationChecked,
  isAllEvaluationPassed,
  updatedCriteria,
  initialCriteria,
  handleCancel,
  handleSave,
  handleDelete,
  onUpdateQuantity,
  isCompleted = false,
}: PanelTitleProps) => {
  const { lot } = usePlantLotStore();
  if (!lot) return;
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

  const isEvaluationFailed = isAllConditionChecked && !isAllConditionPassed;

  return (
    <Flex className={style.headerWrapper} gap={24}>
      <span className={style.panelTitle}>
        {title} - <span className={style.targetText}>{targetDisplay}</span>
        <span className={style.date}>{formatDateRange(startDate, endDate || undefined)}</span>
        <span className={style.completedCount}>
          ({completedCount}/{data.length})
        </span>
        <span className={style.statusTag}>
          {isEvaluationFailed && target === CRITERIA_TARGETS["Plantlot Evaluation"] ? (
            <Tag color="red">Failed</Tag>
          ) : (
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
          )}
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
        {isAllConditionChecked &&
          ((!lot.isFromGrafted && lot.inputQuantity == null) || lot.isFromGrafted) &&
          !lot.isPassed &&
          target === CRITERIA_TARGETS["Plantlot Condition"] && (
            <MapControls
              icon={<Icons.edit />}
              label="Update Check Quantity"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQuantity(target, isAllConditionPassed);
              }}
            />
          )}
        {isAllConditionChecked &&
          isAllEvaluationChecked &&
          isAllEvaluationPassed &&
          lot.inputQuantity !== undefined &&
          lot.inputQuantity !== null &&
          !lot.isPassed &&
          target === CRITERIA_TARGETS["Plantlot Evaluation"] && (
            <MapControls
              icon={<Icons.edit />}
              label="Update Qualified Quantity"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQuantity(target, isAllConditionPassed);
              }}
            />
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
                handleSave(isAllConditionChecked, target);
              }}
            />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default PanelTitle;
