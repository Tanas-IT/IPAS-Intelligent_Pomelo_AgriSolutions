import { Flex, Space, TreeSelect } from "antd";
import { useState } from "react";
import style from "./PlantList.module.scss";
import { useStyle } from "@/hooks";
import { FilterFooter, FormFieldFilter, TagRender } from "@/components";
import { FilterPlantState } from "@/types";

type FilterProps = {
  filters: FilterPlantState;
  updateFilters: (key: keyof FilterPlantState, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const PlantFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const { styles } = useStyle();
  const [prevFilters, setPrevFilters] = useState(filters);

  const isFilterEmpty = !(filters.plantingDateFrom || filters.plantingDateTo);

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
      <Space direction="vertical">
        <FormFieldFilter
          label="Planting Date:"
          fieldType="date"
          value={[filters.plantingDateFrom, filters.plantingDateTo]}
          onChange={(dates) => {
            updateFilters("plantingDateFrom", dates?.[0] ? dates[0].format("YYYY-MM-DD") : "");
            updateFilters("plantingDateTo", dates?.[1] ? dates[1].format("YYYY-MM-DD") : "");
          }}
        />

        {/* <FormFieldFilter
          label="Type Name:"
          fieldType="select"
          value={filters.typeName}
          options={options}
          onChange={(value) => updateFilters("typeName", value)}
        /> */}

        <TreeSelect
          className={`${styles.customSelect}`}
          treeData={plotTreeData}
          // dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
          style={{ width: "100%" }}
          tagRender={TagRender}
          // value={[...selectedPlots, ...selectedRows]}
          // onChange={(values) => {
          //   const plots = values.filter((v) => v.startsWith("plot_"));
          //   const rows = values.filter((v) => v.startsWith("row_"));
          //   setFilterState((prev) => ({
          //     ...prev,
          //     selectedPlots: plots,
          //     selectedRows: rows,
          //   }));
          // }}
          treeCheckable
          showCheckedStrategy={TreeSelect.SHOW_CHILD}
          placeholder="Select Plot or Row"
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
export default PlantFilter;
