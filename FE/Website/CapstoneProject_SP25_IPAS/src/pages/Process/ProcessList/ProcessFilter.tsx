import { Button, Checkbox, DatePicker, Flex, Select, Space } from "antd";
import { useState } from "react";
import style from "./ProcessList.module.scss"
import dayjs from "dayjs";
import { useGrowthStageOptions, useMasterTypeOptions, useStyle } from "@/hooks";
import { FilterFooter, FormFieldFilter, TagRender } from "@/components";
import { MASTER_TYPE } from "@/constants";
import { activeOptions } from "@/utils";

const { RangePicker } = DatePicker;

type Filter = {
  createDateFrom: string;
  createDateTo: string;
  growthStage: string[];
  masterTypeName: string[];
  isActive: string[];
}

type FilterProps = {
  filters: Filter;
  updateFilters: (key: keyof Filter, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const ProcessFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);
  const { styles } = useStyle();
  const { options: processTypeOptions } = useMasterTypeOptions(MASTER_TYPE.PROCESS, true);
  const { options: growthStageOptions } = useGrowthStageOptions(true);
  console.log("filter", filters);
  

  const isFilterEmpty = !(
    filters.createDateFrom ||
    filters.createDateTo ||
    filters.growthStage.length > 0 ||
    filters.masterTypeName.length > 0 ||
    filters.isActive.length > 0
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
          label="Growth Stage:"
          fieldType="select"
          value={filters.growthStage}
          options={growthStageOptions}
          onChange={(value) => updateFilters("growthStage", value)}
        />
        <FormFieldFilter
          label="Process Types:"
          fieldType="select"
          value={filters.masterTypeName}
          options={processTypeOptions}
          onChange={(value) => updateFilters("masterTypeName", value)}
        />
        <FormFieldFilter
          label="Status:"
          fieldType="radio"
          value={filters.isActive}
          options={activeOptions}
          onChange={(value) => updateFilters("isActive", value)}
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
export default ProcessFilter;
