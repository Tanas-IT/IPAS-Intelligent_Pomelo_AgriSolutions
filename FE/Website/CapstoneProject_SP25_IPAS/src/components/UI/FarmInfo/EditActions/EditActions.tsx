import { Flex } from "antd";
import { CustomButton } from "@/components";
import style from "./EditActions.module.scss";

interface EditActionsProps {
  handleBtn1: () => void;
  handleBtn2: () => void;
  labelBtn1?: string;
  labelBtn2?: string;
  isCancel?: boolean;
  isLoading?: boolean;
}

const EditActions: React.FC<EditActionsProps> = ({
  handleBtn1,
  handleBtn2,
  labelBtn1 = "Cancel",
  labelBtn2 = "Save Changes",
  isCancel = true,
  isLoading = false,
}) => {
  return (
    <Flex className={style.btnWrapper}>
      <CustomButton label={labelBtn1} isCancel={isCancel} handleOnClick={handleBtn1} />
      <CustomButton label={labelBtn2} handleOnClick={handleBtn2} isLoading={isLoading} />
    </Flex>
  );
};

export default EditActions;
