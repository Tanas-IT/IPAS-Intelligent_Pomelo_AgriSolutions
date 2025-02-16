import { Button, Flex, Space, Card, Row, Col } from "antd";
import { useEffect, useState } from "react";
import style from "./PackageList.module.scss";
import dayjs from "dayjs";
import { InfoField, FilterFooter } from "@/components";
import { addPlanFormFields } from "@/constants";
import { activeOptions, fetchCropOptions, fetchGrowthStageOptions, fetchProcessOptions, fetchUserByRole, frequencyOptions, statusOptions } from "@/utils";
import Title from "antd/es/typography/Title";
import { Icons } from "@/assets";

type FilterProps = {
  filters: {
    createDateFrom: string;
    createDateTo: string;
    growStages: string[];
    processTypes: string[];
    status: string[];
    frequency: string[],
    isActive: string[],
    assignor: string[],
  };
  updateFilters: (key: string, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const PackageFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);
  const [growthStageOptions, setGrowthStageOptions] = useState<{ value: string, label: string }[]>([]);
  const [processOptions, setProcessOptions] = useState<{ value: string, label: string }[]>([]);
  const [assignorOptions, setAssignorOptions] = useState<{ value: string, label: string }[]>([]);

  const loadData = async () => {
    setProcessOptions(await fetchProcessOptions());
    setGrowthStageOptions(await fetchGrowthStageOptions());
    setAssignorOptions(await fetchUserByRole("User"));
  };

  useEffect(() => {
    loadData();
  }, []);

  const isFilterEmpty = !(
    filters.createDateFrom ||
    filters.createDateTo ||
    filters.growStages.length > 0 ||
    filters.processTypes.length > 0 ||
    filters.status.length > 0 ||
    filters.isActive.length > 0 ||
    filters.frequency.length > 0 ||
    filters.assignor.length > 0
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
      <div className={style.filter}>
        <Icons.filter className={style.icon}/>
        <Title level={4} className={style.titleFilter}>Filter Packages</Title>
      </div>
          <InfoField
            label="Create Date"
            name={addPlanFormFields.dateRange}
            type="dateRange"
            isEditing
            hasFeedback={false}
            onChange={(value) => {
              updateFilters("createDateFrom", value?.[0] ? dayjs(value[0]).format("YYYY-MM-DD") : null);
              updateFilters("createDateTo", value?.[1] ? dayjs(value[1]).format("YYYY-MM-DD") : null);
            }}
          />
          <InfoField
            label="Active"
            name={addPlanFormFields.isActive}
            options={activeOptions}
            isEditing
            multiple
            type="select"
            hasFeedback={false}
            onChange={(value) => updateFilters("isActive", value)}
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
export default PackageFilter;
