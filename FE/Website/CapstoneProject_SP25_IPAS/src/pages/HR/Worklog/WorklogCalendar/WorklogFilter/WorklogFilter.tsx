import { Button, Flex, Select, Space } from "antd";
import { useEffect, useState } from "react";
import style from "./WorklogFilter.module.scss";
import { FilterFooter, FormFieldFilter } from "@/components";
import { useGrowthStageOptions, useMasterTypeOptions, useUserInFarmByRole } from "@/hooks";
import { MASTER_TYPE } from "@/constants";
import { worklogStatusOptions } from "@/utils";

type FilterProps = {
  filters: {
    workDateFrom: string;
    workDateTo: string;
    growthStage: string[];
    status: string[];
    employees: string[] | number[];
    typePlan: string[];
  };
  updateFilters: (filters: any) => void;
  onClear: () => void;
  onApply: () => void;
};

const WorklogFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const { options: processTypeOptions } = useMasterTypeOptions(MASTER_TYPE.WORK, true);
  const { options: growthStageOptions } = useGrowthStageOptions(true);
  const listRole = [5, 4];
  const { options } = useUserInFarmByRole(listRole);

  const isFilterEmpty = !(
    localFilters.workDateFrom ||
    localFilters.workDateTo ||
    localFilters.growthStage.length > 0 ||
    localFilters.status.length > 0 ||
    localFilters.employees.length > 0 ||
    localFilters.typePlan.length > 0
  );

  const isFilterChanged = JSON.stringify(localFilters) !== JSON.stringify(filters);

  const handleApply = () => {
    updateFilters(localFilters);
    // onApply();
  };

  // Xử lý khi nhấn Clear
  // const handleClear = () => {
  //   setLocalFilters({
  //     workDateFrom: "",
  //     workDateTo: "",
  //     growthStage: [],
  //     status: [],
  //     employees: [],
  //     plan: [],
  //     typePlan: [],
  //   });
  //   onClear();
  // };
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);
  const handleClear = () => {
    const resetFilters = {
      workDateFrom: "",
      workDateTo: "",
      growthStage: [],
      status: [],
      employees: [],
      typePlan: [],
    };
    setLocalFilters(resetFilters);
    updateFilters(resetFilters);
    onClear();
  };

  return (
    <Flex className={style.filterContent}>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        {/* Date Range */}
        <FormFieldFilter
          label="Date"
          fieldType="date"
          value={[localFilters.workDateFrom, localFilters.workDateTo]}
          onChange={(dates) => {
            setLocalFilters((prev) => ({
              ...prev,
              workDateFrom: dates?.[0] ? dates[0].format("YYYY-MM-DD") : "",
              workDateTo: dates?.[1] ? dates[1].format("YYYY-MM-DD") : "",
            }));
          }}
        />

        <Flex gap={20}>
          <FormFieldFilter
            label="Growth Stage"
            fieldType="select"
            value={localFilters.growthStage}
            options={growthStageOptions}
            onChange={(value) => setLocalFilters((prev) => ({ ...prev, growthStage: value }))}
          />
          <FormFieldFilter
            label="Process Type"
            fieldType="select"
            value={localFilters.typePlan}
            options={processTypeOptions}
            onChange={(value) => setLocalFilters((prev) => ({ ...prev, typePlan: value }))}
          />
        </Flex>

        <FormFieldFilter
          label="Employee"
          fieldType="select"
          value={localFilters.employees}
          options={options}
          onChange={(value) => setLocalFilters((prev) => ({ ...prev, employees: value }))}
        />

        <FormFieldFilter
          label="Status"
          fieldType="select"
          value={localFilters.status}
          options={worklogStatusOptions}
          onChange={(value) => setLocalFilters((prev) => ({ ...prev, status: value }))}
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

export default WorklogFilter;
