import { DatePicker, Flex, Space } from "antd";
import { useEffect, useState } from "react";
import style from "./CropList.module.scss";
import { FilterFooter, FormFieldFilter } from "@/components";
import { FilterCropState } from "@/types";
import { useLandPlotOptions } from "@/hooks";

type FilterProps = {
  filters: FilterCropState;
  updateFilters: (key: keyof FilterCropState, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const CropFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);
  const { options: plotOptions } = useLandPlotOptions();

  const isFilterEmpty = !(
    filters.yearFrom ||
    filters.yearTo ||
    (filters.LandPlotIds && filters.LandPlotIds.length > 0) ||
    filters.actualYieldFrom !== undefined ||
    filters.actualYieldTo !== undefined ||
    filters.marketPriceFrom !== undefined ||
    filters.marketPriceTo !== undefined
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
          label="Crop Duration"
          fieldType="date"
          value={[filters.yearFrom, filters.yearTo]}
          onChange={(dates) => {
            updateFilters("yearFrom", dates?.[0] ? dates[0].format("YYYY-MM-DD") : "");
            updateFilters("yearTo", dates?.[1] ? dates[1].format("YYYY-MM-DD") : "");
          }}
        />

        <FormFieldFilter
          label="Actual Yield From - To"
          fieldType="numberRange"
          value={{ from: filters.actualYieldFrom, to: filters.actualYieldTo }}
          onChange={(val) => {
            updateFilters("actualYieldFrom", val.from);
            updateFilters("actualYieldTo", val.to);
          }}
        />
        <FormFieldFilter
          label="Market Price From - To"
          fieldType="numberRange"
          value={{ from: filters.marketPriceFrom, to: filters.marketPriceTo }}
          onChange={(val) => {
            updateFilters("marketPriceFrom", val.from);
            updateFilters("marketPriceTo", val.to);
          }}
        />

        <FormFieldFilter
          label="Plots"
          fieldType="select"
          value={filters.LandPlotIds}
          options={plotOptions}
          onChange={(value) => updateFilters("LandPlotIds", value)}
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
export default CropFilter;
