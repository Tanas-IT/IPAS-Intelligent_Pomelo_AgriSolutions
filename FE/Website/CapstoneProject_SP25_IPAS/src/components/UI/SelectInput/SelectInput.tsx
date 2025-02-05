import { useStyle } from "@/hooks";
import { Select, Form } from "antd";
import style from "./SelectInput.module.scss";

interface SelectInputProps {
  label: string;
  name: string;
  rules?: any[];
  isEditing?: boolean;
  options: { value: string; label: string }[];
  onChange?: (value: string) => void;
  isLoading?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  name,
  rules = [],
  isEditing = true,
  options,
  onChange,
  isLoading = false,
}) => {
  const { styles } = useStyle();
  return (
    <Form.Item
      className={style.flexItem}
      label={label}
      name={name}
      rules={rules}
      hasFeedback={isEditing}
    >
      <Select
        placeholder={`Select ${label.toLowerCase()}`}
        className={`${styles.customSelect}`}
        options={options}
        showSearch
        onChange={onChange}
        disabled={!isEditing}
        loading={isLoading}
      />
    </Form.Item>
  );
};

export default SelectInput;
