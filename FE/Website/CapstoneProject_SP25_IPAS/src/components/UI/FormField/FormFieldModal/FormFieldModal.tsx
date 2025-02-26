import { useStyle } from "@/hooks";
import { Select, Form, Flex, DatePicker, Input, Switch, ColorPicker } from "antd";
import style from "./FormFieldModal.module.scss";

interface FormFieldModalProps {
  label: string;
  description?: string;
  name?: string;
  rules?: any[];
  type?: "text" | "textarea" | "date" | "select" | "switch" | "colorPicker";
  options?: { value: string; label: string }[];
  value?: string | number | undefined;
  readonly?: boolean;
  onChange?: (value: any) => void;
  isLoading?: boolean;
  isSearch?: boolean;
  isCheck?: boolean;
  placeholder?: string;
  direction?: "row" | "col";
  dependencies?: string[];
}

const FormFieldModal: React.FC<FormFieldModalProps> = ({
  label,
  description,
  name,
  rules = [],
  type = "text",
  options = [],
  value,
  readonly = false,
  onChange,
  isLoading = false,
  isSearch = true,
  isCheck = false,
  placeholder = `Enter ${label.toLowerCase()}`,
  direction = "col",
  dependencies,
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
      case "switch":
        return (
          <Switch
            checkedChildren="Active"
            unCheckedChildren="Inactive"
            checked={isCheck}
            onChange={onChange}
            className={`${styles.customSwitch} ${isCheck ? style.active : style.inActive}`}
          />
        );
      case "colorPicker":
        return (
          <ColorPicker
            defaultValue="#1677ff"
            format="hex"
            size="small"
            showText
            className={`${style.colorPicker}`}
          />
        );
      default:
        return (
          <Input
            placeholder={placeholder}
            onChange={onChange}
            value={value}
            readOnly={readonly}
            maxLength={255}
          />
        );
    }
  };

  return (
    <Flex className={`${style.formSection} ${style[direction]}`}>
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
        dependencies={dependencies}
      >
        {renderInput()}
      </Form.Item>
    </Flex>
  );
};

export default FormFieldModal;
