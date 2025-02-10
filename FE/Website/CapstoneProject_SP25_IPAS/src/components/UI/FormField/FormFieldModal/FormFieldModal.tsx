import { useStyle } from "@/hooks";
import { Select, Form, Flex, FormInstance, DatePicker, Input } from "antd";
import style from "./FormFieldModal.module.scss";
import { Dayjs } from "dayjs";

interface FormFieldModalProps {
  form?: FormInstance;
  label: string;
  description?: string;
  name: string;
  rules?: any[];
  type?: "text" | "textarea" | "date" | "select";
  options?: { value: string; label: string }[];
  readonly?: boolean;
  value?: string;
  onChange?: (value: any) => void;
  isLoading?: boolean;
  isSearch?: boolean;
  placeholder?: string;
}

const FormFieldModal: React.FC<FormFieldModalProps> = ({
  form,
  label,
  description,
  name,
  rules = [],
  type = "text",
  options = [],
  readonly = false,
  value,
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
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            readOnly={readonly}
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
            value={value}
            showSearch={isSearch}
            loading={isLoading}
            onChange={(value) => {
              form?.setFieldsValue({ [name]: value });
              onChange?.(value);
            }}
          />
        );
      default:
        return (
          <Input value={value} placeholder={placeholder} onChange={onChange} readOnly={readonly} />
        );
    }
  };

  return (
    <Form.Item
      name={name}
      rules={rules}
      hasFeedback
      className={`${style.formWrapper} ${
        type === "text" || type === "textarea" ? styles.customInput2 : ""
      }`}
    >
      <Flex className={style.formSection}>
        <Flex className={style.formSectionTitle}>
          <label className={style.formTitle}>
            {label} {isRequired && <span style={{ color: "red" }}>*</span>}
          </label>
          {description && <span className={style.formDescription}>{description}</span>}
        </Flex>
        {renderInput()}
      </Flex>
    </Form.Item>
  );
};

export default FormFieldModal;
