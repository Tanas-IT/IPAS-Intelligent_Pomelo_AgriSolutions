import { useStyle } from "@/hooks";
import { Select, Form } from "antd";
import style from "./SelectInfo.module.scss";

interface SelectInfoProps {
  label: string;
  name: string;
  rules?: any[];
  isEditing?: boolean;
  options: { value: string; label: string }[];
  onChange?: (value: string) => void;
  isLoading?: boolean;
}

const SelectInfo: React.FC<SelectInfoProps> = ({
  label,
  name,
  rules = [],
  options,
  onChange,
  isLoading = false,
}) => {
  const { styles } = useStyle();
  return (
    <Form.Item className={style.formWrapper} label={label} name={name} rules={rules} hasFeedback>
      <Select
        placeholder={`Select ${label.toLowerCase()}`}
        className={`${styles.customSelect}`}
        options={options}
        showSearch
        onChange={onChange}
        loading={isLoading}
      />
    </Form.Item>
  );
};

export default SelectInfo;
