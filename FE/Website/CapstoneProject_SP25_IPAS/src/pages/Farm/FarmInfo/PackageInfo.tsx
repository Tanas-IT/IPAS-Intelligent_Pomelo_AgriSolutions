import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Table, Tag, Modal, Typography, Progress, Space, Divider, Flex } from "antd";
import { PlusOutlined, DollarOutlined, CalendarOutlined, WarningOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import AOS from "aos";
import "aos/dist/aos.css";
import style from "./FarmInfo.module.scss";
import { orderService } from "@/services";
import { GetOrder } from "@/payloads/order/responses/GetOrder";
import { Icons } from "@/assets";
import { GetFarmInfo } from "@/payloads";
import { PATHS } from "@/routes";

interface Package {
  packageId: number;
  packageCode: string;
  packageName: string;
  packagePrice: number;
  duration: number;
  isActive: boolean;
  createDate: string;
  updateDate: string | null;
  status: string;
}

interface Order {
  orderId: number;
  orderCode: string;
  orderName: string;
  totalPrice: number;
  notes: string | null;
  status: string;
  orderDate: string;
  enrolledDate: string | null;
  expiredDate: string | null;
  packageId: number;
  farmId: number;
  package: Package;
}

interface PackageInfoProps {
  farm: GetFarmInfo;
}

const PackageInfo: React.FC<PackageInfoProps> = ({ farm }) => {
  const [orders, setOrders] = useState<GetOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getOrder();
      setOrders(response.data);
      // setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyPackage = () => {
    navigate(PATHS.PACKAGE.PACKAGE_PURCHASE);
  };

  const columns: ColumnsType<GetOrder> = [
    {
      title: "Order Code",
      dataIndex: "orderCode",
      key: "orderCode",
      render: (text) => <span className={style.bold}>{text}</span>,
    },
    {
      title: "Package Name",
      dataIndex: ["package", "packageName"],
      key: "packageName",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Price (VND)",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (price) => price.toLocaleString("vi-VN"),
    },
    {
      title: "Purchase Date",
      dataIndex: "orderDate",
      key: "orderDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Enrolled Date",
      dataIndex: "enrolledDate",
      key: "enrolledDate",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "Chưa kích hoạt"),
    },
    {
      title: "Expired Date",
      dataIndex: "expiredDate",
      key: "expiredDate",
      render: (date) =>
        date ? (
          <Space>
            {dayjs(date).format("DD/MM/YYYY")}
            {dayjs(date).isBefore(dayjs()) && <WarningOutlined style={{ color: "red" }} />}
          </Space>
        ) : (
          "Unknown"
        ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>,
    },
  ];

  return (
    <div className={style.packageContainer} data-aos="fade-up">
      <Typography.Title level={2} className={style.title}>
        Package Information of Farm
      </Typography.Title>
      <Divider />

      <Flex className={style.summaryCard} data-aos="zoom-in">
        <Space direction="vertical" size="middle">
          <Typography.Text>
            <DollarOutlined /> Total Price for Orders in Farm:{" "}
            <strong className={style.totalPrice}>
              {orders.reduce((sum, o) => sum + o.totalPrice, 0).toLocaleString("vi-VN")} VND
            </strong>
          </Typography.Text>
          <Typography.Text>
            <CalendarOutlined /> Expired Date:{" "}
            <strong className={style.expiredDate}>
              {dayjs(farm.farmExpiredDate).format("DD/MM/YYYY HH:mm")}
            </strong>
          </Typography.Text>
          <Typography.Text>
            Total number of Package: <strong>{orders.length}</strong>
          </Typography.Text>
        </Space>
        <Button icon={<Icons.plus />} className={style.buyButton} onClick={handleBuyPackage}>
          Buy New Package
        </Button>
      </Flex>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="orderId"
        loading={loading}
        pagination={{ pageSize: 5 }}
        className={style.table}
        data-aos="fade-up"
        data-aos-delay="200"
      />
    </div>
  );
};

export default PackageInfo;
