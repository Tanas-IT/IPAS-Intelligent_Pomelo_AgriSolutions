import { DatePicker, Flex, Form, FormInstance, Input } from "antd";
import style from "./InputModal.module.scss";
import { useStyle } from "@/hooks";
import { Dayjs } from "dayjs";

interface InputModalProps {
  // form: FormInstance;
  label: string;
  name: string;
  rules?: any[];
  type?: "text" | "textarea" | "date";
  readonly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
}

const InputModal: React.FC<InputModalProps> = ({
  // form,
  label,
  name,
  rules = [],
  readonly = false,
  type = "text",
  onChange,
  placeholder = `Enter ${label.toLowerCase()}`,
}) => {
  const { styles } = useStyle();

  // const handleDateChange = (dates: Dayjs[] | null, dateStrings: [string, string]) => {
  //   form.setFieldsValue({ [name]: dates }); // Cập nhật giá trị vào Form
  //   form.validateFields([name]); // Kiểm tra validation
  //   // onChange?.(dates);
  // };
  return (
    <Form.Item
      name={name}
      rules={rules}
      hasFeedback
      className={`${style.formWrapper} ${styles.customInput2}`}
    >
      <Flex className={style.section}>
        <label className={style.title}>{label}</label>
        {type === "date" ? (
          // <DatePicker.RangePicker onChange={handleDateChange} />
          <></>
        ) : type === "textarea" ? (
          <Input.TextArea placeholder={placeholder} onChange={onChange} readOnly={readonly} />
        ) : (
          <Input placeholder={placeholder} onChange={onChange} readOnly={readonly} />
        )}
      </Flex>
    </Form.Item>
  );
};

export default InputModal;
