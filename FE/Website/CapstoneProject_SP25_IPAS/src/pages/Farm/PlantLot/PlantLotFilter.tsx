import { Flex, Space } from "antd";
import { useEffect, useState } from "react";
import style from "./PlantLot.module.scss";
import { FilterFooter, FormFieldFilter } from "@/components";
import { LOT_STATUS, PARTNER } from "@/constants";
import { FilterPlantLotState, SelectOption } from "@/types";
import { partnerService } from "@/services";

type FilterProps = {
  filters: FilterPlantLotState;
  updateFilters: (key: keyof FilterPlantLotState, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const PlantLotFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);

  const [partnerOptions, setPartnerOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchPartners = async () => {
      const res = await partnerService.getSelectPartner(PARTNER.PROVIDER);
      if (res.statusCode === 200) {
        setPartnerOptions(
          res.data.map((partner) => ({
            label: partner.name,
            value: partner.id,
          })),
        );
      }
    };

    fetchPartners();
  }, []);

  const isFilterEmpty = !(
    filters.importedDateFrom ||
    filters.importedDateTo ||
    (filters.partnerId && filters.partnerId.length > 0) ||
    (filters.status && filters.status.length > 0) ||
    filters.previousQuantityFrom !== undefined ||
    filters.previousQuantityTo !== undefined ||
    filters.isFromGrafted !== undefined
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
          label="Imported Date:"
          fieldType="date"
          value={[filters.importedDateFrom, filters.importedDateTo]}
          onChange={(dates) => {
            updateFilters("importedDateFrom", dates?.[0] ? dates[0].format("YYYY-MM-DD") : "");
            updateFilters("importedDateTo", dates?.[1] ? dates[1].format("YYYY-MM-DD") : "");
          }}
        />
        <FormFieldFilter
          label="Partners:"
          fieldType="select"
          value={filters.partnerId}
          options={partnerOptions}
          onChange={(value) => updateFilters("partnerId", value)}
        />
        <FormFieldFilter
          label="Status"
          fieldType="select"
          value={filters.status}
          options={Object.entries(LOT_STATUS).map(([key, value]) => ({
            value: key,
            label: value,
          }))}
          onChange={(value) => updateFilters("status", value)}
        />

        <FormFieldFilter
          label="Initial Quantity From - To"
          fieldType="numberRange"
          value={{ from: filters.previousQuantityFrom, to: filters.previousQuantityTo }}
          onChange={(val) => {
            updateFilters("previousQuantityFrom", val.from);
            updateFilters("previousQuantityTo", val.to);
          }}
        />

        <FormFieldFilter
          label="Lot Type"
          value={filters.isFromGrafted}
          fieldType="radio"
          options={[
            { value: true, label: "Grafted Lot" },
            { value: false, label: "Imported Lot" },
          ]}
          onChange={(value) => updateFilters("isFromGrafted", value)}
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
export default PlantLotFilter;
