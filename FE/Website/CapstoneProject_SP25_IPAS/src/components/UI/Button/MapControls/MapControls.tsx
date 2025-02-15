import style from "./MapControls.module.scss";
import { Button } from "antd";

interface MapControlsProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  isAction?: boolean;
  isModal?: boolean;
}

const MapControls: React.FC<MapControlsProps> = ({
  label,
  icon,
  onClick,
  isAction = false,
  isModal = false,
}) => {
  return (
    <Button
      className={`${isAction ? style.btnAction : isModal ? style.btnModal : style.btn}`}
      icon={icon}
      onClick={onClick}
      htmlType="button"
    >
      {label}
    </Button>
  );
};

export default MapControls;
