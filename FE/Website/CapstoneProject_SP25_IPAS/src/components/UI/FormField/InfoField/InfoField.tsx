import { useStyle } from "@/hooks";
import { Select, Input, Form, Upload, UploadFile } from "antd";
import style from "./InfoField.module.scss";
import { Icons } from "@/assets";

interface Option {
  value: string;
  label: string;
}

interface InfoFieldProps {
  label: string;
  name: string;
  rules?: any[];
  type?: "text" | "textarea" | "select" | "uploadDragger";
  isEditing?: boolean;
  options?: Option[];
  onChange?: (value: any) => void;
  isLoading?: boolean;
  placeholder?: string;
  beforeUpload?: (file: File) => boolean | string;
  onRemove?: () => void;
}

const InfoField: React.FC<InfoFieldProps> = ({
  label,
  name,
  rules = [],
  type = "text",
  isEditing = true,
  options = [],
  onChange,
  isLoading = false,
  placeholder = `Enter ${label.toLowerCase()}`,
  beforeUpload,
  onRemove,
}) => {
  const { styles } = useStyle();
  const inputClass = type === "text" || type === "textarea" ? styles.customInput2 : "";

  const renderField = () => {
    switch (type) {
      case "select":
        return (
          <Select
            placeholder={`Select ${label.toLowerCase()}`}
            className={styles.customSelect}
            options={options}
            showSearch
            onChange={onChange}
            disabled={!isEditing}
            loading={isLoading}
          />
        );
      case "textarea":
        return (
          <Input.TextArea
            placeholder={placeholder}
            onChange={onChange}
            readOnly={!isEditing}
            maxLength={500}
          />
        );
      case "uploadDragger":
        return (
          <Upload.Dragger
            className={styles.customUpload}
            beforeUpload={beforeUpload}
            onRemove={onRemove}
            maxCount={1}
            accept="image/*"
            listType="picture"
          >
            <p className={style.uploadIcon}>
              <Icons.upload />
            </p>
            <p className="ant-upload-text">Click or drag an image file here to upload</p>
            <p className="ant-upload-hint">Only image formats (JPG, PNG, GIF, WEBP) are allowed.</p>
          </Upload.Dragger>
        );
      case "text":
      default:
        return (
          <Input
            placeholder={placeholder}
            onChange={onChange}
            readOnly={!isEditing}
            maxLength={255}
          />
        );
    }
  };

  return (
    <Form.Item
      className={`${style.formWrapper} ${inputClass}`}
      label={label}
      name={name}
      rules={rules}
      hasFeedback={isEditing}
    >
      {renderField()}
    </Form.Item>
  );
};

export default InfoField;
