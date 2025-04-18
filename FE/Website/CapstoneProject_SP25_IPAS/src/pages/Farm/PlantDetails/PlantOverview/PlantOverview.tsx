import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Label,
  ReferenceArea,
  ReferenceLine,
} from "recharts";
import { Select, Divider, Flex, Empty, Typography, DatePicker } from "antd";
import style from "./PlantOverview.module.scss";
import dayjs from "dayjs";
import { useMasterTypeOptions, useSystemConfigOptions } from "@/hooks";
import { MASTER_TYPE, SYSTEM_CONFIG_GROUP } from "@/constants";
import { harvestService } from "@/services";
import { GetHarvestStatisticOfPlant } from "@/payloads";
import { usePlantStore } from "@/stores";
import { Icons } from "@/assets";
import { PlantSectionHeader } from "@/components";
const { Text } = Typography;
const { RangePicker } = DatePicker;

interface PlantOverviewProps {
  productType?: number;
  timeline?: [dayjs.Dayjs, dayjs.Dayjs];
}

function PlantOverview({ productType, timeline }: PlantOverviewProps) {
  const { options: productOptions } = useMasterTypeOptions(MASTER_TYPE.PRODUCT);
  const [yearRange, setYearRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>(() => {
    const currentYear = dayjs().year();
    return [dayjs().subtract(1, "year"), dayjs(currentYear.toString(), "YYYY")];
  });
  const [selectedProduct, setSelectedProduct] = useState<number | string>();
  const [harvestData, setHarvestData] = useState<GetHarvestStatisticOfPlant | null>(null);
  const { plant, plantId } = usePlantStore();
  const { options, loading } = useSystemConfigOptions(
    SYSTEM_CONFIG_GROUP.YIELD_THRESHOLD,
    undefined,
    true,
  );

  useEffect(() => {
    if (productType !== undefined && timeline?.length === 2) {
      setYearRange([dayjs(timeline[0]), dayjs(timeline[1])] as [dayjs.Dayjs, dayjs.Dayjs]);
      setSelectedProduct(Number(productType));
    } else if (productOptions.length > 0) {
      setSelectedProduct(productOptions[0].value);
    }
  }, [productType, timeline, productOptions]);

  const fetchData = async () => {
    if (!selectedProduct || !yearRange || (!plant && !plantId)) return;

    const resolvedPlantId = plant?.plantId ?? plantId; // ✅ Lấy ID từ plant hoặc plantId
    if (resolvedPlantId === null) return;

    const [fromYear, toYear] = [yearRange[0].year(), yearRange[1].year()];
    const res = await harvestService.getHarvestStatisticOfPlant({
      plantId: resolvedPlantId,
      yearFrom: fromYear,
      yearTo: toYear,
      productId: Number(selectedProduct),
    });

    setHarvestData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, [selectedProduct, yearRange]);

  // Xử lý khi chọn khoảng năm
  const handleYearChange = (values: any) => {
    if (values) setYearRange(values);
  };

  // Kiểm tra nếu yearRange bị xóa
  if (!yearRange || yearRange.length !== 2) return;

  // Lọc và sắp xếp dữ liệu theo thời gian
  const chartData =
    harvestData?.monthlyData.map((item) => ({
      monthYear: `${dayjs()
        .month(item.month - 1)
        .format("MMM")} ${item.year}`, // Chuyển số tháng thành tên tháng
      yield: item.totalQuantity, // Sản lượng
      year: item.year, // Để hiển thị tooltip
    })) ?? [];

  const shouldRotateLabels = chartData.length > 6; // Nếu nhiều hơn 6 điểm thì xoay

  return (
    <Flex className={style.contentDetailWrapper} vertical>
      <PlantSectionHeader />
      <Divider className={style.divider} />
      <Flex className={style.contentSectionBody} vertical>
        {/* Bộ lọc */}
        <Flex gap={20} className={style.filterSection}>
          <Flex justify="center" align="center" gap={4}>
            <Icons.calendar className={style.icon} />
            <Text strong>Timeline:</Text>
          </Flex>
          <RangePicker picker="year" value={yearRange} onChange={handleYearChange} allowClear />
          <Select
            placeholder="Select product type"
            className={style.select}
            value={selectedProduct}
            onChange={(value) => setSelectedProduct(value)}
            options={productOptions}
          />
        </Flex>

        {harvestData && (
          <Flex className={style.summarySection} gap={20}>
            <Flex gap={8}>
              <Text strong>Total Yield: </Text>
              <Text>{harvestData.totalYearlyQuantity} Kg</Text>
            </Flex>

            <Flex gap={8}>
              <Text strong>Number of Harvests: </Text>
              <Text>{harvestData.numberHarvest} times</Text>
            </Flex>
          </Flex>
        )}

        {/* Biểu đồ */}
        <div className={style.chartContainer}>
          {chartData && chartData.length > 0 ? (
            <ResponsiveContainer width="100%" minHeight={380}>
              <LineChart data={chartData} margin={{ right: 100 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="monthYear"
                  angle={shouldRotateLabels ? -20 : 0}
                  textAnchor={shouldRotateLabels ? "end" : "middle"}
                  height={shouldRotateLabels ? 50 : 30}
                />
                <YAxis domain={[0, "auto"]}>
                  <Label value="Yield (Kg)" angle={-90} position="insideLeft" />
                </YAxis>

                {(() => {
                  const sortedOptions = [...options].sort(
                    (a, b) => Number(a.label) - Number(b.label),
                  );

                  return sortedOptions.map((option, index) => {
                    const y = Number(option.label);
                    const y1 = index === 0 ? 0 : Number(sortedOptions[index - 1].label);
                    const color = index === 0 ? "#d96b6b" : index === 1 ? "#c9b458" : "#76b947"; // bạn có thể chỉnh màu theo ý

                    return (
                      <React.Fragment key={option.label?.toString()}>
                        <ReferenceArea y1={y1} y2={y} fill={color} fillOpacity={0.1} />
                        <ReferenceLine
                          y={y}
                          stroke={color}
                          ifOverflow="extendDomain"
                          label={{
                            value: String(option.value),
                            position: "right",
                            fill: color,
                            fontSize: 12,
                            dy: 10,
                          }}
                        />
                      </React.Fragment>
                    );
                  });
                })()}

                <Tooltip
                  formatter={(value, _, { payload }) => [`${value} Kg`, `Year ${payload.year}`]}
                />
                <Legend />

                {/* Một đường duy nhất cho tất cả dữ liệu */}
                <Line
                  type="monotone"
                  dataKey="yield"
                  stroke="#82ca9d"
                  strokeWidth={3}
                  label={{ position: "top", fill: "#333", fontSize: 12 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Empty description="No data available" />
          )}
        </div>
      </Flex>
    </Flex>
  );
}

export default PlantOverview;
