import { Flex, Space } from "antd";
import { useState } from "react";
import { FilterFooter, FormFieldFilter } from "@/components";
import { HEALTH_STATUS, MASTER_TYPE } from "@/constants";
import { FilterGraftedPlantState } from "@/types";
import { useMasterTypeOptions } from "@/hooks";
import style from "./GraftedPlant.module.scss";

type FilterProps = {
  filters: FilterGraftedPlantState;
  updateFilters: (key: keyof FilterGraftedPlantState, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const GraftedPlantFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);
  const { options: cultivarTypeOptions } = useMasterTypeOptions(MASTER_TYPE.CULTIVAR);

  const isFilterEmpty = !(
    filters.separatedDateFrom ||
    filters.separatedDateTo ||
    (filters.plantIds && filters.plantIds.length > 0) ||
    (filters.cultivarIds && filters.cultivarIds.length > 0) ||
    (filters.status && filters.status.length > 0) ||
    filters.graftedDateFrom ||
    filters.graftedDateTo ||
    filters.isCompleted !== undefined
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
          label="Separated Date:"
          fieldType="date"
          value={[filters.separatedDateFrom, filters.separatedDateTo]}
          onChange={(dates) => {
            updateFilters("separatedDateFrom", dates?.[0] ? dates[0].format("YYYY-MM-DD") : "");
            updateFilters("separatedDateTo", dates?.[1] ? dates[1].format("YYYY-MM-DD") : "");
          }}
        />

        <FormFieldFilter
          label="Grafted Date:"
          fieldType="date"
          value={[filters.graftedDateFrom, filters.graftedDateTo]}
          onChange={(dates) => {
            updateFilters("graftedDateFrom", dates?.[0] ? dates[0].format("YYYY-MM-DD") : "");
            updateFilters("graftedDateTo", dates?.[1] ? dates[1].format("YYYY-MM-DD") : "");
          }}
        />

        <Flex gap={20}>
          <FormFieldFilter
            label="Cultivar"
            fieldType="select"
            value={filters.cultivarIds}
            options={cultivarTypeOptions}
            onChange={(value) => updateFilters("cultivarIds", value)}
          />

          <FormFieldFilter
            label="Health Status"
            fieldType="select"
            value={filters.status}
            options={Object.entries(HEALTH_STATUS).map(([key, value]) => ({
              value: key,
              label: value,
            }))}
            onChange={(value) => updateFilters("status", value)}
          />
        </Flex>

        <FormFieldFilter
          label="Is Completed"
          fieldType="radio"
          value={filters.isCompleted}
          options={[
            { value: true, label: "Completed" },
            { value: false, label: "Not Completed" },
          ]}
          onChange={(value) => updateFilters("isCompleted", value)}
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
export default GraftedPlantFilter;
