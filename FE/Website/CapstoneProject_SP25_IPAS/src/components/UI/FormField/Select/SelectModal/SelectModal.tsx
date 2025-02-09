import { useStyle } from "@/hooks";
import { Select, Form, Flex, FormInstance } from "antd";
import style from "./SelectModal.module.scss";

interface SelectModalProps {
  form: FormInstance;
  label: string;
  name: string;
  rules?: any[];
  options: { value: string; label: string }[];
  onChange?: (value: string) => void;
  isLoading?: boolean;
  isSearch?: boolean;
}

const SelectModal: React.FC<SelectModalProps> = ({
  form,
  label,
  name,
  rules = [],
  options,
  onChange,
  isLoading = false,
  isSearch = true,
}) => {
  const { styles } = useStyle();
  return (
    <Form.Item className={style.formWrapper} name={name} rules={rules} hasFeedback>
      <Flex className={style.section}>
        <label className={style.title}>{label}</label>
        <Select
          placeholder={`Select ${label.toLowerCase()}`}
          className={`${styles.customSelect}`}
          options={options}
          showSearch={isSearch}
          loading={isLoading}
          onChange={(value) => {
            form.setFieldsValue({ [name]: value }); // Cập nhật giá trị vào Form
            onChange?.(value); // Gọi callback nếu có
          }}
        />
      </Flex>
    </Form.Item>
  );
};

export default SelectModal;
