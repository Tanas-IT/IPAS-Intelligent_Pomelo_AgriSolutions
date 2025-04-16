import { Icons } from "@/assets";
import { AdminDashboardResponses } from "@/payloads/dashboard";
import { Badge, Card, Col, Flex, Row, Segmented, Table, Typography } from "antd";
import { useState } from "react";
import style from "./AdminDashboard.module.scss";
import StatBox from "@/pages/Dashboard/components/StatBox/StatBox";
import WeatherCard from "@/pages/Dashboard/components/WeatherCard/WeatherCard";
import LineChart from "@/components/UI/Dashboard/LineChart/LineChart";
import BarChart from "@/components/UI/Dashboard/BarChart/BarChart";
import { ChartOptions } from "chart.js";
import { themeColors } from "@/styles";
import { formatCurrencyVND, formatDate, formatDateAndTime } from "@/utils";
const { Title } = Typography;

const weatherData = {
  currentTemp: 29.04,
  tempMax: 29.04,
  tempMin: 29.04,
  status: "Clouds",
  description: "broken clouds",
  humidity: 51,
  visibility: 10000,
  windSpeed: "2.02 m/s",
  clouds: 55,
};

export const adminDashboardMockData: AdminDashboardResponses & {
  listRevenue: { month: number; totalRevenue: number }[];
  listFarmCounts: { month: number; totalFarms: number }[];
} = {
  totalUser: 120,
  totalRevenue: 350000000,
  totalFarm: 18,
  weatherPropertyModel: {
    currentTemp: 30,
    tempMax: 32,
    tempMin: 27,
    status: "Sunny",
    description: "clear sky",
    humidity: 45,
    visibility: 10000,
    windSpeed: "3.2 m/s",
    clouds: 10,
  },
  listRevenue: [
    { month: 1, totalRevenue: 10000000 },
    { month: 2, totalRevenue: 12000000 },
    { month: 3, totalRevenue: 18000000 },
    { month: 4, totalRevenue: 22000000 },
    { month: 5, totalRevenue: 25000000 },
    { month: 6, totalRevenue: 28000000 },
    { month: 7, totalRevenue: 32000000 },
    { month: 8, totalRevenue: 34000000 },
    { month: 9, totalRevenue: 36000000 },
    { month: 10, totalRevenue: 40000000 },
    { month: 11, totalRevenue: 42000000 },
    { month: 12, totalRevenue: 45000000 },
  ],
  listFarmCounts: [
    { month: 1, totalFarms: 2 },
    { month: 2, totalFarms: 2 },
    { month: 3, totalFarms: 3 },
    { month: 4, totalFarms: 4 },
    { month: 5, totalFarms: 4 },
    { month: 6, totalFarms: 5 },
    { month: 7, totalFarms: 6 },
    { month: 8, totalFarms: 6 },
    { month: 9, totalFarms: 7 },
    { month: 10, totalFarms: 8 },
    { month: 11, totalFarms: 9 },
    { month: 12, totalFarms: 10 },
  ],
  latestUsers: [
    {
      fullname: "Alice Johnson",
      userName: "alicej",
      createDate: "2025-04-15T10:45:00",
    },
    {
      fullname: "Bob Smith",
      userName: "bobsmith",
      createDate: "2025-04-14T14:20:00",
    },
    {
      fullname: "Charlie Nguyen",
      userName: "charlien",
      createDate: "2025-04-13T09:10:00",
    },
  ],
  recentTransactions: [
    {
      email: "alicej@example.com",
      paymentDate: "2025-04-15T11:00:00",
      amount: 1500000,
      status: "Succeed",
    },
    {
      email: "bobsmith@example.com",
      paymentDate: "2025-04-14T15:00:00",
      amount: 950000,
      status: "Pending",
    },
    {
      email: "charlien@example.com",
      paymentDate: "2025-04-13T10:00:00",
      amount: 500000,
      status: "Failed",
    },
  ],
};

