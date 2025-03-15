import { Button, Flex, Select, Space } from "antd";
import { useState } from "react";
import style from "./WorklogFilter.module.scss";
import { FilterFooter, FormFieldFilter } from "@/components";
import { useGrowthStageOptions, useMasterTypeOptions, useUserInFarmByRole } from "@/hooks";
import { MASTER_TYPE } from "@/constants";
import { worklogStatusOptions } from "@/utils";

type FilterProps = {
  filters: {
    workDateFrom: string; // Ngày làm (bắt đầu)
    workDateTo: string; // Ngày làm (kết thúc)
    growthStage: string[]; // Giai đoạn phát triển
    status: string[]; // Trạng thái
    employees: string[]; // Nhân viên
    plan: string[]; // Kế hoạch
    processTypes: string[]; // Loại quy trình
  };
  updateFilters: (filters: any) => void; // Cập nhật filters từ Worklog
  onClear: () => void; // Xử lý khi clear filter
  onApply: () => void; // Xử lý khi apply filter
};

const WorklogFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [localFilters, setLocalFilters] = useState(filters); // Local state để quản lý filter tạm thời

  const { options: processTypeOptions } = useMasterTypeOptions(MASTER_TYPE.PROCESS, false);
  const { options: growthStageOptions } = useGrowthStageOptions(false);
  const listRole = [5, 4]; // Ví dụ: role 5 và 4
  const { options } = useUserInFarmByRole(listRole);

  const planOptions = [
    { value: "plan1", label: "Plan 1" },
    { value: "plan2", label: "Plan 2" },
    { value: "plan3", label: "Plan 3" },
  ];

  // Kiểm tra filter có rỗng không
  const isFilterEmpty = !(
    localFilters.workDateFrom ||
    localFilters.workDateTo ||
    localFilters.growthStage.length > 0 ||
    localFilters.status.length > 0 ||
    localFilters.employees.length > 0 ||
    localFilters.plan.length > 0 ||
    localFilters.processTypes.length > 0
  );

  // Kiểm tra filter có thay đổi không
  const isFilterChanged = JSON.stringify(localFilters) !== JSON.stringify(filters);

  // Xử lý khi nhấn Apply
  const handleApply = () => {
    updateFilters(localFilters); // Cập nhật filters từ Worklog
    onApply(); // Gọi API hoặc xử lý logic khác
  };

  // Xử lý khi nhấn Clear
  const handleClear = () => {
    setLocalFilters({
      workDateFrom: "",
      workDateTo: "",
      growthStage: [],
      status: [],
      employees: [],
      plan: [],
      processTypes: [],
    });
    onClear(); // Gọi hàm clear từ Worklog
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

        {/* Growth Stage và Process Type */}
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
            value={localFilters.processTypes}
            options={processTypeOptions}
            onChange={(value) => setLocalFilters((prev) => ({ ...prev, processTypes: value }))}
          />
        </Flex>

        {/* Plan */}
        <FormFieldFilter
          label="Plan"
          fieldType="select"
          value={localFilters.plan}
          options={planOptions}
          onChange={(value) => setLocalFilters((prev) => ({ ...prev, plan: value }))}
        />

        {/* Employee */}
        <FormFieldFilter
          label="Employee"
          fieldType="selectCustom"
          value={localFilters.employees}
          optionCustom={options}
          onChange={(value) => setLocalFilters((prev) => ({ ...prev, employees: value }))}
        />

        {/* Status */}
        <FormFieldFilter
          label="Status"
          fieldType="select"
          value={localFilters.status}
          options={worklogStatusOptions}
          onChange={(value) => setLocalFilters((prev) => ({ ...prev, status: value }))}
        />

        {/* Footer với nút Clear và Apply */}
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