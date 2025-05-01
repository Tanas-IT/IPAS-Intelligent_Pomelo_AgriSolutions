import { Flex, Space } from "antd";
import { useState } from "react";
import style from "./EmployeeList.module.scss";
import { FilterFooter, FormFieldFilter } from "@/components";
import { FilterEmployeeState } from "@/types";
import { ROLE } from "@/constants";

type FilterProps = {
  filters: FilterEmployeeState;
  updateFilters: (key: keyof FilterEmployeeState, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const EmployeeFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);
  const ROLE_OPTIONS = [
    { label: ROLE.EMPLOYEE, value: ROLE.EMPLOYEE },
    { label: ROLE.MANAGER, value: ROLE.MANAGER },
  ];

  const handleClear = () => {
    onClear();
  };

  const isFilterEmpty = !(filters.roleName && filters.roleName.length > 0);

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
          label="Role Names:"
          fieldType="select"
          value={filters.roleName}
          options={ROLE_OPTIONS}
          onChange={(value) => updateFilters("roleName", value)}
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
export default EmployeeFilter;
