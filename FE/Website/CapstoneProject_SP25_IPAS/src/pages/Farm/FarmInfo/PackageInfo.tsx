import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Table, Tag, Modal, Typography, Progress, Space, Divider, Flex } from 'antd';
import { PlusOutlined, DollarOutlined, CalendarOutlined, WarningOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import axios from 'axios';
import { css } from 'antd-style';
import AOS from 'aos';
import 'aos/dist/aos.css';
import style from "./FarmInfo.module.scss";
import { orderService } from '@/services';
import { GetOrder } from '@/payloads/order/responses/GetOrder';
import { Icons } from '@/assets';
import { GetFarmInfo } from '@/payloads';
import { PATHS } from '@/routes';

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

// Dữ liệu mẫu tạm thời (sẽ thay bằng API)
const mockOrders: Order[] = [
  {
    orderId: 1,
    orderCode: 'ORD001',
    orderName: 'Gói Cơ Bản',
    totalPrice: 500000,
    notes: 'Gói dùng thử cho farm nhỏ',
    status: 'Active',
    orderDate: '2025-03-01T10:00:00',
    enrolledDate: '2025-03-02T00:00:00',
    expiredDate: '2025-06-01T23:59:59',
    packageId: 1,
    farmId: 1,
    package: {
      packageId: 1,
      packageCode: 'PKG001',
      packageName: 'Gói Cơ Bản',
      packagePrice: 500000,
      duration: 90,
      isActive: true,
      createDate: '2025-02-01T00:00:00',
      updateDate: null,
      status: 'Available',
    },
  },
  {
    orderId: 2,
    orderCode: 'ORD002',
    orderName: 'Gói Nâng Cao',
    totalPrice: 1200000,
    notes: 'Gói nâng cao với nhiều tính năng',
    status: 'Active',
    orderDate: '2025-03-15T14:00:00',
    enrolledDate: '2025-03-16T00:00:00',
    expiredDate: '2025-09-15T23:59:59',
    packageId: 2,
    farmId: 1,
    package: {
      packageId: 2,
      packageCode: 'PKG002',
      packageName: 'Gói Nâng Cao',
      packagePrice: 1200000,
      duration: 180,
      isActive: true,
      createDate: '2025-02-01T00:00:00',
      updateDate: null,
      status: 'Available',
    },
  },
];

interface PackageInfoProps {
  farm: GetFarmInfo;
}

const PackageInfo: React.FC<PackageInfoProps> = ({ farm }) => {
  const [orders, setOrders] = useState<GetOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  // Khởi tạo AOS cho animation
  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchOrders();
  }, []);

  // Gọi API để lấy danh sách đơn hàng của farm
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getOrder();
      console.log('response', response);
      
      setOrders(response.data);
    // setOrders(mockOrders);
    } catch (error) {
      toast.warning('Không thể tải danh sách gói dịch vụ');
      console.error(error);
      // setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };
  console.log('o', orders);
  

  // Xử lý mua gói mới
  const handleBuyPackage = () => {
    navigate(PATHS.PACKAGE.PACKAGE_PURCHASE);
  };

  // Đóng modal
  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  // Tính % thời gian còn lại
  const calculateRemainingTime = (expiredDate: string | null) => {
    if (!expiredDate) return 0;
    const now = dayjs();
    const expiry = dayjs(expiredDate);
    const totalDays = expiry.diff(now, 'day');
    const packageDuration = orders.find(o => o.expiredDate === expiredDate)?.package.duration || 90;
    return Math.max(0, Math.round((totalDays / packageDuration) * 100));
  };

  // Columns cho bảng
  const columns: ColumnsType<GetOrder> = [
    {
      title: 'Order Code',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (text) => <span className={style.bold}>{text}</span>,
    },
    {
      title: 'Package Name',
      dataIndex: ['package', 'packageName'],
      key: 'packageName',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Price (VND)',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => price.toLocaleString('vi-VN'),
    },
    {
      title: 'Purchase Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Enrolled Date',
      dataIndex: 'enrolledDate',
      key: 'enrolledDate',
      render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : 'Chưa kích hoạt'),
    },
    {
      title: 'Expired Date',
      dataIndex: 'expiredDate',
      key: 'expiredDate',
      render: (date) =>
        date ? (
          <Space>
            {dayjs(date).format('DD/MM/YYYY')}
            {dayjs(date).isBefore(dayjs()) && <WarningOutlined style={{ color: 'red' }} />}
          </Space>
        ) : (
          'Unknown'
        ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
  ];
  console.log('dd', farm);
  

  return (
    <div className={style.packageContainer} data-aos="fade-up">
      <Typography.Title level={2} className={style.title}>
        Package Information of Farm
      </Typography.Title>
      <Divider />

      {/* Card Tổng quan */}
      <Flex className={style.summaryCard} data-aos="zoom-in">
        <Space direction="vertical" size="middle">
          <Typography.Text>
            <DollarOutlined /> Total Price for Orders in Farm: <strong className={style.totalPrice}>{orders.reduce((sum, o) => sum + o.totalPrice, 0).toLocaleString('vi-VN')} VND</strong>
          </Typography.Text>
          <Typography.Text>
            <CalendarOutlined /> Expired Date: <strong className={style.expiredDate}>{dayjs(farm.farmExpiredDate).format('DD/MM/YYYY HH:mm')}</strong>
          </Typography.Text>
          <Typography.Text>
            Total number of Package: <strong>{orders.length}</strong>
          </Typography.Text>
        </Space>
        <Button
          icon={<Icons.plus />}
          className={style.buyButton}
          onClick={handleBuyPackage}
        >
          Buy New Package
        </Button>
      </Flex>

      {/* Bảng danh sách gói */}
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

      {/* Modal mua gói */}
      <Modal
        title="Chọn gói dịch vụ mới"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="cancel" onClick={handleModalClose}>
            Hủy
          </Button>,
          <Button key="buy" type="primary" onClick={() => toast.success('Mua gói thành công!')}>
            Xác nhận mua
          </Button>,
        ]}
      >
        <Typography.Text>Chọn gói dịch vụ bạn muốn mua (sẽ cộng dồn ngày):</Typography.Text>
        {/* TODO: Thêm danh sách gói từ API */}
        <ul>
          <li>Gói Cơ Bản - 500,000 VND (90 ngày)</li>
          <li>Gói Nâng Cao - 1,200,000 VND (180 ngày)</li>
        </ul>
      </Modal>
    </div>
  );
};


export default PackageInfo;