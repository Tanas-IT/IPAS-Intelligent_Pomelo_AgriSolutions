import { Input, Form } from "antd";
import style from "./FormInput.module.scss";
import { useStyle } from "@/hooks";

interface FormInputProps {
  label: string;
  name: string;
  rules?: any[];
  type?: "text" | "textarea";
  isEditing?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
}

const FormInput: React.FC<FormInputProps> = ({
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
      className={`${style.flexItem} ${styles.customInput2}`}
    >
      {type === "textarea" ? (
        <Input.TextArea placeholder={placeholder} onChange={onChange} readOnly={!isEditing} />
      ) : (
        <Input placeholder={placeholder} onChange={onChange} readOnly={!isEditing} />
      )}
    </Form.Item>
  );
};

export default FormInput;
