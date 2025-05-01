import { Flex, Space } from "antd";
import { useState } from "react";
import style from "./Farm.module.scss";
import { FilterFooter, FormFieldFilter } from "@/components";
import { FilterFarmState } from "@/types";

type FilterProps = {
  filters: FilterFarmState;
  updateFilters: (key: keyof FilterFarmState, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const FarmFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);

  const handleClear = () => {
    onClear();
  };

  const isFilterEmpty = !(
    filters.createDateFrom ||
    filters.createDateTo ||
    filters.status !== undefined
  );
  const isFilterChanged = JSON.stringify(filters) !== JSON.stringify(prevFilters);
  const handleApply = () => {
    if (isFilterChanged) {
      onApply();
      setPrevFilters(filters);
    }
  };

  return (
    <Flex className={`${style.filterContent} ${style.filterContentMinW}`}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <FormFieldFilter
          label="Create Date:"
          fieldType="date"
          value={[filters.createDateFrom, filters.createDateTo]}
          onChange={(dates) => {
            updateFilters("createDateFrom", dates?.[0] ? dates[0].format("YYYY-MM-DD") : "");
            updateFilters("createDateTo", dates?.[1] ? dates[1].format("YYYY-MM-DD") : "");
          }}
        />

        <FormFieldFilter
          label="Status"
          value={filters.status}
          fieldType="radio"
          options={[
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
          ]}
          onChange={(value) => updateFilters("status", value)}
          direction="row"
        />
        <FilterFooter
          isFilterEmpty={isFilterEmpty}
          isFilterChanged={isFilterChanged}
          onClear={handleClear}
          handleApply={handleApply}
        />
      </Space>
    </Flex>
  );
};
export default FarmFilter;
