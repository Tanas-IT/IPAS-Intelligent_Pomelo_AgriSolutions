import { Flex, Space } from "antd";
import { useEffect, useState } from "react";
import style from "./PaymentHistory.module.scss";
import { FilterFooter, FormFieldFilter } from "@/components";
import { FilterPaymentHistoryState } from "@/types";
import { packageService } from "@/services";
import { PAYMENT_STATUS } from "@/constants";

type FilterProps = {
  filters: FilterPaymentHistoryState;
  updateFilters: (key: keyof FilterPaymentHistoryState, value: any) => void;
  onClear: () => void;
  onApply: () => void;
};
const PaymentHistoryFilter = ({ filters, updateFilters, onClear, onApply }: FilterProps) => {
  const [prevFilters, setPrevFilters] = useState(filters);
  const [packageOptions, setPackageOptions] = useState<{ label: string; value: number }[]>([]);

  const fetchPackages = async () => {
    const res = await packageService.getPackageSelected();
    if (res.statusCode === 200 && res.data) {
      const options = res.data.map((pkg) => ({
        label: pkg.packageName,
        value: pkg.packageId,
      }));
      setPackageOptions(options);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleClear = () => {
    onClear();
  };

  const isFilterEmpty = !(
    filters.orderDateFrom ||
    filters.orderDateTo ||
    filters.enrolledDateFrom ||
    filters.enrolledDateTo ||
    filters.expiredDateFrom ||
    filters.expiredDateTo ||
    filters.totalPriceFrom !== undefined ||
    filters.totalPriceTo !== undefined ||
    (filters.packageIds && filters.packageIds.length > 0) ||
    (filters.farmIds && filters.farmIds.length > 0) ||
    filters.status !== undefined
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
          label="Order Date:"
          fieldType="date"
          value={[filters.orderDateFrom, filters.orderDateTo]}
          onChange={(dates) => {
            updateFilters("orderDateFrom", dates?.[0] ? dates[0].format("YYYY-MM-DD") : "");
            updateFilters("orderDateTo", dates?.[1] ? dates[1].format("YYYY-MM-DD") : "");
          }}
        />
        <Flex gap={20}>
          <FormFieldFilter
            label="Enrolled Date:"
            fieldType="date"
            value={[filters.enrolledDateFrom, filters.enrolledDateTo]}
            onChange={(dates) => {
              updateFilters("enrolledDateFrom", dates?.[0] ? dates[0].format("YYYY-MM-DD") : "");
              updateFilters("enrolledDateTo", dates?.[1] ? dates[1].format("YYYY-MM-DD") : "");
            }}
          />
          <FormFieldFilter
            label="Expired Date:"
            fieldType="date"
            value={[filters.expiredDateFrom, filters.expiredDateTo]}
            onChange={(dates) => {
              updateFilters("expiredDateFrom", dates?.[0] ? dates[0].format("YYYY-MM-DD") : "");
              updateFilters("expiredDateTo", dates?.[1] ? dates[1].format("YYYY-MM-DD") : "");
            }}
          />
        </Flex>

        <FormFieldFilter
          label="Total Price From - To"
          fieldType="numberRange"
          value={{ from: filters.totalPriceFrom, to: filters.totalPriceTo }}
          onChange={(val) => {
            updateFilters("totalPriceFrom", val.from);
            updateFilters("totalPriceTo", val.to);
          }}
        />
        <Flex gap={20}>
          <FormFieldFilter
            label="Farms"
            fieldType="select"
            value={filters.farmIds}
            // options={plotOptions}
            onChange={(value) => updateFilters("farmIds", value)}
          />
          <FormFieldFilter
            label="Packages"
            fieldType="select"
            value={filters.packageIds}
            options={packageOptions}
            onChange={(value) => updateFilters("packageIds", value)}
          />
        </Flex>
        <FormFieldFilter
          label="Status"
          value={filters.status}
          fieldType="radio"
          options={Object.values(PAYMENT_STATUS).map((status) => ({
            value: status,
            label: status,
          }))}
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
export default PaymentHistoryFilter;
