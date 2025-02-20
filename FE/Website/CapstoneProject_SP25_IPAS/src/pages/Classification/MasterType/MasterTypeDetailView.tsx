import styles from "./MasterType.module.scss"; // import css file
import { Flex } from "antd";

export const MasterTypeDetailView: React.FC<{ name: string; value: string }> = ({
  name,
  value,
}) => (
  <div className={styles.masterTypeDetailContainer}>
    <Flex gap={4} justify="flex-start" align="center">
      <span className={styles.masterTypeDetailName}>{name}:</span>
      <span className={styles.masterTypeDetailValue}>{value}</span>
    </Flex>
  </div>
);
