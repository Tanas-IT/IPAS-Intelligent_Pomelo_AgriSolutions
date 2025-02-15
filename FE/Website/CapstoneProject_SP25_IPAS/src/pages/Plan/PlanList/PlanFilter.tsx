import { Button, Checkbox, DatePicker, Flex, Select, Space } from "antd";
import { useState } from "react";
import style from "./PlanList.module.scss";
import dayjs from "dayjs";
import { useStyle } from "@/hooks";
import { FilterFooter, TagRender } from "@/components";

const { RangePicker } = DatePicker;

type FilterProps = {
  filters: {
    createDateFrom: string;
    createDateTo: string;
    growthStages: string[];
    processTypes: string[];
    status: string[];
  };
  updateFilters: (key: string, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const PlanFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);
  const { styles } = useStyle();

  const growthStageOptions = [
    { value: "gold" },
    { value: "lime" },
    { value: "green" },
    { value: "cyan" },
    { value: "ds" },
    { value: "as" },
  ];

  const processTypeOptions = [
    { value: "None" },
    { value: "Daily" },
    { value: "Weekly" },
    { value: "Monthly" }
  ];

  const isFilterEmpty = !(
    filters.createDateFrom ||
    filters.createDateTo ||
    filters.growthStages.length > 0 ||
    filters.status.length > 0
  );

  const isFilterChanged = JSON.stringify(filters) !== JSON.stringify(prevFilters);
  const handleApply = () => {
    if (isFilterChanged) {
      console.log("filter thay doi");
      
      onApply();
      setPrevFilters(filters);
    }
  };

  return (
    <Flex className={style.filterContent}>
      <Space direction="vertical">
        <Flex className={style.section}>
          <label className={style.title}>Create Date:</label>
          <RangePicker
            format="DD/MM/YYYY"
            value={[
              filters.createDateFrom ? dayjs(filters.createDateFrom) : null,
              filters.createDateTo ? dayjs(filters.createDateTo) : null,
            ]}
            onChange={(dates) => {
              updateFilters("createDateFrom", dates?.[0] ? dates[0].format("YYYY-MM-DD") : "");
              updateFilters("createDateTo", dates?.[1] ? dates[1].format("YYYY-MM-DD") : "");
            }}
          />
        </Flex>
        <Flex className={style.section}>
          <label className={style.title}>Growth Stages:</label>
          <Select
            mode="multiple"
            placeholder="Please select"
            tagRender={TagRender}
            options={growthStageOptions}
            value={filters.growthStages}
            onChange={(value) => updateFilters("growthStages", value)}
          />
        </Flex>
        <Flex className={style.section}>
          <label className={style.title}>Frequency:</label>
          <Select
            mode="multiple"
            placeholder="Please select"
            tagRender={TagRender}
            options={processTypeOptions}
            value={filters.processTypes}
            onChange={(value) => updateFilters("processTypes", value)}
          />
        </Flex>
        {/* <Flex className={style.sectionStatus}>
          <label className={style.title}>Status:</label>
          <Flex className={style.statusGroup}>
            {["Active", "Inactive"].map((status) => (
              <Checkbox
                className={styles.customCheckbox}
                key={status}
                checked={filters.status.includes(status)}
                onChange={(e) => {
                  const checked = e.target.checked;
                  updateFilters(
                    "status",
                    checked
                      ? [...filters.status, status]
                      : filters.status.filter((val) => val !== status),
                  );
                }}
              >
                {status}
              </Checkbox>
            ))}
          </Flex>
        </Flex> */}
        <Flex className={style.sectionStatus}>
  <label className={style.title}>Status:</label>
  <Flex className={style.statusGroup}>
    {[
      { label: "Active", value: true }, 
      { label: "Inactive", value: false }
    ].map(({ label, value }) => (
      <Checkbox
        className={styles.customCheckbox}
        key={label}
        checked={filters.status.includes(value.toString())} // Convert boolean thành string
        onChange={(e) => {
          const checked = e.target.checked;
          updateFilters(
            "status",
            checked
              ? [...filters.status, value.toString()] // Lưu dạng string "true" / "false"
              : filters.status.filter((val) => val !== value.toString()),
          );
        }}
      >
        {label}
      </Checkbox>
    ))}
  </Flex>
</Flex>

        <FilterFooter
          isFilterEmpty={isFilterEmpty}
          isFilterChanged={isFilterChanged}
          onClear={onClear}
          handleApply={handleApply}
        />
      </Space>
    </Flex>
  );
};
export default PlanFilter;
