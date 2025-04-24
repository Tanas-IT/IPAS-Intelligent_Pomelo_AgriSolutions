import React, { useEffect, useState } from "react";
import { Flex, Progress } from "antd";
import styles from "./PlantDevelopmentStages.module.scss";
import { dashboardService } from "@/services";

interface DeadAndAlive {
  normalPercentage: number;
  deadPercentage: number;
  total: number;
}

const PlantDevelopmentStages: React.FC = () => {
  const [data, setData] = useState<DeadAndAlive | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardService.getDeadAndAlive();
      setData(res);
    } catch (error) {
      console.error("error", error);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        <div className={styles.item}>
          <Flex justify="space-between">
            <span className={styles.label}>Alive</span>
            <span className={styles.percent}>{data?.normalPercentage ?? 0}%</span>
          </Flex>
          <Progress
            percent={data?.normalPercentage ?? 0}
            showInfo={false}
            strokeColor="#52c41a"
          />
        </div>

        <div className={styles.item}>
          <Flex justify="space-between">
            <span className={styles.label}>Dead</span>
            <span className={styles.percent}>{data?.deadPercentage ?? 0}%</span>
          </Flex>
          <Progress
            percent={data?.deadPercentage ?? 0}
            showInfo={false}
            strokeColor="#ff4d4f"
          />
        </div>
      </div>
    </div>
  );
};

export default PlantDevelopmentStages;
