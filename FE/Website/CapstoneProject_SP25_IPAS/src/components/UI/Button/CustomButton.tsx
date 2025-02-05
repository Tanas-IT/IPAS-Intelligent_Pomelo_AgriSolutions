import style from "./CustomButton.module.scss";
import { Button } from "antd";

interface CustomButtonProps {
  label: string;
  icon?: React.ReactNode;
  handleOnClick?: () => void;
  isCancel?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  icon,
  handleOnClick,
  isCancel = false,
}) => {
  return (
    <Button
      className={` ${isCancel ? style.cancelBtn : style.btn}`}
      icon={icon}
      onClick={handleOnClick}
    >
      {label}
    </Button>
  );
};

export default CustomButton;
