import { MasterTypeDetail } from "@/payloads";
import styles from "./MasterType.module.scss"; // import css file
import { Flex } from "antd";

export const MasterTypeDetailView: React.FC<{ masterTypeDetail: MasterTypeDetail }> = ({
  masterTypeDetail,
}) => (
  <div className={styles.masterTypeDetailContainer}>
    <Flex gap={4} justify="flex-start" align="center">
      <span className={styles.masterTypeDetailName}>{masterTypeDetail.masterTypeDetailName}:</span>
      <span className={styles.masterTypeDetailValue}>{masterTypeDetail.value}</span>
    </Flex>
  </div>
);
