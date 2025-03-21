import { DatePicker, Flex, InputNumber, Radio, Select, TreeSelect } from "antd";
import { TagRender } from "@/components";
import { DATE_FORMAT } from "@/utils";
import style from "./FormFieldFilter.module.scss";
import { useStyle } from "@/hooks";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

type TreeNode = {
  title: string;
  value: string | number;
  key?: string;
  children?: TreeNode[];
  isLeaf?: boolean;
};

type FormFieldFilterProps = {
  label: string;
  fieldType: "date" | "select" | "radio" | "treeSelect" | "numberRange" | "selectCustom";
  value: any;
  options?: { value: string | number | boolean; label: string }[];
  treeData?: TreeNode[];
  onChange: (value: any) => void;
  loadData?: (node: any) => Promise<void>;
  direction?: "row" | "column";
  optionCustom?: { value: string | number | boolean; label: string; avatarURL: string }[];
};

const FormFieldFilter: React.FC<FormFieldFilterProps> = ({
  label,
  fieldType,
  value,
  options,
  treeData,
  onChange,
  loadData,
  direction = "column",
  optionCustom
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
      case "treeSelect":
        return (
          <TreeSelect
            className={`${styles.customSelect}`}
            style={{ width: "100%" }}
            treeData={treeData}
            tagRender={TagRender}
            treeCheckable
            value={value}
            showCheckedStrategy={TreeSelect.SHOW_CHILD}
            onChange={onChange}
            loadData={loadData}
            placeholder="Select Plot or Row"
          />
        );
      case "numberRange":
        return (
          <Flex gap={24} align="center">
            <Flex vertical align="start">
              <span className={style.label}>From</span>
              <InputNumber
                className={styles.customInput}
                style={{ width: "100%" }}
                placeholder="From"
                value={value?.from ?? null}
                onChange={(val) => onChange({ ...value, from: val })}
                min={1}
              />
            </Flex>
            <Flex vertical align="start">
              <span className={style.label}>To</span>
              <InputNumber
                className={styles.customInput}
                style={{ width: "100%" }}
                placeholder="To"
                value={value?.to ?? null}
                onChange={(val) => onChange({ ...value, to: val })}
                min={value?.from || 1}
              />
            </Flex>
          </Flex>
        );
      case "selectCustom":
        return (
          <Select
            className={`${styles.customSelect}`}
            mode="multiple"
            placeholder="Please select"
            tagRender={TagRender}
            options={optionCustom}
            value={value}
            onChange={onChange}
            optionRender={(option) => {

              return (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {option.data.avatarURL && (
                    <img
                      src={option.data.avatarURL}
                      style={{ width: 24, height: 24, borderRadius: "50%" }}
                      crossOrigin="anonymous"
                    />
                  )}
                  <span>{option.data.label}</span>
                </div>
              );
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Flex className={`${style.section} ${style[direction]}`}>
      <label className={style.title}>{label.endsWith(":") ? label.slice(0, -1) : label}:</label>
      {renderField()}
    </Flex>
  );
};

export default FormFieldFilter;
