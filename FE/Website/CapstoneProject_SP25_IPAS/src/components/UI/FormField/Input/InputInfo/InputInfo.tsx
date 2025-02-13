import { Input, Form } from "antd";
import style from "./InputInfo.module.scss";
import { useStyle } from "@/hooks";
import { formatDate } from "@/utils";

interface InputInfoProps {
  label: string;
  name?: string;
  rules?: any[];
  type?: "text" | "textarea";
  isEditing?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
}

const InputInfo: React.FC<InputInfoProps> = ({
  label,
  name,
  rules = [],
  type = "text", // Mặc định là text
  isEditing = true,
  onChange,
  placeholder = `Enter ${label.toLowerCase()}`,
}) => {
  const { styles } = useStyle();

  return (
    <Form.Item
      label={label}
      name={name}
      rules={rules}
      hasFeedback={isEditing}
      className={`${style.formWrapper} ${styles.customInput2}`}
    >
      {type === "textarea" ? (
        <Input.TextArea
          placeholder={placeholder}
          onChange={onChange}
          readOnly={!isEditing}
          maxLength={500}
        />
      ) : (
        <Input
          placeholder={placeholder}
          onChange={onChange}
          readOnly={!isEditing}
          maxLength={255}
        />
      )}
    </Form.Item>
  );
};

export default InputInfo;
