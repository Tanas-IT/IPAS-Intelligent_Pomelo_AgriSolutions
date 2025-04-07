import React, { useState, useEffect } from 'react';
import { Card, Flex, Row, Col, Table, Input, Select, Button, Space } from 'antd';
import style from './ReportManagement.module.scss';
import { expertService } from '@/services';
import { AnswerReportRequest, GetReportResponse } from '@/payloads';
import ReplyModal from '../components/ReplyModal/ReplyModal';

const { Search } = Input;
const { Option } = Select;

const ReportManagementScreen: React.FC = () => {
  const [reports, setReports] = useState<GetReportResponse[]>([]);
  const [selectedReport, setSelectedReport] = useState<GetReportResponse | null>(null);
  const [totalReports, setTotalReports] = useState<number>(0);
  const [totalUnanswered, setTotalUnanswered] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Filter states
  const [search, setSearch] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('reportID');
  const [direction, setDirection] = useState<string>('asc');
  const [isTrainned, setIsTrainned] = useState<boolean | undefined>(undefined);
  const [isUnanswered, setIsUnanswered] = useState<boolean | undefined>(undefined);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10); // Mặc định 10 report mỗi trang

  const fetchReports = async () => {
    setLoading(true);
    const response = await expertService.getAllReports(
      search,
      sortBy,
      direction,
      isTrainned,
      isUnanswered
    );
    if (response.statusCode === 200) {
      setReports(response.data.list);
      setTotalReports(response.data.totalRecord);
      setTotalUnanswered(
        response.data.list.filter(r => !r.answerFromExpert).length // Tính thủ công nếu BE không trả
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [search, sortBy, direction, isTrainned, isUnanswered]);

  const handleReply = (report: GetReportResponse) => {
    setSelectedReport(report);
  };

  const handleSubmitReply = async (data: AnswerReportRequest) => {
    const response = await expertService.answerReport(data);
    if (response.statusCode === 200) {
      fetchReports(); // Refresh dữ liệu
      setSelectedReport(null);
    }
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    setCurrentPage(pagination.current);
    if (sorter.field && sorter.order) {
      setSortBy(sorter.field);
      setDirection(sorter.order === 'ascend' ? 'asc' : 'desc');
    }
  };

  const columns = [
    {
      title: 'Report Code',
      dataIndex: 'reportCode',
      key: 'reportCode',
      sorter: true,
    },
    {
      title: 'Question',
      dataIndex: 'questionOfUser',
      key: 'questionOfUser',
    },
    {
      title: 'From',
      dataIndex: 'questionerName',
      key: 'questionerName',
      sorter: true,
    },
    {
      title: 'Status',
      key: 'answerFromExpert',
      render: (_: any, record: GetReportResponse) => (record.answerFromExpert ? 'Answered' : 'Pending'),
    },
    {
      title: 'Trained',
      dataIndex: 'isTrainned',
      key: 'isTrainned',
      render: (isTrainned: boolean) => (isTrainned ? 'Yes' : 'No'),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: GetReportResponse) => (
        <Button
          type="primary"
          shape="round"
          onClick={() => handleReply(record)}
          style={{ background: '#2E7D32', borderColor: '#2E7D32' }}
        >
          {record.answerFromExpert ? 'View Reply' : 'Reply'}
        </Button>
      ),
    },
  ];

  return (
    <Flex className={style.reportManagementScreen} vertical>
      <Row gutter={[16, 16]} className={style.overview}>
        <Col xs={24} sm={12}>
          <Card className={style.overviewCard}>
            <h3>Total Reports</h3>
            <p className={style.overviewValue}>{totalReports}</p>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card className={style.overviewCard}>
            <h3>Total Unanswered</h3>
            <p className={style.overviewValue}>{totalUnanswered}</p>
          </Card>
        </Col>
      </Row>
      <Card className={style.filterCard}>
        <h1 className={style.title}>Report Management</h1>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Search
            placeholder="Search reports..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={style.searchInput}
          />
          <Space wrap>
            <Select
              value={sortBy}
              onChange={setSortBy}
              className={style.filterSelect}
              placeholder="Sort By"
            >
              <Option value="reportID">Sort by ID</Option>
              <Option value="created">Sort by Date</Option>
              <Option value="questionerName">Sort by Questioner</Option>
            </Select>
            <Select
              value={direction}
              onChange={setDirection}
              className={style.filterSelect}
              placeholder="Direction"
            >
              <Option value="asc">Ascending</Option>
              <Option value="desc">Descending</Option>
            </Select>
            <Select
              value={isTrainned === undefined ? '' : isTrainned.toString()}
              onChange={(value) => setIsTrainned(value === '' ? undefined : value === 'true')}
              className={style.filterSelect}
              placeholder="Training Status"
            >
              <Option value="">All Training Status</Option>
              <Option value="true">Trained</Option>
              <Option value="false">Not Trained</Option>
            </Select>
            <Select
              value={isUnanswered === undefined ? '' : isUnanswered.toString()}
              onChange={(value) => setIsUnanswered(value === '' ? undefined : value === 'true')}
              className={style.filterSelect}
              placeholder="Reply Status"
            >
              <Option value="">All Reply Status</Option>
              <Option value="true">Unanswered</Option>
              <Option value="false">Answered</Option>
            </Select>
          </Space>
        </Space>
      </Card>
      <Card className={style.tableCard}>
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="reportID"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalReports,
            showSizeChanger: false,
            onChange: (page) => setCurrentPage(page),
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </Card>
      {selectedReport && (
        <ReplyModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onSubmit={handleSubmitReply}
        />
      )}
    </Flex>
  );
};

export default ReportManagementScreen;