import { Flex, Space } from "antd";
import { useEffect, useState } from "react";
import { FilterFooter, FormFieldFilter } from "@/components";
import { GRAFTED_STATUS, GROWTH_ACTIONS, MASTER_TYPE } from "@/constants";
import { FilterGraftedPlantState, SelectOption } from "@/types";
import { useMasterTypeOptions, usePlantLotOptions } from "@/hooks";
import style from "./GraftedPlant.module.scss";
import { plantService } from "@/services";

type FilterProps = {
  filters: FilterGraftedPlantState;
  updateFilters: (key: keyof FilterGraftedPlantState, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const GraftedPlantFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);
  const { options: cultivarTypeOptions } = useMasterTypeOptions(MASTER_TYPE.CULTIVAR);
  const { options: plantLotOptions } = usePlantLotOptions(true);
  const [plantOptions, setPlantOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchPlants = async () => {
      const res = await plantService.getPlantOfStageActive(GROWTH_ACTIONS.GRAFTED);
      if (res.statusCode === 200) {
        const options = res.data.map((plant) => ({
          value: plant.id,
          label: plant.name,
        }));
        setPlantOptions(options);
      }
    };
    fetchPlants();
  }, []);

  const isFilterEmpty = !(
    filters.separatedDateFrom ||
    filters.separatedDateTo ||
    (filters.plantIds && filters.plantIds.length > 0) ||
    (filters.plantLotIds && filters.plantLotIds.length > 0) ||
    (filters.cultivarIds && filters.cultivarIds.length > 0) ||
    (filters.status && filters.status.length > 0) ||
    filters.graftedDateFrom ||
    filters.graftedDateTo ||
    filters.isCompleted !== undefined
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
        <FormFieldFilter
          label="Separated Date:"
          fieldType="date"
          value={[filters.separatedDateFrom, filters.separatedDateTo]}
          onChange={(dates) => {
            updateFilters("separatedDateFrom", dates?.[0] ? dates[0].format("YYYY-MM-DD") : "");
            updateFilters("separatedDateTo", dates?.[1] ? dates[1].format("YYYY-MM-DD") : "");
          }}
        />

        <FormFieldFilter
          label="Grafted Date:"
          fieldType="date"
          value={[filters.graftedDateFrom, filters.graftedDateTo]}
          onChange={(dates) => {
            updateFilters("graftedDateFrom", dates?.[0] ? dates[0].format("YYYY-MM-DD") : "");
            updateFilters("graftedDateTo", dates?.[1] ? dates[1].format("YYYY-MM-DD") : "");
          }}
        />

        <Flex gap={20}>
          <FormFieldFilter
            label="Plants"
            fieldType="select"
            value={filters.plantIds}
            options={plantOptions}
            onChange={(value) => updateFilters("plantIds", value)}
          />

          <FormFieldFilter
            label="Plant Lots"
            fieldType="select"
            value={filters.plantLotIds}
            options={plantLotOptions}
            onChange={(value) => updateFilters("plantLotIds", value)}
          />
        </Flex>

        <Flex gap={20}>
          <FormFieldFilter
            label="Cultivar"
            fieldType="select"
            value={filters.cultivarIds}
            options={cultivarTypeOptions}
            onChange={(value) => updateFilters("cultivarIds", value)}
          />

          <FormFieldFilter
            label="Status"
            fieldType="select"
            value={filters.status}
            options={Object.entries(GRAFTED_STATUS).map(([key, value]) => ({
              value: key,
              label: value,
            }))}
            onChange={(value) => updateFilters("status", value)}
          />
        </Flex>

        <FormFieldFilter
          label="Is Completed"
          fieldType="radio"
          value={filters.isCompleted}
          options={[
            { value: true, label: "Completed" },
            { value: false, label: "Not Completed" },
          ]}
          onChange={(value) => updateFilters("isCompleted", value)}
          direction="row"
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
export default GraftedPlantFilter;
