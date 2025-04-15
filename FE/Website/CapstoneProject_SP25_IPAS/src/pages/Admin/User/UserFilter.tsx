import { Flex, Space } from "antd";
import { useState } from "react";
import style from "./User.module.scss";
import { FilterFooter, FormFieldFilter } from "@/components";
import { FilterUserState } from "@/types";
import { USER_ROLE_OPTIONS } from "@/constants";

type FilterProps = {
  filters: FilterUserState;
  updateFilters: (key: keyof FilterUserState, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const UserFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);

  const handleClear = () => {
    onClear();
  };

  const isFilterEmpty = !(
    filters.createDateFrom ||
    filters.createDateTo ||
    filters.dobFrom ||
    filters.dobTo ||
    (filters.roleIds && filters.roleIds.length > 0) ||
    filters.status !== undefined ||
    filters.genders !== undefined
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
            label="Create Date:"
            fieldType="date"
            value={[filters.createDateFrom, filters.createDateTo]}
            onChange={(dates) => {
              updateFilters("createDateFrom", dates?.[0] ? dates[0].format("YYYY-MM-DD") : "");
              updateFilters("createDateTo", dates?.[1] ? dates[1].format("YYYY-MM-DD") : "");
            }}
          />
          <FormFieldFilter
            label="DOB:"
            fieldType="date"
            value={[filters.dobFrom, filters.dobTo]}
            onChange={(dates) => {
              updateFilters("dobFrom", dates?.[0] ? dates[0].format("YYYY-MM-DD") : "");
              updateFilters("dobTo", dates?.[1] ? dates[1].format("YYYY-MM-DD") : "");
            }}
          />
       

        <FormFieldFilter
          label="Roles:"
          fieldType="select"
          value={filters.roleIds}
          options={USER_ROLE_OPTIONS}
          onChange={(value) => updateFilters("roleIds", value)}
        />
        <FormFieldFilter
          label="Gender"
          value={filters.genders}
          fieldType="radio"
          options={[
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
          ]}
          onChange={(value) => updateFilters("genders", value)}
          direction="row"
        />
        <FormFieldFilter
          label="Status"
          value={filters.status}
          fieldType="radio"
          options={[
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
          ]}
          onChange={(value) => updateFilters("status", value)}
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
export default UserFilter;
