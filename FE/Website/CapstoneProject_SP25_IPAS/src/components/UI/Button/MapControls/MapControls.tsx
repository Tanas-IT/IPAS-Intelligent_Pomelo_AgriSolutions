import style from "./MapControls.module.scss";
import { Button } from "antd";

interface MapControlsProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  isDisabled?: boolean;
}

const MapControls: React.FC<MapControlsProps> = ({ label, icon, onClick, isDisabled = false }) => {
  return (
    <Button
      className={`${style.btn} `}
      icon={icon}
      onClick={onClick}
      htmlType="button"
      disabled={isDisabled}
    >
      {label}
    </Button>
  );
};

export default MapControls;
