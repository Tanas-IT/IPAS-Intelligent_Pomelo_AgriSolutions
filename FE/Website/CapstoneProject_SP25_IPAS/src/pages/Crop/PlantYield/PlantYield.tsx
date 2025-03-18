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
import { healthStatusColors, MASTER_TYPE } from "@/constants";
import dayjs from "dayjs";
import { harvestService } from "@/services";
import { GetHarvestStatisticPlants } from "@/payloads";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const seasonOptions = ["Spring", "Summer", "Autumn", "Winter", "Rainy", "Dry"];

// Dữ liệu giả lập
// const fakeData = [
//   {
//     id: 1,
//     name: "Tree A",
//     yield: 50,
//     productType: "Type 1",
//     healthStatus: "Good",
//     plantingDate: "2023-05-10",
//     growthStageName: "Mature",
//     landPlotName: "Plot 1",
//     rowIndex: 1,
//     isDead: false,
//   },
//   {
//     id: 2,
//     name: "Tree B",
//     yield: 30,
//     productType: "Type 1",
//     healthStatus: "Average",
//     plantingDate: "2023-06-15",
//     growthStageName: "Young",
//     landPlotName: "Plot 1",
//     rowIndex: 2,
//     isDead: false,
//   },
//   {
//     id: 3,
//     name: "Tree C",
//     yield: 70,
//     productType: "Type 1",
//     healthStatus: "Good",
//     plantingDate: "2022-12-20",
//     growthStageName: "Mature",
//     landPlotName: "Plot 2",
//     rowIndex: 1,
//     isDead: false,
//   },
//   {
//     id: 4,
//     name: "Tree D",
//     yield: 90,
//     productType: "Type 1",
//     healthStatus: "Poor",
//     plantingDate: "2024-01-05",
//     growthStageName: "Seedling",
//     landPlotName: "Plot 2",
//     rowIndex: 2,
//     isDead: false,
//   },
//   {
//     id: 5,
//     name: "Tree E",
//     yield: 20,
//     productType: "Type 1",
//     healthStatus: "Good",
//     plantingDate: "2023-08-30",
//     growthStageName: "Young",
//     landPlotName: "Plot 3",
//     rowIndex: 3,
//     isDead: false,
//   },
//   {
//     id: 6,
//     name: "Tree F",
//     yield: 80,
//     productType: "Type 3",
//     healthStatus: "Excellent",
//     plantingDate: "2022-10-12",
//     growthStageName: "Mature",
//     landPlotName: "Plot 3",
//     rowIndex: 1,
//     isDead: false,
//   },
//   {
//     id: 7,
//     name: "Tree G",
//     yield: 40,
//     productType: "Type 1",
//     healthStatus: "Average",
//     plantingDate: "2023-09-05",
//     growthStageName: "Young",
//     landPlotName: "Plot 4",
//     rowIndex: 2,
//     isDead: false,
//   },
//   {
//     id: 8,
//     name: "Tree H",
//     yield: 60,
//     productType: "Type 2",
//     healthStatus: "Good",
//     plantingDate: "2023-07-25",
//     growthStageName: "Mature",
//     landPlotName: "Plot 4",
//     rowIndex: 3,
//     isDead: false,
//   },
//   {
//     id: 9,
//     name: "Tree I",
//     yield: 100,
//     productType: "Type 3",
//     healthStatus: "Excellent",
//     plantingDate: "2022-11-11",
//     growthStageName: "Mature",
//     landPlotName: "Plot 5",
//     rowIndex: 1,
//     isDead: false,
//   },
//   {
//     id: 10,
//     name: "Tree J",
//     yield: 110,
//     productType: "Type 1",
//     healthStatus: "Good",
//     plantingDate: "2023-04-20",
//     growthStageName: "Mature",
//     landPlotName: "Plot 5",
//     rowIndex: 2,
//     isDead: false,
//   },
// ];

const COLORS = ["#4CAF50", "#FFC107", "#FF5733"]; // Xanh lá, vàng, đỏ

const PlantYield = () => {
  const { options: productOptions } = useMasterTypeOptions(MASTER_TYPE.PRODUCT);
  const [yearRange, setYearRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [topX, setTopX] = useState<number>(10);
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
    console.log(res.data);

    setHarvestData(res.data);
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

  return (
    <div className={style.container}>
      {/* Header */}
      <Title level={3} className={style.title}>
        🌿 Plant Yield Dashboard
      </Title>
      <Divider />

      {/* Bộ lọc */}
      <Flex className={style.filterContainer}>
        <RangePicker picker="year" value={yearRange} onChange={handleYearChange} allowClear />

        <Select
          className={style.select}
          placeholder="Top X"
          onChange={(value) => setTopX(Number(value))}
          value={topX}
          allowClear
        >
          <Select.Option value={5}>Top 5</Select.Option>
          <Select.Option value={10}>Top 10</Select.Option>
        </Select>

        <Select
          className={style.select}
          placeholder="Product Type"
          onChange={setProductType}
          value={productType}
          options={productOptions}
          allowClear
        ></Select>
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
                  <ResponsiveContainer>
                    <BarChart data={harvestData} barSize={40}>
                      <XAxis dataKey="plant.plantName" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="totalQuantity"
                        name="Yield"
                        fill="#4CAF50"
                        radius={[8, 8, 0, 0]}
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
                    <Button type="dashed" onClick={() => {}}>
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
