import { Flex, Space } from "antd";
import { useState } from "react";
import style from "./Partner.module.scss";
import { FilterFooter, FormFieldFilter } from "@/components";
import { FilterPartnerState } from "@/types";
import { PARTNER } from "@/constants";

type FilterProps = {
  filters: FilterPartnerState;
  updateFilters: (key: keyof FilterPartnerState, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const PartnerFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);
  const PARTNER_OPTIONS = [
    { label: PARTNER.PROVIDER, value: PARTNER.PROVIDER },
    { label: PARTNER.CUSTOMER, value: PARTNER.CUSTOMER },
  ];

  const handleClear = () => {
    onClear();
  };

  const isFilterEmpty = !(filters.major && filters.major.length > 0);

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
          label="Role Names:"
          fieldType="select"
          value={filters.major}
          options={PARTNER_OPTIONS}
          onChange={(value) => updateFilters("major", value)}
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
export default PartnerFilter;
