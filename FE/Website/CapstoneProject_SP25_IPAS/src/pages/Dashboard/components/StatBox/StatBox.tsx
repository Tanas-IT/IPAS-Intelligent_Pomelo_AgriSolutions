import { Card, Typography, Progress } from "antd";
import { FC } from "react";
import style from "./StatBox.module.scss"; // Import SCSS với module

const { Title, Text } = Typography;

interface StatBoxProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  progress: number;
  increase: string;
}

const StatBox: FC<StatBoxProps> = ({ title, subtitle, icon, progress, increase }) => {
  return (
    <Card className={style.statBox}>
      <div className={style.statBoxHeader}>
        <div className={style.statBoxIconTitle}>
          {icon}
          <Title level={4} className={style.statBoxTitle}>
            {title}
          </Title>
        </div>
        <Progress type="circle" percent={progress * 100} width={50} />
      </div>
      <div className={style.statBoxFooter}>
        <Text className={style.statBoxSubtitle}>{subtitle}</Text>
        <Text className={style.statBoxIncrease}>{increase}</Text>
      </div>
    </Card>
  );
};

export default StatBox;
