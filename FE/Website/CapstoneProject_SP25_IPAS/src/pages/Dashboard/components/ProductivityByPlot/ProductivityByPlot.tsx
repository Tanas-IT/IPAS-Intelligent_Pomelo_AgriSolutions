import React, { useState, useEffect, useMemo } from "react";
import { Table, Select, Tag, Space, Flex, Empty } from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { dashboardService } from "@/services";
import { ProductivityByPlotResponse } from "@/payloads/dashboard";
import { Loading } from "@/components";

const expandedTableStyles = `
  .expanded-table .ant-table-thead > tr > th {
    background: #fee69c !important;
    color: #20461e !important;
    font-weight: 600;
  }
  .expanded-table .ant-table-tbody > tr:nth-child(odd) {
    background: #ffffff !important;
  }
  .expanded-table .ant-table-tbody > tr:nth-child(even) {
    background: #f9fcff !important;
  }
  .expanded-table .ant-table-tbody > tr:hover > td {
    background: #d8f0e7 !important;
  }
`;

const tableStyles = `
  .table .ant-table-thead > tr > th {
    background: #bcd379 !important;
    color: #20461e !important;
    font-weight: 600;
  }
  .table .ant-table-tbody > tr:nth-child(odd) {
    background: #ffffff !important;
  }
  .table .ant-table-tbody > tr:nth-child(even) {
    background: #f9fcff !important;
  }
  .table .ant-table-tbody > tr:hover > td {
    background: #d8f0e7 !important;
  }
`;
const { Option } = Select;

