import { Button, Checkbox, DatePicker, Flex, Select, Space } from "antd";
import { useState } from "react";
import style from "./WorklogFilter.module.scss"
import dayjs from "dayjs";
import { useStyle } from "@/hooks";
import { FilterFooter, TagRender } from "@/components";

const { RangePicker } = DatePicker;

type FilterProps = {
  filters: {
    createDateFrom: string;
    createDateTo: string;
    processTypes: string[];
    status: string[];
    isConfirm: boolean;
    employees: string[];
    type: string[];
    plan: string[];
  };
  updateFilters: (key: string, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};

const WorklogFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
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
    { value: "type 1" },
    { value: "type 2" },
    { value: "type 3" },
    { value: "type 4" }
  ];

  const employeeOptions = [
    { value: "emp1", label: "Employee 1" },
    { value: "emp2", label: "Employee 2" },
    { value: "emp3", label: "Employee 3" },
    { value: "emp4", label: "Employee 4" }
  ];

  const planOptions = [
    { value: "plan1", label: "Plan 1" },
    { value: "plan2", label: "Plan 2" },
    { value: "plan3", label: "Plan 3" },
    { value: "plan4", label: "Plan 4" }
  ];

  const isFilterEmpty = !(
    filters.createDateFrom ||
    filters.createDateTo ||
    filters.status.length > 0 ||
    filters.employees.length > 0 ||
    filters.type.length > 0 ||
    filters.plan.length > 0
  );

  const isFilterChanged = JSON.stringify(filters) !== JSON.stringify(prevFilters);
  const handleApply = () => {
    if (isFilterChanged) {
      onApply();
      setPrevFilters(filters);
    }
  };

  return (
    <Flex className={style.filterContent}>
      <Space direction="vertical">
        <Flex className={style.section}>
          <label className={style.title}>Date:</label>
          <RangePicker
            format="DD/MM/YYYY"
            value={[ 
              filters.createDateFrom ? dayjs(filters.createDateFrom) : null, 
              filters.createDateTo ? dayjs(filters.createDateTo) : null
            ]}
            onChange={(dates) => {
              updateFilters("createDateFrom", dates?.[0] ? dates[0].format("YYYY-MM-DD") : "");
              updateFilters("createDateTo", dates?.[1] ? dates[1].format("YYYY-MM-DD") : "");
            }}
          />
        </Flex>
        <Flex className={style.section}>
          <label className={style.title}>Process Type:</label>
          <Select
            mode="multiple"
            placeholder="Please select"
            tagRender={TagRender}
            options={processTypeOptions}
            value={filters.processTypes}
            onChange={(value) => updateFilters("processTypes", value)}
          />
        </Flex>
        <Flex className={style.section}>
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
                      : filters.status.filter((val) => val !== status)
                  );
                }}
              >
                {status}
              </Checkbox>
            ))}
          </Flex>
        </Flex>
        <Flex className={style.section}>
          <label className={style.title}>Is Confirmed:</label>
          <Checkbox
            checked={filters.isConfirm}
            onChange={(e) => updateFilters("isConfirm", e.target.checked)}
          >
            Confirmed
          </Checkbox>
        </Flex>
        <Flex className={style.section}>
          <label className={style.title}>Assigned Employees:</label>
          <Select
            mode="multiple"
            placeholder="Please select"
            options={employeeOptions}
            value={filters.employees}
            onChange={(value) => updateFilters("employees", value)}
          />
        </Flex>
        <Flex className={style.section}>
          <label className={style.title}>Plan:</label>
          <Select
            mode="multiple"
            placeholder="Please select"
            options={planOptions}
            value={filters.plan}
            onChange={(value) => updateFilters("plan", value)}
          />
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

export default WorklogFilter;
