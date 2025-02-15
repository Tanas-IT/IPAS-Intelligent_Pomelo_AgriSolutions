import style from "./LandPlotActions.module.scss";
import { Button } from "antd";

interface LandPlotActionsProps {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  isAction?: boolean;
  isModal?: boolean;
}

const LandPlotActions: React.FC<LandPlotActionsProps> = ({
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

export default LandPlotActions;
