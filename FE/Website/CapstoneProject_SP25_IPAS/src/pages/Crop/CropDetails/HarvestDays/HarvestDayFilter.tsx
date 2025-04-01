import { Flex, Space } from "antd";
import { useState } from "react";
import style from "./HarvestDays.module.scss";
import { FilterFooter, FormFieldFilter } from "@/components";
import { FilterHarvestDayState } from "@/types";
import { HARVEST_STATUS } from "@/constants";

type FilterProps = {
  filters: FilterHarvestDayState;
  updateFilters: (key: keyof FilterHarvestDayState, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const HarvestDayFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);

  const isFilterEmpty = !(
    filters.dateHarvestFrom ||
    filters.dateHarvestTo ||
    filters.totalPriceFrom !== undefined ||
    filters.dateHarvestTo !== undefined ||
    (filters.status && filters.status.length > 0)
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
          label="Harvest Date"
          fieldType="date"
          value={[filters.dateHarvestFrom, filters.dateHarvestTo]}
          onChange={(dates) => {
            updateFilters("dateHarvestFrom", dates?.[0] ? dates[0].format("YYYY-MM-DD") : "");
            updateFilters("dateHarvestTo", dates?.[1] ? dates[1].format("YYYY-MM-DD") : "");
          }}
        />

        <FormFieldFilter
          label="Total Price From - To"
          fieldType="numberRange"
          value={{ from: filters.totalPriceFrom, to: filters.dateHarvestTo }}
          onChange={(val) => {
            updateFilters("totalPriceFrom", val.from);
            updateFilters("dateHarvestTo", val.to);
          }}
        />

        <FormFieldFilter
          label="Status"
          fieldType="select"
          value={filters.status}
          options={Object.entries(HARVEST_STATUS).map(([key, value]) => ({
            value: key,
            label: value,
          }))}
          onChange={(value) => updateFilters("status", value)}
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
export default HarvestDayFilter;
