import { useStyle } from "@/hooks";
import { Select, Form, Flex, DatePicker, Input } from "antd";
import style from "./FormFieldModal.module.scss";
import { Dayjs } from "dayjs";

interface FormFieldModalProps {
  label: string;
  description?: string;
  name: string;
  rules?: any[];
  type?: "text" | "textarea" | "date" | "select";
  options?: { value: string; label: string }[];
  readonly?: boolean;
  onChange?: (value: any) => void;
  isLoading?: boolean;
  isSearch?: boolean;
  placeholder?: string;
}

const FormFieldModal: React.FC<FormFieldModalProps> = ({
  label,
  description,
  name,
  rules = [],
  type = "text",
  options = [],
  readonly = false,
  onChange,
  isLoading = false,
  isSearch = true,
  placeholder = `Enter ${label.toLowerCase()}`,
}) => {
  const { styles } = useStyle();
  const isRequired = rules.some((rule) => rule.required);

  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <Input.TextArea
            placeholder={placeholder}
            onChange={onChange}
            readOnly={readonly}
            maxLength={500}
          />
        );
      case "date":
        return <DatePicker onChange={(date) => onChange?.(date)} />;
      case "select":
        return (
          <Select
            placeholder={`Select ${label.toLowerCase()}`}
            className={`${styles.customSelect}`}
            options={options}
            showSearch={isSearch}
            loading={isLoading}
            onChange={onChange}
          />
        );
      default:
        return (
          <Input
            placeholder={placeholder}
            onChange={onChange}
            readOnly={readonly}
            maxLength={255}
          />
        );
    }
  };

  return (
    <Flex className={style.formSection}>
      <Flex className={style.formSectionTitle}>
        <label className={style.formTitle}>
          {label} {isRequired && <span style={{ color: "red" }}>*</span>}
        </label>
        {description && <span className={style.formDescription}>{description}</span>}
      </Flex>
      <Form.Item
        name={name}
        rules={rules}
        hasFeedback
        className={`${type === "text" || type === "textarea" ? styles.customInput2 : ""}`}
      >
        {renderInput()}
      </Form.Item>
    </Flex>
  );
};

export default FormFieldModal;
