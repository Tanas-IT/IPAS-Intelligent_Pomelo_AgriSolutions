import { Card, Typography, Progress } from "antd";
import { FC } from "react";
import style from "./StatBox.module.scss";

const { Title, Text } = Typography;

interface StatBoxProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  // progress: number;
  increase?: string;
  variant?: "default" | "large";
}

const StatBox: FC<StatBoxProps> = ({ title, subtitle, icon, increase, variant = "default" }) => {
  return (
    <Card className={`${style.statBox} ${variant === "large" ? style.large : ""}`}>
      <div className={style.statBoxHeader}>
        <div className={style.statBoxIconTitle}>
          <div className={style.statBoxIconWrapper}>{icon}</div>
          <div>
            <Text className={style.statBoxSubtitle}>{subtitle}</Text>
            <h4 className={style.statBoxTitle}>{title}</h4>
          </div>
        </div>
        <Text className={style.statBoxIncrease}>{increase}</Text>
      </div>
    </Card>
  );
};

export default StatBox;
