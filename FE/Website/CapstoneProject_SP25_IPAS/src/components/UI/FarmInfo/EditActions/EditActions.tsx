import { Flex } from "antd";
import { CustomButton } from "@/components";
import style from "./EditActions.module.scss";

interface EditActionsProps {
  handleCancel: () => void;
  handleSave: () => void;
  label?: string;
}

const EditActions: React.FC<EditActionsProps> = ({
  handleCancel,
  handleSave,
  label = "Save Changes",
}) => {
  return (
    <Flex className={style.btnWrapper}>
      <CustomButton label="Cancel" isCancel handleOnClick={handleCancel} />
      <CustomButton label={label} handleOnClick={handleSave} />
    </Flex>
  );
};

export default EditActions;
