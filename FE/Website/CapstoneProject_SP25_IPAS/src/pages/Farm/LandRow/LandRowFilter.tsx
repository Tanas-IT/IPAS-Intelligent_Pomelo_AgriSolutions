import { Flex, Space } from "antd";
import { useState } from "react";
import style from "./LandRow.module.scss";
import { FilterFooter, FormFieldFilter } from "@/components";
import { FilterLandRowState } from "@/types";

type FilterProps = {
  filters: FilterLandRowState;
  updateFilters: (key: keyof FilterLandRowState, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const LandRowFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);

  const handleClear = () => {
    onClear();
  };

  const isFilterEmpty = !(
    filters.rowIndexFrom !== undefined ||
    filters.rowIndexTo !== undefined ||
    filters.treeAmountFrom !== undefined ||
    filters.treeAmountTo !== undefined
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
      <Space direction="vertical" style={{ width: "100%" }}>
        <FormFieldFilter
          label="Row Index From - To"
          fieldType="numberRange"
          value={{ from: filters.rowIndexFrom, to: filters.rowIndexTo }}
          onChange={(val) => {
            updateFilters("rowIndexFrom", val.from);
            updateFilters("rowIndexTo", val.to);
          }}
        />
        <FormFieldFilter
          label="Tree Amount From - To"
          fieldType="numberRange"
          value={{ from: filters.treeAmountFrom, to: filters.treeAmountTo }}
          onChange={(val) => {
            updateFilters("treeAmountFrom", val.from);
            updateFilters("treeAmountTo", val.to);
          }}
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
export default LandRowFilter;
