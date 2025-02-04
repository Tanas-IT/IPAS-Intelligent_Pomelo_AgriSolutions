import { Button, Checkbox, DatePicker, Flex, Select, Space } from "antd";
import { useState } from "react";
import style from "./PlantList.module.scss";
import dayjs from "dayjs";
import { useStyle } from "@/hooks";
import { FilterFooter, TagRender } from "@/components";
import { DATE_FORMAT } from "@/utils";

const { RangePicker } = DatePicker;

type FilterProps = {
  filters: {
    createDateFrom: string;
    createDateTo: string;
    growthStages: string[];
    status: string[];
  };
  updateFilters: (key: string, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const PlantFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);
  const { styles } = useStyle();

  const options = [
    { value: "gold" },
    { value: "lime" },
    { value: "green" },
    { value: "cyan" },
    { value: "ds" },
    { value: "as" },
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
            format={DATE_FORMAT}
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
            options={options}
            value={filters.growthStages}
            onChange={(value) => updateFilters("growthStages", value)}
          />
        </Flex>
        <Flex className={style.sectionStatus}>
          <label className={style.title}>Status:</label>
          <Flex className={style.statusGroup}>
            {["A", "B"].map((status) => (
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
export default PlantFilter;