function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardResponses>(adminDashboardMockData);
  const statsData = [
    {
      title: "Users",
      subtitle: data?.totalUser?.toString() || "0",
      icon: <Icons.users style={{ fontSize: 24, color: "#52c41a" }} />,
    },
    {
      title: "Revenue",
      subtitle: formatCurrencyVND(data?.totalRevenue) || "0",
      icon: <Icons.money style={{ fontSize: 24, color: "#faad14" }} />,
    },
    {
      title: "Farms",
      subtitle: data?.totalFarm?.toString() || "0",
      icon: <Icons.farms style={{ fontSize: 24, color: "#1890ff" }} />,
    },
  ];

  const lineChartData = {
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    datasets: [
      {
        label: "Revenue",
        data: data?.listRevenue.sort((a, b) => a.month - b.month).map((rev) => rev.totalRevenue),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  const lineChartOptions: ChartOptions<"line"> = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: number | string) {
            return value.toLocaleString("vi-VN");
          },
        },
      },
    },
    plugins: {
      legend: {
        display: true,
      },
    },
  };

  const barChartData = {
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
    datasets: [
      {
        label: "Farms",
        data: data?.listFarmCounts
          .sort((a, b) => a.month - b.month)
          .map((brand) => brand.totalFarms),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
      },
    ],
  };

  const barChartProductOptions = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    datasets: {
      bar: {
        minBarLength: 5,
      },
    },
  };

  const userColumns = [
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      render: (text: string, record: any) => (
        <div>
          <div
            style={{
              backgroundColor: "#55AD9B",
              color: "white",
              borderRadius: "50%",
              display: "inline-block",
              padding: "8px",
            }}
          >
            {record.fullname.charAt(0)}
          </div>
          <div>
            <p>
              {record.fullname} - {formatDate(record.createDate)}
            </p>
            <p>{record.userName}</p>
          </div>
        </div>
      ),
    },
  ];

  const transactionColumns = [
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      render: (text: string, record: any) => (
        <Badge
          color="blue"
          style={{ maxWidth: "250px", whiteSpace: "normal", textOverflow: "clip" }}
        >
          Payment from {record.email}
        </Badge>
      ),
    },
    {
      title: "Date & Time",
      dataIndex: "paymentDate",
      key: "paymentDate",
      render: (text: string) => formatDateAndTime(text),
    },
    {
      title: "Total Amount",
      dataIndex: "amount",
      key: "amount",
      render: (text: number) => formatCurrencyVND(text),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      //     render: (status: PaymentStatus) => {
      //       switch (status) {
      //         case PaymentStatus.Succeed:
      //           return <Badge color="green">Success</Badge>;
      //         case PaymentStatus.Failed:
      //           return <Badge color="red">Failed</Badge>;
      //         case PaymentStatus.Pending:
      //           return <Badge color="yellow">Pending</Badge>;
      //         case PaymentStatus.Cancelled:
      //           return <Badge color="red">Cancelled</Badge>;
      //         default:
      //           return <Badge color="red">Error</Badge>;
      //       }
      //     },
    },
  ];

  return (
    <>
      <Flex className={style.container}>
        <Flex className={style.statBoxContainer}>
          {statsData.map((stat, index) => (
            <Flex key={index} style={{ flex: 2 }}>
              <StatBox
                title={stat.title}
                subtitle={stat.subtitle}
                icon={stat.icon}
                // increase={stat.increase}
              />
            </Flex>
          ))}
          <Flex style={{ flex: 2 }}>
            <WeatherCard weather={data?.weatherPropertyModel || weatherData} />
          </Flex>
        </Flex>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={12}>
            <LineChart title="Revenue by Month" data={lineChartData} options={lineChartOptions} />
          </Col>
          <Col xs={24} md={12}>
            <BarChart title="Farms by Month" data={barChartData} options={barChartProductOptions} />
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col xs={24} md={8}>
            <Card>
              <Title level={5}>New Users</Title>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                <Table
                  columns={userColumns}
                  dataSource={data.latestUsers}
                  pagination={false}
                  rowKey="userName"
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Card>
              <Title level={5}>Transaction History</Title>
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                <Table
                  columns={transactionColumns}
                  dataSource={data.recentTransactions}
                  pagination={false}
                  rowKey="paymentDate"
                />
              </div>
            </Card>
          </Col>
        </Row>
      </Flex>
    </>
  );
}

export default AdminDashboard;
