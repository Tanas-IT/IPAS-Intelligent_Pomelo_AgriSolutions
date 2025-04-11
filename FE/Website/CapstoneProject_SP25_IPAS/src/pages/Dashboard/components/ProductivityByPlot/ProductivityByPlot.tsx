import React from "react";
import { Table, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { DashboardResponses } from "@/payloads/dashboard";

interface ProductivityByPlotProps {
  data: DashboardResponses["productivityByPlots"];
}

interface PlotData {
  landPlotId: number;
  landPlotName: string;
  quantity: number;
  status: string;
}

// Hàm xử lý dữ liệu để lấy 3 plot tiêu biểu
const processPlotData = (data: DashboardResponses["productivityByPlots"]): PlotData[] => {
  // Lấy danh sách tất cả landPlots từ các harvestSeason
  const allPlots = data.flatMap((season) => season.landPlots);

  // Sắp xếp theo quantity giảm dần và lấy 3 plot đầu
  const topPlots = allPlots
    .sort((a, b) => b.quantity - a.quantity) // Sắp xếp theo productivity giảm dần
    .slice(0, 3); // Lấy 3 plot tiêu biểu

  return topPlots.map((plot) => ({
    landPlotId: plot.landPlotId,
    landPlotName: plot.landPlotName,
    quantity: plot.quantity,
    status: plot.status,
  }));
};

const ProductivityByPlot: React.FC<ProductivityByPlotProps> = ({ data }) => {
  // Định nghĩa cột cho table
  const columns: ColumnsType<PlotData> = [
    {
      title: "Plot Id",
      dataIndex: "landPlotId",
      key: "landPlotId",
      align: "center",
    },
    {
      title: "Plot Name",
      dataIndex: "landPlotName",
      key: "landPlotName",
      align: "center",
    },
    {
      title: "Productivity (kg)",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      sorter: (a, b) => a.quantity - b.quantity, // Cho phép sắp xếp
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
  ];

  // Xử lý dữ liệu
  const tableData = processPlotData(data);

  return (
    <Table
      columns={columns}
      dataSource={tableData}
      rowKey="landPlotId"
      pagination={false} // Không cần phân trang vì chỉ lấy 3 dòng
      bordered
    />
  );
};

export default ProductivityByPlot;