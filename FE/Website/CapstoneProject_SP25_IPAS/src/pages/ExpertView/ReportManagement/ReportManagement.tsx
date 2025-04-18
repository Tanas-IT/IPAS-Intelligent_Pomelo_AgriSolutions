import React, { useState, useEffect } from "react";
import {
  Card,
  Flex,
  Row,
  Col,
  Input,
  Select,
  Space,
  Pagination,
  Divider,
  Segmented,
  Table,
  Spin,
  Tag,
  Empty,
} from "antd";
import {
  SortAscendingOutlined,
  SortDescendingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  TableOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import style from "./ReportManagement.module.scss";
import { expertService } from "@/services";
import { AnswerReportRequest, GetReportResponse } from "@/payloads";
import ReportCard from "../components/ReportCard/ReportCard";
import ReplyModal from "../components/ReplyModal/ReplyModal";
import { Icons } from "@/assets";
import OverviewCard from "../components/OverviewCard/OverviewCard";
import ReportActionMenu from "../components/ReportActionMenu";
import { Tooltip } from "@/components";
import { getReportColumns } from "../components/ReportColumns";
import AssignTagModal from "../components/AssignTagModal/AssignTagModal";
import { useStyle } from "@/hooks";

const { Search } = Input;
const { Option } = Select;

const ReportManagementScreen= () => {
  const { styles } = useStyle();
  const [reports, setReports] = useState<GetReportResponse[]>([]);
  const [selectedReport, setSelectedReport] = useState<GetReportResponse | null>(null);
  const [totalReports, setTotalReports] = useState<number>(0);
  const [totalUnanswered, setTotalUnanswered] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [showAssignTagModal, setShowAssignTagModal] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const [searchKey, setSearchKey] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("reportID");
  const [direction, setDirection] = useState<string>("asc");
  const [isTrainned, setIsTrainned] = useState<boolean | undefined>(undefined);
  const [isUnanswered, setIsUnanswered] = useState<boolean | undefined>(undefined);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(8);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await expertService.getAllReportsWithPagin(
        searchKey,
        sortBy,
        direction,
        isTrainned,
        isUnanswered,
        currentPage,
        pageSize,
      );

      if (response.statusCode === 200) {
        setReports(response.data.list);
        setTotalReports(response.data.totalRecord);
        setTotalUnanswered(
          response.data.list.filter((r: GetReportResponse) => !r.answerFromExpert).length,
        );
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [searchKey, sortBy, direction, isTrainned, isUnanswered, currentPage, pageSize]);

  const handleReply = (report: GetReportResponse) => {
    setSelectedReport(report);
  };

  const handleSubmitReply = async (data: AnswerReportRequest) => {
    const response = await expertService.answerReport(data);
    if (response.statusCode === 200) {
      fetchReports();
      setSelectedReport(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    if (sorter.field) {
      setSortBy(sorter.field);
      setDirection(sorter.order === "ascend" ? "asc" : "desc");
    }
  };

  const handleViewDetails = (report: GetReportResponse) => {
    console.log("View details:", report);
  };

  const handleAddToTraining = (report: GetReportResponse) => {
    setSelectedReportId(report.reportID);
    setShowAssignTagModal(true);
  };

  const columns = getReportColumns(handleReply, handleViewDetails, handleAddToTraining);

  const filterSelects = [
    {
      key: "direction",
      placeholder: "Direction",
      value: direction,
      onChange: setDirection,
      options: [
        { value: "asc", label: "Ascending", icon: <SortAscendingOutlined /> },
        { value: "desc", label: "Descending", icon: <SortDescendingOutlined /> },
      ],
      icon: <SortDescendingOutlined />,
    },
    {
      key: "isTrainned",
      placeholder: "Training Status",
      value: isTrainned === undefined ? "" : isTrainned.toString(),
      onChange: (value: string) => setIsTrainned(value === "" ? undefined : value === "true"),
      options: [
        { value: "", label: "All", icon: <Icons.box /> },
        { value: "true", label: "Trained", icon: <CheckCircleOutlined /> },
        { value: "false", label: "Not Trained", icon: <CloseCircleOutlined /> },
      ],
      icon: <Icons.box />,
    },
    {
      key: "isUnanswered",
      placeholder: "Reply Status",
      value: isUnanswered === undefined ? "" : isUnanswered.toString(),
      onChange: (value: string) => setIsUnanswered(value === "" ? undefined : value === "true"),
      options: [
        { value: "", label: "All", icon: <Icons.box /> },
        { value: "true", label: "Unanswered", icon: <ClockCircleOutlined /> },
        { value: "false", label: "Answered", icon: <CheckCircleOutlined /> },
      ],
      icon: <Icons.box />,
    },
  ];

  return (
    <Flex className={style.reportManagementScreen} vertical gap={16}>
      <h2>Overview</h2>
      <Row gutter={[16, 16]} className={style.overview}>
        <Col xs={24} sm={12} md={8}>
          <OverviewCard
            icon={<Icons.report size={20} />}
            title="Total Reports"
            value={totalReports}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <OverviewCard
            icon={<Icons.unanswered size={20} />}
            title="Total Unanswered"
            value={totalUnanswered}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <OverviewCard
            icon={<Icons.trainned size={20} />}
            title="Total Trained"
            value={reports.filter((r) => r.isTrainned).length}
          />
        </Col>
      </Row>

      <Card className={style.filterCard}>
        <Flex justify="space-between" align="center">
          <h1 className={style.title}>Report Management</h1>
          <Search
            placeholder="Search reports..."
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            className={style.searchInput}
            style={{ maxWidth: 300 }}
            prefix={<SearchOutlined />}
            allowClear
          />
        </Flex>
        <Divider className={style.divider} />
        <Flex vertical gap="middle" style={{ width: "100%", marginTop: 16 }}>
          <Flex justify="space-between" align="center">
            <Space wrap>
              {filterSelects.map((select) => (
                <Select
                  key={select.key}
                  value={select.value}
                  onChange={select.onChange}
                  className={style.filterSelect}
                  placeholder={
                    <Space>
                      {select.icon}
                      {select.placeholder}
                    </Space>
                  }
                  dropdownClassName={style.customDropdown}
                  suffixIcon={<Icons.box />}
                >
                  {select.options.map((option) => (
                    <Option key={option.value} value={option.value}>
                      <Space>
                        {option.icon}
                        {option.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              ))}
            </Space>
            <Segmented
              value={viewMode}
              onChange={(value) => setViewMode(value as "card" | "table")}
              options={[
                { value: "card", icon: <AppstoreOutlined /> },
                { value: "table", icon: <TableOutlined /> },
              ]}
            />
          </Flex>
        </Flex>
      </Card>

      {loading ? (
        <Spin size="large" className={style.loader} />
      ) : viewMode === "table" ? (
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
            onChange: handlePageChange,
          }}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
          className={`${style.tbl} ${styles.customeTable2}`}
        />
      ) : reports.length > 0 ? (
        <>
          <div className={style.cardContainer}>
            {reports.map((report) => (
              <ReportCard
                key={report.reportID}
                report={report}
                onReply={handleReply}
                onTagAssigned={fetchReports}
              />
            ))}
          </div>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalReports}
            onChange={handlePageChange}
            className={style.pagination}
            showSizeChanger={false}
          />
        </>
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No reports found"
          className={style.emptyState}
        />
      )}

      {selectedReport && (
        <ReplyModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onSubmit={handleSubmitReply}
        />
      )}

      {showAssignTagModal && selectedReportId !== null && (
        <AssignTagModal
          reportId={selectedReportId}
          onClose={() => {
            setShowAssignTagModal(false);
            setSelectedReportId(null);
          }}
          onTagAssigned={() => {
            fetchReports();
            setShowAssignTagModal(false);
            setSelectedReportId(null);
          }}
        />
      )}
    </Flex>
  );
};

export default ReportManagementScreen;
