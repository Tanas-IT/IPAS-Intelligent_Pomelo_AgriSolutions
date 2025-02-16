import style from "./MapControls.module.scss";
import { Button } from "antd";

interface MapControlsProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({ label, icon, onClick }) => {
  return (
    <Button className={`${style.btn}`} icon={icon} onClick={onClick} htmlType="button">
      {label}
    </Button>
  );
};

export default MapControls;
