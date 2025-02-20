import { DatePicker, Flex, Select } from "antd";
import { TagRender } from "@/components";
import { DATE_FORMAT } from "@/utils";
import style from "./FormFieldFilter.module.scss";
import { useStyle } from "@/hooks";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

type FormFieldFilterProps = {
  label: string;
  fieldType: "date" | "select"; // Định nghĩa kiểu field là date hoặc select
  value: any;
  options?: { value: string; label: string }[]; // Include label in options
  onChange: (value: any) => void; // Hàm để cập nhật giá trị filter
};

const FormFieldFilter: React.FC<FormFieldFilterProps> = ({
  label,
  fieldType,
  value,
  options,
  onChange,
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
      default:
        return null;
    }
  };

  return (
    <Flex className={style.section}>
      <label className={style.title}>{label}</label>
      {renderField()}
    </Flex>
  );
};

export default FormFieldFilter;
