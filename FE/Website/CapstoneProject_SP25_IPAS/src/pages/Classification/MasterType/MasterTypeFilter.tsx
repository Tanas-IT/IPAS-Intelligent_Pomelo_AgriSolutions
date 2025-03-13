import { Flex, Space } from "antd";
import { useState } from "react";
import style from "./MasterType.module.scss";
import { FilterFooter, FormFieldFilter } from "@/components";
import { FilterMasterTypeState } from "@/types";
import { MASTER_TYPE } from "@/constants";

type FilterProps = {
  filters: FilterMasterTypeState;
  updateFilters: (key: keyof FilterMasterTypeState, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const MasterTypeFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);

  const options = Object.keys(MASTER_TYPE).map((key) => ({
    value: MASTER_TYPE[key as keyof typeof MASTER_TYPE],
    label: MASTER_TYPE[key as keyof typeof MASTER_TYPE],
  }));

  const isFilterEmpty = !(
    filters.createDateFrom ||
    filters.createDateTo ||
    filters.typeName.length > 0
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
          label="Type Name:"
          fieldType="select"
          value={filters.typeName}
          options={options}
          onChange={(value) => updateFilters("typeName", value)}
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
export default MasterTypeFilter;
