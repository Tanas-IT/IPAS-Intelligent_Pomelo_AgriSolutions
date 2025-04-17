import { Icons } from "@/assets";
import { AdminDashboardResponses } from "@/payloads/dashboard";
import { Card, Col, Flex, Row, Table, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import style from "./AdminDashboard.module.scss";
import StatBox from "@/pages/Dashboard/components/StatBox/StatBox";
import { ChartOptions } from "chart.js";
import { formatCurrencyVND, formatDate, formatDateAndTime } from "@/utils";
import { BarChart, LineChart, Loading, UserAvatar } from "@/components";
import dayjs from "dayjs";
import { dashboardService } from "@/services";
import { GetPaymentHistory, GetUser2 } from "@/payloads";
import { paymentStatusColors } from "@/constants";
const { Title } = Typography;

function AdminDashboard() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<AdminDashboardResponses>();
  const currentYear = dayjs();
  const [yearRevenue, setYearRevenue] = useState<dayjs.Dayjs>(currentYear);
  const [yearFarms, setYearFarms] = useState<dayjs.Dayjs>(currentYear);

  const fetchAdminDashboard = async () => {
    if (isLoading) await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const res = await dashboardService.getAdminDashboardData(
        yearRevenue.year(),
        yearFarms.year(),
      );
      setData(res);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboard();
  }, [yearRevenue, yearFarms]);

  const statsData = [
    {
      title: "Users",
      subtitle: data?.totalUser?.toString() || "0",
      icon: <Icons.users style={{ fontSize: 24, color: "#52c41a" }} />,
    },
    {
      title: "Revenue",
      subtitle: data ? formatCurrencyVND(data?.totalRevenue) : formatCurrencyVND(0),
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
        data: data?.statisticRevenueYear.revenueMonths
          .sort((a, b) => a.month - b.month)
          .map((rev) => rev.totalRevenue),
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
        data: data?.statisticFarmYear.revenueMonths
          .sort((a, b) => a.month - b.month)
          .map((farm) => farm.totalRevenue),
        backgroundColor: "rgba(34, 139, 34, 0.6)",
        borderColor: "rgba(34, 139, 34, 1)",
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
      key: "user",
      render: (_: any, record: GetUser2) => (
        <Flex gap={20}>
          <UserAvatar avatarURL={record?.avatarURL ?? ""} />
          <div>
            <p>
              {record?.email} - {formatDate(record?.createDate)}
            </p>
            <p>{record?.fullName}</p>
          </div>
        </Flex>
      ),
    },
  ];

  const transactionColumns = [
    {
      title: "Farm",
      key: "farm",
      render: (_: any, record: GetPaymentHistory) => (
        <p
          style={{
            maxWidth: "250px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "inline-block",
          }}
        >
          Payment from {record.farmName}
        </p>
      ),
    },
    {
      title: "Date & Time",
      key: "orderDate",
      dataIndex: "orderDate",
      render: (text: string) => formatDateAndTime(text),
    },
    {
      title: "Total Amount",
      key: "totalPrice",
      dataIndex: "totalPrice",
      render: (amount: number) => formatCurrencyVND(amount),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusText = status;
        return (
          <Tag color={paymentStatusColors[statusText] || "default"}>{statusText || "Unknown"}</Tag>
        );
      },
    },
  ];

  if (isLoading) return <Loading />;
  return (
    <>
      <Flex className={style.container}>
        <Flex className={style.statBoxContainer}>
          {statsData.map((stat) => (
            <StatBox
              title={stat.title}
              subtitle={stat.subtitle}
              icon={stat.icon}
              // increase={stat.increase}
            />
          ))}
        </Flex>
        <Row gutter={[16, 16]} className={style.chartRow}>
          <Col xs={24} md={12}>
            <LineChart
              title="Revenue by Month"
              year={yearRevenue}
              onYearChange={(newYear) => setYearRevenue(newYear)}
              data={lineChartData}
              options={lineChartOptions}
            />
          </Col>
          <Col xs={24} md={12}>
            <BarChart
              title="Farms by Month"
              year={yearFarms}
              onYearChange={(newYear) => setYearFarms(newYear)}
              data={barChartData}
              options={barChartProductOptions}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]} className={style.chartRow}>
          <Col xs={24} md={8}>
            <Card>
              <Title level={5}>New Users</Title>
              <div className={style.tableCard}>
                <Table
                  columns={userColumns}
                  dataSource={data?.newestUserModels}
                  pagination={false}
                  rowKey="userId"
                />
              </div>
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Card>
              <Title level={5}>Transaction History</Title>
              <div className={style.tableCard}>
                <Table
                  columns={transactionColumns}
                  dataSource={data?.newestOrdersModels}
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
