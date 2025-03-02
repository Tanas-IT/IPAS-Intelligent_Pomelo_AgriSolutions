import { useStyle } from "@/hooks";
import {
  Select,
  Form,
  Flex,
  DatePicker,
  Input,
  Switch,
  ColorPicker,
  Image,
  Button,
  Upload,
} from "antd";
import style from "./FormFieldModal.module.scss";
import { DATE_FORMAT } from "@/utils";
import { useEffect, useState } from "react";
import { Icons } from "@/assets";
import { toast } from "react-toastify";

interface FormFieldModalProps {
  label: string;
  description?: string;
  name?: string;
  rules?: any[];
  type?: "text" | "textarea" | "date" | "select" | "switch" | "colorPicker" | "image";
  options?: { value: string | number; label: string }[];
  value?: string | string[] | number | undefined;
  image?: File;
  readonly?: boolean;
  onChange?: (value: any) => void;
  isLoading?: boolean;
  isSearch?: boolean;
  isCheck?: boolean;
  hasFeedback?: boolean;
  placeholder?: string;
  direction?: "row" | "col";
  dependencies?: string[];
  checkedChildren?: string;
  unCheckedChildren?: string;
}

const FormFieldModal: React.FC<FormFieldModalProps> = ({
  label,
  description,
  name,
  rules = [],
  type = "text",
  options = [],
  value,
  image,
  readonly = false,
  onChange,
  isLoading = false,
  isSearch = true,
  isCheck = false,
  hasFeedback = true,
  placeholder = `Enter ${label.toLowerCase()}`,
  direction = "col",
  dependencies,
  checkedChildren,
  unCheckedChildren
}) => {
  const { styles } = useStyle();
  const isRequired = rules.some((rule) => rule.required);
  const [imageUrl, setImageUrl] = useState<string | null>(value as string | null);

  useEffect(() => {
    if (!image) setImageUrl(null);
  }, [image]);

  const handleUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      toast.error("Only image files (JPG, PNG, GIF, WEBP) are allowed!");
      return Upload.LIST_IGNORE;
    }
    // Đọc file và cập nhật logo tạm thời
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const newLogoUrl = e.target.result as string;
        setImageUrl(newLogoUrl);
        onChange?.(file);
      }
    };
    reader.readAsDataURL(file);

    return false;
  };

  const handleRemove = () => {
    setImageUrl(null);
    onChange?.(null);
  };

  const renderInput = () => {
    switch (type) {
      case "image":
        return (
          <div className={style.imageUpload}>
            {imageUrl ? (
              <div className={style.previewContainer}>
                <Image
                  crossOrigin="anonymous"
                  src={imageUrl}
                  alt="Uploaded"
                  className={style.previewImage}
                />
                <Button
                  type="text"
                  icon={<Icons.delete />}
                  onClick={handleRemove}
                  className={style.deleteButton}
                />
              </div>
            ) : (
              <Upload
                showUploadList={false}
                beforeUpload={handleUpload}
                maxCount={1}
                accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
              >
                <Button icon={<Icons.plus />}>Upload Image</Button>
              </Upload>
            )}
          </div>
        );
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
        return (
          <DatePicker
            className={style.date}
            format={DATE_FORMAT}
            onChange={(date) => onChange?.(date)}
          />
        );
      case "select":
        return (
          <Select
            placeholder={`Select ${label.toLowerCase()}`}
            className={`${styles.customSelect}`}
            options={options}
            showSearch={isSearch}
            loading={isLoading}
            allowClear
            onChange={onChange}
          />
        );
      case "switch":
        return (
          <Switch
          checkedChildren={checkedChildren || "Active"}
          unCheckedChildren={unCheckedChildren || "Inactive"}
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
          {label}: {isRequired && <span style={{ color: "red" }}>*</span>}
        </label>
        {description && <span className={style.formDescription}>{description}</span>}
      </Flex>
      <Form.Item
        name={name}
        rules={rules}
        hasFeedback={hasFeedback}
        className={`${type === "text" || type === "textarea" ? styles.customInput2 : ""}`}
        dependencies={dependencies}
      >
        {renderInput()}
      </Form.Item>
    </Flex>
  );
};

export default FormFieldModal;
