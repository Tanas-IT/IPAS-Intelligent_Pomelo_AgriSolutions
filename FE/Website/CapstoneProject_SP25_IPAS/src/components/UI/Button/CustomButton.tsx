import { useLoadingStore } from "@/stores";
import style from "./CustomButton.module.scss";
import { Button } from "antd";

interface CustomButtonProps {
  label: string;
  icon?: React.ReactNode;
  handleOnClick?: () => void;
  isCancel?: boolean;
  isLoading?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  icon,
  handleOnClick,
  isCancel = false,
  isLoading,
}) => {
  const { isLoading: globalLoading } = useLoadingStore();

  return (
    <Button
      className={` ${isCancel ? style.cancelBtn : style.btn}`}
      icon={icon}
      onClick={handleOnClick}
      loading={!isCancel && (isLoading ?? globalLoading ?? false)} // Ưu tiên prop, nếu không có thì lấy từ store
    >
      {label}
    </Button>
  );
};

export default CustomButton;
