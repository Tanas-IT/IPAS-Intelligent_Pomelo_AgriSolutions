import { Flex, Space } from "antd";
import { useState } from "react";
import style from "./SystemConfiguration.module.scss";
import { FilterFooter, FormFieldFilter } from "@/components";
import { FilterConfigTypeState } from "@/types";

type FilterProps = {
  filters: FilterConfigTypeState;
  updateFilters: (key: keyof FilterConfigTypeState, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const SystemConfigurationFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);

  const isFilterEmpty = !(filters.isActive !== undefined);

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
export default SystemConfigurationFilter;
