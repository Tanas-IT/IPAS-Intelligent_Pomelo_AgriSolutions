import { Card, Flex } from "antd";
import styles from "../../ReportManagement/ReportManagement.module.scss";
// import styles from "./OverviewCard.module.scss";

interface OverviewCardProps {
  icon?: React.ReactNode;
  title: string;
  value: number | string;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ icon, title, value }) => {
  return (
    <Card className={styles.overviewCard}>
      <Flex align="start" gap={20}>
        {icon && (
          <div className={styles.iconContainer}>
            {icon}
          </div>
        )}
        <Flex vertical>
          <p className={styles.title}>{title}</p>
          <p className={styles.overviewValue}>{value}</p>
        </Flex>
      </Flex>
    </Card>
  );
};

export default OverviewCard;
