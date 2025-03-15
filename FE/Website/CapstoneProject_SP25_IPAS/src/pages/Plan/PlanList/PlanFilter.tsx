import { Button, Flex, Space, Card, Row, Col } from "antd";
import { useEffect, useState } from "react";
import style from "./PlanList.module.scss";
import dayjs from "dayjs";
import { InfoField, FilterFooter, FormFieldFilter } from "@/components";
import { addPlanFormFields, MASTER_TYPE } from "@/constants";
import {
  activeOptions,
  fetchGrowthStageOptions,
  fetchTypeOptionsByName,
  fetchUserByRole,
  frequencyOptions,
  statusOptions,
} from "@/utils";
import Title from "antd/es/typography/Title";
import { Icons } from "@/assets";
import { useGrowthStageOptions, useMasterTypeOptions } from "@/hooks";

type FilterProps = {
  filters: {
    createDateFrom: string;
    createDateTo: string;
    growStages: string[];
    processTypes: string[];
    status: string[];
    frequency: string[];
    isActive: string[];
  };
  updateFilters: (key: string, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const PlanFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);
  const { options: processTypeOptions } = useMasterTypeOptions(MASTER_TYPE.PROCESS, true);
  const { options: growthStageOptions } = useGrowthStageOptions(true);
  const [assignorOptions, setAssignorOptions] = useState<{ value: string; label: string }[]>([]);

  const loadData = async () => {
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
    filters.frequency.length > 0
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
          <Icons.filter className={style.icon} />
          <Title level={4} className={style.titleFilter}>
            Filter Plans
          </Title>
        </div>
        <Row gutter={[64, 16]}>
          <Col span={12}>
            {/* <InfoField
              label="Create Date"
              name={addPlanFormFields.dateRange}
              type="dateRange"
              isEditing
              hasFeedback={false}
              onChange={(value) => {
                updateFilters(
                  "createDateFrom",
                  value?.[0] ? dayjs(value[0]).format("YYYY-MM-DD") : null,
                );
                updateFilters(
                  "createDateTo",
                  value?.[1] ? dayjs(value[1]).format("YYYY-MM-DD") : null,
                );
              }}
            /> */}
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
              label="Growth Stage:"
              fieldType="select"
              value={filters.growStages}
              options={growthStageOptions}
              onChange={(value) => updateFilters("growthStage", value)}
            />
            <FormFieldFilter
              label="Process Types:"
              fieldType="select"
              value={filters.processTypes}
              options={processTypeOptions}
              onChange={(value) => updateFilters("processTypes", value)}
            />
          </Col>
          <Col span={12}>
            <FormFieldFilter
              label="Frequency:"
              fieldType="select"
              value={filters.frequency}
              options={frequencyOptions}
              onChange={(value) => updateFilters("frequency", value)}
            />
            <FormFieldFilter
              label="Status:"
              fieldType="select"
              value={filters.status}
              options={statusOptions}
              onChange={(value) => updateFilters("status", value)}
            />
            <FormFieldFilter
              label="Status:"
              fieldType="radio"
              value={filters.isActive}
              options={activeOptions}
              onChange={(value) => updateFilters("isActive", value)}
            />
          </Col>
        </Row>
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
export default PlanFilter;
