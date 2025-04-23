import { Flex } from "antd";
import style from "./PlotDetailItem.module.scss";

interface PlotDetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const PlotDetailItem = ({ icon, label, value }: PlotDetailItemProps) => (
  <Flex className={style.plotItemDetails}>
    <Flex className={style.plotItemDetail}>
      {icon}
      <label>{label}:</label>
    </Flex>
    {value}
  </Flex>
);
export default PlotDetailItem;
