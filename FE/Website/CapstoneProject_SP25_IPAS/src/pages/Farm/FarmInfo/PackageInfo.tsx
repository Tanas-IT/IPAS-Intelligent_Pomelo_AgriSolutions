import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, Table, Tag, Modal, Typography, Progress, Space, Divider } from 'antd';
import { PlusOutlined, DollarOutlined, CalendarOutlined, WarningOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import axios from 'axios';
import { css } from 'antd-style';
import AOS from 'aos';
import 'aos/dist/aos.css';
import style from "./FarmInfo.module.scss";

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

const PackageInfo: React.FC = () => {
  const { farmId } = useParams<{ farmId: string }>(); // Lấy farmId từ URL
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Khởi tạo AOS cho animation
  useEffect(() => {
    AOS.init({ duration: 1000 });
    fetchOrders();
  }, []);

  // Gọi API để lấy danh sách đơn hàng của farm
  const fetchOrders = async () => {
    setLoading(true);
    try {
    //   const response = await axios.get(`/api/farms/${farmId}/orders`);
    //   setOrders(response.data);
    setOrders(mockOrders);
    } catch (error) {
      toast.error('Không thể tải danh sách gói dịch vụ');
      console.error(error);
      setOrders(mockOrders); // Fallback dữ liệu mẫu nếu API lỗi
    } finally {
      setLoading(false);
    }
  };
  console.log('o', orders);
  

  // Xử lý mua gói mới
  const handleBuyPackage = () => {
    setIsModalVisible(true);
    // TODO: Gọi API hiển thị danh sách gói để chọn
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
  const columns: ColumnsType<Order> = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (text) => <span className={style.bold}>{text}</span>,
    },
    {
      title: 'Tên gói',
      dataIndex: ['package', 'packageName'],
      key: 'packageName',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Giá (VND)',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => price.toLocaleString('vi-VN'),
    },
    {
      title: 'Ngày mua',
      dataIndex: 'orderDate',
      key: 'orderDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Ngày kích hoạt',
      dataIndex: 'enrolledDate',
      key: 'enrolledDate',
      render: (date) => (date ? dayjs(date).format('DD/MM/YYYY') : 'Chưa kích hoạt'),
    },
    {
      title: 'Ngày hết hạn',
      dataIndex: 'expiredDate',
      key: 'expiredDate',
      render: (date) =>
        date ? (
          <Space>
            {dayjs(date).format('DD/MM/YYYY')}
            {dayjs(date).isBefore(dayjs()) && <WarningOutlined style={{ color: 'red' }} />}
          </Space>
        ) : (
          'Không xác định'
        ),
    },
    {
      title: 'Thời gian còn lại',
      key: 'remainingTime',
      render: (_, record) => (
        <Progress
          percent={calculateRemainingTime(record.expiredDate)}
          size="small"
          status={record.expiredDate && dayjs(record.expiredDate).isBefore(dayjs()) ? 'exception' : 'active'}
        />
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Active' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
  ];

  return (
    <div className={style.packageContainer} data-aos="fade-up">
      <Typography.Title level={2} className={style.title}>
        Thông tin gói dịch vụ của Farm #{farmId}
      </Typography.Title>
      <Divider />

      {/* Card Tổng quan */}
      <Card className={style.summaryCard} data-aos="zoom-in">
        <Space direction="vertical" size="middle">
          <Typography.Text>
            <DollarOutlined /> Tổng số tiền đã chi: <strong>{orders.reduce((sum, o) => sum + o.totalPrice, 0).toLocaleString('vi-VN')} VND</strong>
          </Typography.Text>
          <Typography.Text>
            <CalendarOutlined /> Gói gần hết hạn nhất: <strong>{orders.length > 0 ? dayjs(orders[0].expiredDate).format('DD/MM/YYYY') : 'N/A'}</strong>
          </Typography.Text>
          <Typography.Text>
            Tổng số gói đã mua: <strong>{orders.length}</strong>
          </Typography.Text>
        </Space>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className={style.buyButton}
          onClick={handleBuyPackage}
        >
          Mua thêm gói
        </Button>
      </Card>

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