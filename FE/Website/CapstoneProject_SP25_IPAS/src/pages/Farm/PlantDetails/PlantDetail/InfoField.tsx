import { Flex } from "antd";
import style from "./PlantDetail.module.scss";

const InfoField = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <Flex className={style.infoField}>
    <Flex className={style.fieldLabelWrapper}>
      <Icon className={style.fieldIcon} />
      <label className={style.fieldLabel}>{label}:</label>
    </Flex>
    <label className={style.fieldValue}>{value}</label>
  </Flex>
);

export default InfoField;
