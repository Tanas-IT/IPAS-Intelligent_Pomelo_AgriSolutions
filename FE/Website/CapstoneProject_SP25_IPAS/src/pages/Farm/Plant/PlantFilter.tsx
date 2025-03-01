import { Flex, Space, TreeSelect } from "antd";
import { useState } from "react";
import style from "./PlantList.module.scss";
import { useGrowthStageOptions, useMasterTypeOptions } from "@/hooks";
import { FilterFooter, FormFieldFilter, TagRender } from "@/components";
import { FilterPlantState } from "@/types";
import { MASTER_TYPE } from "@/constants";

type FilterProps = {
  filters: FilterPlantState;
  updateFilters: (key: keyof FilterPlantState, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const PlantFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);
  const { options: cultivarTypeOptions } = useMasterTypeOptions(MASTER_TYPE.CULTIVAR, true);
  const { options: growthStageOptions } = useGrowthStageOptions(false);

  const isFilterEmpty = !(
    filters.plantingDateFrom ||
    filters.plantingDateTo ||
    (filters.cultivarIds && filters.cultivarIds.length > 0) ||
    (filters.growthStageIds && filters.growthStageIds.length > 0) ||
    (filters.healthStatus && filters.healthStatus.length > 0) ||
    filters.isLocated !== undefined
  );

  const isFilterChanged = JSON.stringify(filters) !== JSON.stringify(prevFilters);
  const handleApply = () => {
    if (isFilterChanged) {
      onApply();
      setPrevFilters(filters);
    }
  };

  const plotTreeData = [
    {
      title: "Plot A",
      value: "plot_A", // ID thửa đất
      children: [
        { title: "Row 1", value: "row_1" },
        { title: "Row 2", value: "row_2" },
      ],
    },
    {
      title: "Plot B",
      value: "plot_B",
      children: [
        { title: "Row 3", value: "row_3" },
        { title: "Row 4", value: "row_4" },
      ],
    },
  ];

  return (
    <Flex className={style.filterContent}>
      <Space direction="vertical" style={{ width: "100%" }}>
        <FormFieldFilter
          label="Planting Date:"
          fieldType="date"
          value={[filters.plantingDateFrom, filters.plantingDateTo]}
          onChange={(dates) => {
            updateFilters("plantingDateFrom", dates?.[0] ? dates[0].format("YYYY-MM-DD") : "");
            updateFilters("plantingDateTo", dates?.[1] ? dates[1].format("YYYY-MM-DD") : "");
          }}
        />
        <Flex className={style.row}>
          <FormFieldFilter
            label="Cultivar:"
            fieldType="select"
            value={filters.cultivarIds}
            options={cultivarTypeOptions}
            onChange={(value) => updateFilters("cultivarIds", value)}
          />

          <FormFieldFilter
            label="Growth Stage:"
            fieldType="select"
            value={filters.growthStageIds}
            options={growthStageOptions}
            onChange={(value) => updateFilters("growthStageIds", value)}
          />
        </Flex>

        <FormFieldFilter
          label="Is Assigned: "
          fieldType="radio"
          value={filters.isLocated}
          options={[
            { value: true, label: "Assigned" },
            { value: false, label: "Not Assigned" },
          ]}
          onChange={(value) => updateFilters("isLocated", value)}
          direction="row"
        />

        {/* <TreeSelect
          className={`${styles.customSelect}`}
          treeData={plotTreeData}
          style={{ width: "100%" }}
          tagRender={TagRender}
          onChange={(values) => {
            console.log("Selected values:", values); // Debug giá trị
          }}
          treeCheckable
          showCheckedStrategy={TreeSelect.SHOW_CHILD}
          placeholder="Select Plot or Row"
        /> */}

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
export default PlantFilter;
