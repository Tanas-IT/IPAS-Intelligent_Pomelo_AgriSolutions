import style from "./CustomButton.module.scss";
import { Button } from "antd";

interface CustomButtonProps {
  label: string;
  icon?: React.ReactNode;
  handleOnClick?: () => void;
  isCancel?: boolean;
  htmlType?: "button" | "submit" | "reset";
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  icon,
  handleOnClick,
  isCancel = false,
  htmlType = "button",
}) => {
  return (
    <Button
      className={` ${isCancel ? style.cancelBtn : style.btn}`}
      icon={icon}
      onClick={handleOnClick}
      htmlType={htmlType}
    >
      {label}
    </Button>
  );
};

export default CustomButton;
