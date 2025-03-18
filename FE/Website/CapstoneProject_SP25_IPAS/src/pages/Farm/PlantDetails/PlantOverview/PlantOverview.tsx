import { useEffect, useState } from "react";
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
} from "recharts";
import { Select, Divider, Flex, Empty, Typography, DatePicker } from "antd";
import PlantSectionHeader from "../PlantSectionHeader/PlantSectionHeader";
import style from "./PlantOverview.module.scss";
import dayjs from "dayjs";
import { useMasterTypeOptions } from "@/hooks";
import { MASTER_TYPE } from "@/constants";
import { harvestService } from "@/services";
import { GetHarvestStatisticOfPlant } from "@/payloads";
import { usePlantStore } from "@/stores";
const { Text } = Typography;
const { RangePicker } = DatePicker;

function PlantOverview() {
  const { options: productOptions } = useMasterTypeOptions(MASTER_TYPE.PRODUCT);
  const [yearRange, setYearRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>(() => {
    const currentYear = dayjs().year();
    return [dayjs().subtract(1, "year"), dayjs(currentYear.toString(), "YYYY")];
  });
  const [selectedProduct, setSelectedProduct] = useState<number | string>();
  const [harvestData, setHarvestData] = useState<GetHarvestStatisticOfPlant | null>(null);
  const { plant } = usePlantStore();

  useEffect(() => {
    if (productOptions.length > 0) {
      setSelectedProduct(productOptions[0].value);
    }
  }, [productOptions]);

  const fetchData = async () => {
    if (!selectedProduct || !yearRange || !plant) return;

    const [fromYear, toYear] = [yearRange[0].year(), yearRange[1].year()];
    const res = await harvestService.getHarvestStatisticOfPlant({
      plantId: plant.plantId,
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
      <PlantSectionHeader isCriteria={false} />
      <Divider className={style.divider} />
      <Flex className={style.contentSectionBody} vertical>
        {/* <Text strong style={{ fontSize: 18, textAlign: "center", marginBottom: 10 }}>
          Yield Growth Chart
        </Text> */}
        {/* Bộ lọc */}
        <Flex gap={20} className={style.filterSection}>
          <Text strong>Timeline:</Text>
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
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="monthYear"
                  angle={shouldRotateLabels ? -20 : 0}
                  textAnchor={shouldRotateLabels ? "end" : "middle"}
                  height={shouldRotateLabels ? 50 : 30}
                />
                <YAxis>
                  <Label value="Yield (Kg)" angle={-90} position="insideLeft" />
                </YAxis>
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
