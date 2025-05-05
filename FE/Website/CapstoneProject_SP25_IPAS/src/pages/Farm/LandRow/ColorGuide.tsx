import { Flex } from "antd";
import style from "./LandRow.module.scss";
import { DEAD_STATUS, HEALTH_STATUS } from "@/constants";

interface ColorGuideItem {
  label: string;
  colorClass: string;
}

const colorGuideItems: ColorGuideItem[] = [
  { label: HEALTH_STATUS.HEALTHY, colorClass: style.green },
  { label: HEALTH_STATUS.MINOR_ISSUE, colorClass: style.orange },
  { label: HEALTH_STATUS.SERIOUS_ISSUE, colorClass: style.red },
  { label: DEAD_STATUS, colorClass: style.gray },
];

const ColorGuide: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <Flex className={style.colorGuidContainer}>
      <Flex className={style.popupHeader} justify="space-between" align="center">
        <h4>Color Guide</h4>
        <button className={style.closeButton} onClick={onClose}>
          ✖
        </button>
      </Flex>
      <Flex className={style.contentWrapper}>
        {colorGuideItems.map(({ label, colorClass }) => (
          <Flex className={style.row} key={label}>
            <div className={`${style.landPlotColor} ${colorClass}`} />
            <label>{label}</label>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default ColorGuide;
