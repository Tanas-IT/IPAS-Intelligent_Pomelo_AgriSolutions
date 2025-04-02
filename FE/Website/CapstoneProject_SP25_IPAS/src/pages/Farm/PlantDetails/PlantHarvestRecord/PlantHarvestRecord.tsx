import { PlantSectionHeader } from "@/components";
import { Divider, Flex } from "antd";
import style from "./PlantHarvestRecord.module.scss";

function PlantHarvestRecord() {
  return (
    <Flex className={style.contentDetailWrapper}>
      <PlantSectionHeader />
      <Divider className={style.divider} />
      <Flex className={style.contentSectionBody} vertical>
        <h1>PlantHarvestRecord</h1>
      </Flex>
    </Flex>
  );
}
export default PlantHarvestRecord;
