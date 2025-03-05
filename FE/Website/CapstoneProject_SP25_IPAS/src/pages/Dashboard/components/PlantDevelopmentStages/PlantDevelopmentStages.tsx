import React from "react";
import { Flex, Progress } from "antd";
import styles from "./PlantDevelopmentStages.module.scss";

interface PlantDevelopmentStagesProps {
  data: Record<string, number>;
}

const PlantDevelopmentStages: React.FC<PlantDevelopmentStagesProps> = ({ data }) => {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Plant Development Stages</h3>
      <div className={styles.list}>
        {Object.keys(data).map((stage, index) => (
          <div key={index} className={styles.item}>
            <Flex>
            <span className={styles.label}>{stage}</span>
            <span className={styles.percent}>{data[stage]}%</span>
            </Flex>
            <Progress percent={data[stage]} showInfo={false} strokeColor="#1890ff" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlantDevelopmentStages;
