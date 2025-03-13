import { Flex } from "antd";
import style from "./Details.module.scss";

const InfoFieldDetail = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | number;
}) => {
  const displayValue =
    value === undefined || value === null || (typeof value === "string" && !value.trim())
      ? "N/A"
      : value;

  return (
    <Flex className={style.infoFieldDetail}>
      <Flex className={style.fieldLabelWrapper}>
        <Icon className={style.fieldIcon} />
        <label className={style.fieldLabel}>{label}:</label>
      </Flex>
      <label className={style.fieldValue}>{displayValue}</label>
    </Flex>
  );
};

export default InfoFieldDetail;
