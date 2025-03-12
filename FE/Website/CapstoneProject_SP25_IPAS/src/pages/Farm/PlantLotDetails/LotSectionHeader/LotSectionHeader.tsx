import { Button, Flex, Tag, Tooltip } from "antd";
import style from "./LotSectionHeader.module.scss";
import { GetPlantLotDetail } from "@/payloads";
import { Icons } from "@/assets";
import { CustomButton } from "@/components";
import { useState } from "react";

const LotSectionHeader = ({
  lot,
  isCriteria = false,
}: {
  lot: GetPlantLotDetail | null;
  isCriteria?: boolean;
}) => {
  if (!lot) return;
  const [isPassed, setIsPassed] = useState(false);
  const handleMarkAsPassed = () => {
    setIsPassed(true);
    console.log(`Lot ${lot.plantLotName} marked as Passed!`);
  };

  return (
    <Flex className={style.contentSectionHeader}>
      <Flex className={style.contentSectionTitle}>
        <Flex className={style.contentSectionTitleLeft}>
          <label className={style.title}>{lot.plantLotName}</label>
          <Tooltip title="Hello">
            <Icons.tag className={style.iconTag} />
          </Tooltip>
          {/* <Tag
            className={style.statusTag}
            color={healthStatusColors[lot.healthStatus] || "default"}
          >
            {lot.healthStatus || "Unknown"}
          </Tag> */}
          <Flex className={style.actionButtons}>
            {!lot.isPassed ? (
              <Button type="primary" onClick={handleMarkAsPassed}>
                Mark as Passed
              </Button>
            ) : (
              <Tag color="green" className={style.passedTag}>
                ✅ Lot Passed
              </Tag>
            )}
          </Flex>
        </Flex>

        {isCriteria && (
          <Flex>
            <CustomButton label="Add New Criteria" icon={<Icons.plus />} />
          </Flex>
        )}
      </Flex>
      <label className={style.subTitle}>Code: {lot.plantLotCode}</label>
    </Flex>
  );
};

export default LotSectionHeader;
