import { Flex } from "antd";
import { CustomButton } from "@/components";
import style from "./EditActions.module.scss";

interface EditActionsProps {
  handleCancel: () => void;
  handleSave: () => void;
}

const EditActions: React.FC<EditActionsProps> = ({ handleCancel, handleSave }) => {
  return (
    <Flex className={style.btnWrapper}>
      <CustomButton label="Cancel" isCancel handleOnClick={handleCancel} />
      <CustomButton label="Save Changes" handleOnClick={handleSave} />
    </Flex>
  );
};

export default EditActions;