const ProductivityByPlot: React.FC = () => {
  const [data, setData] = useState<ProductivityByPlotResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  const years = Array.from({ length: 6 }, (_, i) => 2020 + i);

  const fetchData = async (year: number) => {
    try {
      const productivityData = await dashboardService.getProductivityByPlot(year);
      setData(productivityData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching productivity by plot:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedYear);
  }, [selectedYear]);

  
  const chartData = data?.map((season) => {
    const seasonData: any = { harvestSeason: season.harvestSeason };
    season.landPlots.forEach((plot) => {
      seasonData[plot.landPlotName] = plot.quantity;
    });
    return seasonData;
  }) || [];

  const uniquePlots = useMemo(() => {
    if (!data) return [];
    return Array.from(
      new Set(data.flatMap((season) => season.landPlots.map((plot) => plot.landPlotName)))
    );
  }, [data]);

  const tableData = useMemo(() => {
    if (!data) return [];
    return data.map((season, index) => ({
      key: index,
      harvestSeason: season.harvestSeason,
      landPlots: season.landPlots,
    }));
  }, [data]);

  const columns = [
    {
      title: "Harvest Season",
      dataIndex: "harvestSeason",
      sorter: (a: any, b: any) => a.harvestSeason.localeCompare(b.harvestSeason),
    },
    {
      title: "Total Plot",
      render: (_: any, record: any) => record.landPlots.length,
      sorter: (a: any, b: any) => a.landPlots.length - b.landPlots.length,
    },
    {
      title: "Total Plants",
      render: (_: any, record: any) =>
        record.landPlots.reduce((sum: number, plot: any) => sum + plot.totalPlantOfLandPlot, 0),
      sorter: (a: any, b: any) =>
        a.landPlots.reduce((sum: number, plot: any) => sum + plot.totalPlantOfLandPlot, 0) -
        b.landPlots.reduce((sum: number, plot: any) => sum + plot.totalPlantOfLandPlot, 0),
    },
    {
      title: "Total Quantity (kg)",
      render: (_: any, record: any) =>
        record.landPlots.reduce((sum: number, plot: any) => sum + plot.quantity, 0),
      sorter: (a: any, b: any) =>
        a.landPlots.reduce((sum: number, plot: any) => sum + plot.quantity, 0) -
        b.landPlots.reduce((sum: number, plot: any) => sum + plot.quantity, 0),
    },
    {
      title: "Total Yield (kg/plant)",
      render: (_: any, record: any) => {
        const totalPlants = record.landPlots.reduce(
          (sum: number, plot: any) => sum + plot.totalPlantOfLandPlot,
          0
        );
        const totalQuantity = record.landPlots.reduce(
          (sum: number, plot: any) => sum + plot.quantity,
          0
        );
        return totalPlants > 0 ? (totalQuantity / totalPlants).toFixed(2) : 0;
      },
      sorter: (a: any, b: any) => {
        const aPlants = a.landPlots.reduce(
          (sum: number, plot: any) => sum + plot.totalPlantOfLandPlot,
          0
        );
        const aQuantity = a.landPlots.reduce(
          (sum: number, plot: any) => sum + plot.quantity,
          0
        );
        const bPlants = b.landPlots.reduce(
          (sum: number, plot: any) => sum + plot.totalPlantOfLandPlot,
          0
        );
        const bQuantity = b.landPlots.reduce(
          (sum: number, plot: any) => sum + plot.quantity,
          0
        );
        const aYield = aPlants > 0 ? aQuantity / aPlants : 0;
        const bYield = bPlants > 0 ? bQuantity / bPlants : 0;
        return aYield - bYield;
      },
    },
  ];

  const expandedRowRender = (record: any) => {
    const subColumns = [
      { title: "Land Plot", dataIndex: "landPlotName" },
      { title: "Total Plants", dataIndex: "totalPlantOfLandPlot" },
      { title: "Quantity (kg)", dataIndex: "quantity" },
      {
        title: "Yield per Plant (kg)",
        render: (_: any, plot: any) =>
          plot.totalPlantOfLandPlot > 0
            ? (plot.quantity / plot.totalPlantOfLandPlot).toFixed(2)
            : 0,
      },
      {
        title: "Status",
        dataIndex: "status",
        render: (status: string) => (
          <Tag color={status === "Active" ? "green" : "orange"}>{status}</Tag>
        ),
      },
    ];

    return (
      <>
        <style>{expandedTableStyles}</style>
        <Table
          className="expanded-table"
          columns={subColumns}
          dataSource={record.landPlots}
          pagination={false}
          size="small"
          components={{
            header: {
              cell: (props: any) => (
                <th {...props} style={{ background: "#e6f7ff", color: "#1d39c4" }} />
              ),
            },
          }}
        />
      </>
    );
  };

  if (loading) return <Loading />;

  return (
    <div style={{ padding: "10px" }}>
      <Space style={{ marginBottom: 16 }}>
        <Flex style={{justifyContent: 'center', alignItems: 'center', gap: '20px'}}>
        <h3 style={{color: "#20461e"}}>Productivity by Plot</h3>
        <span style={{ fontSize: "16px", color: "#666" }}>Select Year:</span>
        </Flex>
        <Select
          value={selectedYear}
          onChange={setSelectedYear}
          style={{ width: 120 }}
        >
          {years.map((year) => (
            <Option key={year} value={year}>
              {year}
            </Option>
          ))}
        </Select>
      </Space>
      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          padding: "20px",
          marginBottom: 20,
        }}
      >
        <h2 style={{ marginBottom: 20, alignSelf: 'center', justifyContent: 'center', display: 'flex', color: '#20461e' }}>Productivity Details</h2>
        <>
        <style>{tableStyles}</style>
        <Table
        className="table"
          columns={columns}
          dataSource={tableData}
          expandable={{ expandedRowRender }}
          bordered
          pagination={{ pageSize: 5 }}
        />
        </>
      </div>
      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          padding: "20px",
        }}
      >
        <h3 style={{ marginBottom: 20 }}>Productivity Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          {chartData.length > 0 ? (
            <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
            <XAxis dataKey="harvestSeason" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip
              contentStyle={{
                background: "#fff",
                borderRadius: "5px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              formatter={(value: number, name: string) => [`${value} kg`, name]}
            />
            <Legend />
            {uniquePlots.map((plot, index) => (
              <Bar
                key={plot}
                dataKey={plot}
                fill={["#1890ff", "#52c41a", "#fa8c16", "#722ed1", "#eb2f96"][index % 5]}
                radius={[5, 5, 0, 0]}
              />
            ))}
          </BarChart>
          ) : (
            <Flex justify="center" align="center" style={{ width: "100%" }}>
                    <Empty description="No data available" />
                </Flex>
          )}
          
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProductivityByPlot;