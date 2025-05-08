import { Flex, Space } from "antd";
import { useState } from "react";
import style from "./PlanList.module.scss";
import { useGrowthStageOptions, useMasterTypeOptions } from "@/hooks";
import { FilterFooter, FormFieldFilter } from "@/components";
import { FilterPlanState } from "@/types";
import { frequencyOptions, MASTER_TYPE } from "@/constants";

type FilterProps = {
  filters: FilterPlanState;
  updateFilters: (key: keyof FilterPlanState, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const PlanFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);
  const { options: growthStageOptions } = useGrowthStageOptions();
  const { options: processTypeOptions } = useMasterTypeOptions(MASTER_TYPE.PROCESS, true);

  const handleClear = () => {
    onClear();
  };

  const isFilterEmpty = !(
    filters.createDateFrom ||
    filters.createDateTo ||
    (filters.growStages && filters.growStages.length > 0) ||
    (filters.processTypes && filters.processTypes.length > 0) ||
    (filters.frequency && filters.frequency.length > 0) ||
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
    <Flex className={`${style.filterContent} ${style.filterContentMinW}`}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <FormFieldFilter
          label="Create Date"
          fieldType="date"
          value={[filters.createDateFrom, filters.createDateTo]}
          onChange={(dates) => {
            updateFilters("createDateFrom", dates?.[0] ? dates[0].format("YYYY-MM-DD") : "");
            updateFilters("createDateTo", dates?.[1] ? dates[1].format("YYYY-MM-DD") : "");
          }}
        />
        <FormFieldFilter
          label="Growth Stage"
          fieldType="select"
          value={filters.growStages}
          options={growthStageOptions}
          onChange={(value) => updateFilters("growStages", value)}
        />
        <Flex className={style.row}>
          <FormFieldFilter
            label="Process Types:"
            fieldType="select"
            value={filters.processTypes}
            options={processTypeOptions}
            onChange={(value) => updateFilters("processTypes", value)}
          />
          <FormFieldFilter
            label="Frequency:"
            fieldType="select"
            value={filters.frequency}
            options={frequencyOptions}
            onChange={(value) => updateFilters("frequency", value)}
          />
        </Flex>

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
          onClear={handleClear}
          handleApply={handleApply}
        />
      </Space>
    </Flex>
  );
};
export default PlanFilter;
