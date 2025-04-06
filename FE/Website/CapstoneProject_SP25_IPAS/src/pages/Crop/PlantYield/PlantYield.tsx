import { useEffect, useState } from "react";
import {
  Select,
  Table,
  Card,
  Flex,
  Typography,
  Divider,
  Button,
  DatePicker,
  Empty,
  Tag,
} from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import style from "./PlantYield.module.scss";
import { useMasterTypeOptions } from "@/hooks";
import { healthStatusColors, MASTER_TYPE, ROUTES } from "@/constants";
import dayjs from "dayjs";
import { harvestService } from "@/services";
import { GetHarvestStatisticPlants } from "@/payloads";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const COLORS = ["#4CAF50", "#FFC107", "#FF5733"]; // Xanh lá, vàng, đỏ

const PlantYield = () => {
  const navigate = useNavigate();
  const { options: productOptions } = useMasterTypeOptions(MASTER_TYPE.PRODUCT);
  const [yearRange, setYearRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [topX, setTopX] = useState<number | null>(null);
  const [productType, setProductType] = useState<number>();
  const [harvestData, setHarvestData] = useState<GetHarvestStatisticPlants[]>([]);

  const fetchDataInYear = async () => {
    if (!yearRange || !topX || !productType) return;

    const [fromYear, toYear] = [yearRange[0].year(), yearRange[1].year()];
    const res = await harvestService.getHarvestStatisticInYear({
      topN: topX,
      yearFrom: fromYear,
      yearTo: toYear,
      productId: Number(productType),
    });

    setHarvestData(res.data ?? []);
  };

  useEffect(() => {
    fetchDataInYear();
  }, [yearRange, topX, productType]);

  const handleYearChange = (values: any) => {
    if (values) setYearRange(values);
  };

  // Tính năng suất trung bình
  const averageYield =
    harvestData.reduce((sum, item) => sum + item.totalQuantity, 0) / harvestData.length || 0;

  const highThreshold = averageYield * 1.2; // 120% mức trung bình
  const lowThreshold = averageYield * 0.8; // 80% mức trung bình

  // Phân loại cây theo năng suất
  const highYieldCount = harvestData.filter((item) => item.totalQuantity >= highThreshold).length;
  const mediumYieldCount = harvestData.filter(
    (item) => item.totalQuantity < highThreshold && item.totalQuantity >= lowThreshold,
  ).length;
  const lowYieldCount = harvestData.filter((item) => item.totalQuantity < lowThreshold).length;

  const pieChartData = [
    { name: "High Yield Trees", value: highYieldCount },
    { name: "Medium Yield Trees", value: mediumYieldCount },
    { name: "Low Yield Trees", value: lowYieldCount },
  ];

  const handleClick = (plantId: number) => {
    navigate(ROUTES.FARM_PLANT_DETAIL(plantId), {
      state: { productType, yearRange: yearRange?.map((t) => t.toISOString()) },
    });
  };

  return (
    <div className={style.container}>
      {/* Header */}
      <Title level={3} className={style.title}>
        🌿 Plant Yield Dashboard
      </Title>
      <Divider />

      {/* Bộ lọc */}
      <Flex className={style.filterContainer}>
        <Flex className={style.filterField}>
          <Text strong>Timeline:</Text>
          <RangePicker picker="year" value={yearRange} onChange={handleYearChange} />
        </Flex>

        <Select
          className={style.select}
          placeholder="Top X"
          onChange={(value) => setTopX(Number(value))}
          value={topX}
        >
          <Select.Option value={5}>Top 5</Select.Option>
          <Select.Option value={10}>Top 10</Select.Option>
          <Select.Option value={15}>Top 15</Select.Option>
          <Select.Option value={20}>Top 20</Select.Option>
        </Select>

        <Select
          className={style.select}
          placeholder="Product Type"
          onChange={setProductType}
          value={productType}
          options={productOptions}
        />
      </Flex>

      <Divider className={style.divider} />

      {/* Biểu đồ & Bảng dữ liệu */}
      <Flex className={style.chartTableContainer}>
        <Card title="📊 Yield Performance" className={style.cardContainer}>
          {/* Biểu đồ cột */}
          <Flex gap={16} justify="center" style={{ width: "100%" }}>
            {harvestData.length > 0 ? (
              <>
                <div className={style.chartContainer} style={{ flex: 2 }}>
                  <Flex style={{ width: "100%" }} justify="center" align="center">
                    <label className={style.chartTitle}>🌱 Top 10 Highest-Yielding Plants</label>
                  </Flex>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={harvestData.slice(0, 10)} barSize={40}>
                      <XAxis dataKey="plant.plantName" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} kg`, "Yield"]} />
                      <Bar
                        dataKey="totalQuantity"
                        name="Yield"
                        fill="#4CAF50"
                        radius={[8, 8, 0, 0]}
                        style={{ cursor: "pointer" }}
                        onClick={(data: GetHarvestStatisticPlants) =>
                          handleClick(data.plant.plantId)
                        }
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className={style.chartContainer} style={{ flex: 1 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Tooltip />
                      <Legend />
                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {pieChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <Empty description="No data available" />
            )}
          </Flex>
        </Card>

        <Card
          title="📄 Yield Data Table"
          className={`${style.cardContainer} ${style.tableContainer}`}
        >
          <div className={style.tableWrapper}>
            <Table
              className={style.table}
              dataSource={harvestData}
              pagination={false}
              columns={[
                { title: "Code", dataIndex: ["plant", "plantCode"], key: "plantCode" },
                { title: "Name", dataIndex: ["plant", "plantName"], key: "plantName" },
                { title: "Total Yield (kg)", dataIndex: "totalQuantity", key: "totalQuantity" },
                {
                  title: "Cultivar",
                  dataIndex: ["plant", "masterTypeName"],
                  key: "masterTypeName",
                },
                {
                  title: "Health Status",
                  dataIndex: ["plant", "healthStatus"],
                  key: "healthStatus",
                  render: (healthStatus: string) => {
                    const statusText = healthStatus;
                    return (
                      <Tag color={healthStatusColors[statusText] || "default"}>
                        {statusText || "Unknown"}
                      </Tag>
                    );
                  },
                },
                {
                  title: "Growth Stage",
                  dataIndex: ["plant", "growthStageName"],
                  key: "growthStageName",
                },
                {
                  title: "Plant Location",
                  key: "plantIndex",
                  render: (item: GetHarvestStatisticPlants) =>
                    `${item.plant.landPlotName} - Row ${item.plant.rowIndex} - Plant #${item.plant.plantIndex}`,
                },
                {
                  title: "Action",
                  key: "action",
                  render: (_, record) => (
                    <Button type="dashed" onClick={() => handleClick(record.plant.plantId)}>
                      View Details
                    </Button>
                  ),
                },
              ]}
              rowKey={(record) => record.plant.plantCode}
            />
          </div>
        </Card>
      </Flex>
    </div>
  );
};

export default PlantYield;
