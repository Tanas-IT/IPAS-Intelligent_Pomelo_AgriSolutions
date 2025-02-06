import { Input, Form } from "antd";
import style from "./FormInput.module.scss";
import { useStyle } from "@/hooks";

interface FormInputProps {
  label: string;
  name: string;
  rules?: any[];
  isEditing?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  rules = [],
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
      <Input placeholder={placeholder} onChange={onChange} readOnly={!isEditing} />
    </Form.Item>
  );
};

export default FormInput;
