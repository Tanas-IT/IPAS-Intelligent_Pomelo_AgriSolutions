import { useLoadingStore } from "@/stores";
import style from "./CustomButton.module.scss";
import { Button } from "antd";

interface CustomButtonProps {
  label: string;
  icon?: React.ReactNode;
  handleOnClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isCancel?: boolean;
  htmlType?: "button" | "submit" | "reset";
  isLoading?: boolean;
  isModal?: boolean;
  height?: string;
  fontSize?: string;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  icon,
  handleOnClick,
  isCancel = false,
  htmlType = "button",
  isLoading,
  isModal = false,
  height,
  fontSize = "16px",
  disabled = false,
}) => {
  const { isLoading: globalLoading } = useLoadingStore();

  return (
    <Button
      className={`${isCancel ? style.cancelBtn : isModal ? style.btnModal : style.btn} ${
        disabled ? style.disable : ""
      }`}
      icon={icon}
      onClick={handleOnClick}
      htmlType={htmlType}
      loading={!isCancel && (isLoading ?? globalLoading ?? false)} // Ưu tiên prop, nếu không có thì lấy từ store
      style={{ height, fontSize }}
    >
      {label}
    </Button>
  );
};

export default CustomButton;
