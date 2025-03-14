import { Flex, Tooltip } from "antd";
import style from "./PlantLotCriteria.module.scss";
import { Icons } from "@/assets";
import { CustomButton } from "@/components";

interface PanelTitleProps {
  title: string;
  target: string;
  data: any[];
  isAllCompletedCheckUpdate: boolean;
  isAllConditionChecked: boolean;
  updatedCriteria: Record<string, any>;
  initialCriteria: Record<string, any>;
  handleCancel: () => void;
  handleSave: (
    target: string,
    isAllCompletedCheckUpdate: boolean,
    isAllConditionChecked: boolean,
  ) => void;
}

export const PanelTitle = ({
  title,
  target,
  data,
  isAllCompletedCheckUpdate,
  isAllConditionChecked,
  updatedCriteria,
  initialCriteria,
  handleCancel,
  handleSave,
}: PanelTitleProps) => {
  const completedCount = data.filter((item) => item.isChecked).length;
  const hasChanges = data.some(
    (item) =>
      updatedCriteria[item.criteriaId] !== undefined &&
      updatedCriteria[item.criteriaId] !== initialCriteria[item.criteriaId],
  );

  return (
    <Flex className={style.headerWrapper} gap={40}>
      <span className={style.panelTitle}>
        {title} - <span className={style.targetText}>{target}</span>
        <span className={style.completedCount}>
          ({completedCount}/{data.length})
        </span>
      </span>
      <Flex align="center" gap={20}>
        <Tooltip title="Delete">
          <Icons.delete className={style.deleteIcon} onClick={(e) => e.stopPropagation()} />
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
                handleSave(target, isAllCompletedCheckUpdate, isAllConditionChecked);
              }}
            />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};
