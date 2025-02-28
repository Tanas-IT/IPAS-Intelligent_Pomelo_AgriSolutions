import { DatePicker, Flex, Radio, Select } from "antd";
import { TagRender } from "@/components";
import { DATE_FORMAT } from "@/utils";
import style from "./FormFieldFilter.module.scss";
import { useStyle } from "@/hooks";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

type FormFieldFilterProps = {
  label: string;
  fieldType: "date" | "select" | "radio"; // Định nghĩa kiểu field là date hoặc select
  value: any;
  options?: { value: string | number | boolean; label: string }[]; // Include label in options
  onChange: (value: any) => void; // Hàm để cập nhật giá trị filter
  direction?: "row" | "column"; // Thêm hướng hiển thị
};

const FormFieldFilter: React.FC<FormFieldFilterProps> = ({
  label,
  fieldType,
  value,
  options,
  onChange,
  direction = "column",
}) => {
  const { styles } = useStyle();

  const renderField = () => {
    switch (fieldType) {
      case "date":
        return (
          <RangePicker
            className={`${style.dateRange} ${styles.customDateRange}`}
            format={DATE_FORMAT}
            value={[value[0] ? dayjs(value[0]) : null, value[1] ? dayjs(value[1]) : null]}
            onChange={onChange}
          />
        );
      case "select":
        return (
          <Select
            className={`${styles.customSelect}`}
            mode="multiple"
            placeholder="Please select"
            tagRender={TagRender}
            options={options}
            value={value}
            onChange={onChange}
          />
        );
      case "radio":
        return (
          <Radio.Group value={value} onChange={(e) => onChange(e.target.value)}>
            {options &&
              options.map((opt) => (
                <Radio key={String(opt.value)} value={opt.value}>
                  {opt.label}
                </Radio>
              ))}
          </Radio.Group>
        );
      default:
        return null;
    }
  };

  return (
    <Flex className={`${style.section} ${style[direction]}`}>
      <label className={style.title}>{label}</label>
      {renderField()}
    </Flex>
  );
};

export default FormFieldFilter;
