import { Flex, Space } from "antd";
import { useState } from "react";
import style from "./Criteria.module.scss";
import { FilterFooter, FormFieldFilter } from "@/components";
import { FilterCriteriaState } from "@/types";
import { SYSTEM_CONFIG_GROUP } from "@/constants";
import { useSystemConfigOptions } from "@/hooks";

type FilterProps = {
  filters: FilterCriteriaState;
  updateFilters: (key: keyof FilterCriteriaState, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const CriteriaFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);
  const { options } = useSystemConfigOptions(SYSTEM_CONFIG_GROUP.CRITERIA, undefined, true);

  const isFilterEmpty = !(
    filters.createDateFrom ||
    filters.createDateTo ||
    filters.target.length > 0 ||
    filters.isActive !== undefined
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
          label="Target:"
          fieldType="select"
          value={filters.target}
          options={options}
          onChange={(value) => updateFilters("target", value)}
        />
        <FormFieldFilter
          label="Is Active"
          fieldType="radio"
          value={filters.isActive}
          options={[
            { value: true, label: "Active" },
            { value: false, label: "Inactive" },
          ]}
          onChange={(value) => updateFilters("isActive", value)}
          direction="row"
        />

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
export default CriteriaFilter;
