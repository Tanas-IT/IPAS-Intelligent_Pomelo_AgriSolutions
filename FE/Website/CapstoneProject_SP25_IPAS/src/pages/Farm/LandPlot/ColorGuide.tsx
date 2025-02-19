import { Flex } from "antd";
import style from "./LandPlot.module.scss";

interface ColorGuideItem {
  label: string;
  colorClass: string;
}

const colorGuideItems: ColorGuideItem[] = [
  { label: "Normal land plot", colorClass: style.green },
  { label: "Dangerous land plot", colorClass: style.red },
  { label: "Selected land plot", colorClass: style.blue },
  { label: "Searched land plot", colorClass: style.orange },
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
