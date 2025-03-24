import { Flex, Space } from "antd";
import { useEffect, useState } from "react";
import style from "./PlantList.module.scss";
import { useGrowthStageOptions, useMasterTypeOptions } from "@/hooks";
import { FilterFooter, FormFieldFilter } from "@/components";
import { FilterPlantState } from "@/types";
import { HEALTH_STATUS, MASTER_TYPE } from "@/constants";
import { landPlotService, landRowService } from "@/services";

type FilterProps = {
  filters: FilterPlantState;
  updateFilters: (key: keyof FilterPlantState, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const PlantFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);
  const { options: cultivarTypeOptions } = useMasterTypeOptions(MASTER_TYPE.CULTIVAR);
  const { options: growthStageOptions } = useGrowthStageOptions();

  const [treeData, setTreeData] = useState<any[]>([]);
  const [loadingPlots, setLoadingPlots] = useState(false);
  const [loadingRows, setLoadingRows] = useState<{ [key: number]: boolean }>({});
  const [selectedTreeValues, setSelectedTreeValues] = useState<string[]>(
    filters.landRowIds || filters.landPlotIds || [],
  );

  useEffect(() => {
    const fetchLandPlots = async () => {
      setLoadingPlots(true);
      try {
        const res = await landPlotService.getLandPlotsSelected();
        if (res.statusCode === 200) {
          const plots = res.data.map((plot) => ({
            title: `${plot.code} - ${plot.name}`,
            value: `plot_${plot.id}`,
            key: `plot_${plot.id}`,
            isLeaf: false,
          }));
          setTreeData(plots);
        }
      } finally {
        setLoadingPlots(false);
      }
    };
    fetchLandPlots();
  }, []);

  const handleLoadData = async (node: any) => {
    if (node.children) return;

    const plotId = parseInt(node.value.split("_")[1]);

    setLoadingRows((prev) => ({ ...prev, [plotId]: true }));

    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // ⏳ Delay

      const res = await landRowService.getLandRowsSelected(plotId);
      if (res.statusCode === 200) {
        const rows = res.data.map((row) => ({
          title: `${row.code} - ${row.name} `,
          value: `row_${row.id}`,
          key: `row_${row.id}`,
          isLeaf: true, // Hàng (row) là lá
        }));

        setTreeData((prev) =>
          prev.map((plot) => (plot.value === node.value ? { ...plot, children: rows } : plot)),
        );
      }
    } finally {
      setLoadingRows((prev) => ({ ...prev, [plotId]: false }));
    }
  };

  const handleTreeSelectChange = (values: string[]) => {
    setSelectedTreeValues(values); // Cập nhật state hiển thị

    const rowIds = values.filter((v) => v.startsWith("row_")).map((v) => v.split("_")[1]);
    const plotIds = values.filter((v) => v.startsWith("plot_")).map((v) => v.split("_")[1]);

    updateFilters("landRowIds", rowIds);
    updateFilters("landPlotIds", plotIds);
  };

  const handleClear = () => {
    onClear();
    setSelectedTreeValues([]);
  };

  const isFilterEmpty = !(
    filters.plantingDateFrom ||
    filters.plantingDateTo ||
    (filters.landRowIds && filters.landRowIds.length > 0) ||
    selectedTreeValues.length > 0 ||
    (filters.cultivarIds && filters.cultivarIds.length > 0) ||
    (filters.growthStageIds && filters.growthStageIds.length > 0) ||
    (filters.healthStatus && filters.healthStatus.length > 0) ||
    filters.isLocated !== undefined ||
    filters.isDead !== undefined
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
          label="Planting Date"
          fieldType="date"
          value={[filters.plantingDateFrom, filters.plantingDateTo]}
          onChange={(dates) => {
            updateFilters("plantingDateFrom", dates?.[0] ? dates[0].format("YYYY-MM-DD") : "");
            updateFilters("plantingDateTo", dates?.[1] ? dates[1].format("YYYY-MM-DD") : "");
          }}
        />

        <FormFieldFilter
          label="Plant Location"
          fieldType="treeSelect"
          value={selectedTreeValues}
          treeData={treeData}
          onChange={handleTreeSelectChange}
          loadData={handleLoadData}
        />

        <FormFieldFilter
          label="Health Status"
          fieldType="select"
          value={filters.healthStatus}
          options={Object.entries(HEALTH_STATUS).map(([key, value]) => ({
            value: key,
            label: value,
          }))}
          onChange={(value) => updateFilters("healthStatus", value)}
        />

        <Flex className={style.row}>
          <FormFieldFilter
            label="Cultivar"
            fieldType="select"
            value={filters.cultivarIds}
            options={cultivarTypeOptions}
            onChange={(value) => updateFilters("cultivarIds", value)}
          />

          <FormFieldFilter
            label="Growth Stage"
            fieldType="select"
            value={filters.growthStageIds}
            options={growthStageOptions}
            onChange={(value) => updateFilters("growthStageIds", value)}
          />
        </Flex>

        {/* <Flex className={style.row}> */}
        {/* <FormFieldFilter
          label="Is Assigned"
          fieldType="radio"
          value={filters.isLocated}
          options={[
            { value: true, label: "Assigned" },
            { value: false, label: "Not Assigned" },
          ]}
          onChange={(value) => updateFilters("isLocated", value)}
          direction="row"
        /> */}

        {/* </Flex> */}

        <FormFieldFilter
          label="Life Status"
          fieldType="radio"
          value={filters.isDead}
          options={[
            { value: true, label: "Dead" },
            { value: false, label: "Alive" },
          ]}
          onChange={(value) => updateFilters("isDead", value)}
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
export default PlantFilter;
