import React, { useState, useEffect } from "react";
import { Table, Input, Button, Avatar, Tag, Space, Select, InputNumber } from "antd";
import { dashboardService } from "@/services";
import { EmployeeListItem } from "@/payloads/dashboard";
import { Loading } from "@/components";
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

interface EmployeeOverviewProps {
  onCompare: (selectedIds: number[]) => void;
}

const EmployeeOverview: React.FC<EmployeeOverviewProps> = ({ onCompare }) => {
  const [data, setData] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [type, setType] = useState<"top" | "bottom">("top");
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [minScore, setMinScore] = useState<number | null>(null);
  const [maxScore, setMaxScore] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const employeeList = await dashboardService.getEmployeeList(
        type,
        limit,
        search || undefined,
        minScore ?? undefined,
        maxScore ?? undefined
      );
      setData(employeeList);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employee list:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type, limit, search, minScore, maxScore]);

  const onSearch = (value: string) => {
    setSearch(value);
    setLoading(true);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const handleCompare = () => {
    if (selectedRowKeys.length >= 2 && selectedRowKeys.length <= 5) {
      onCompare(selectedRowKeys.map((key) => Number(key)));
    }
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record: EmployeeListItem) => ({
      disabled: selectedRowKeys.length >= 5 && !selectedRowKeys.includes(record.employeeId),
    }),
  };

  const columns = [
    {
      title: "Avatar",
      dataIndex: "avatar",
      render: (avatar: string) => <Avatar src={avatar} size={40} crossOrigin="anonymous" />,
    },
    {
      title: "Employee Name",
      dataIndex: "name",
      sorter: (a: EmployeeListItem, b: EmployeeListItem) => a.name.localeCompare(b.name),
    },
    {
      title: "Score",
      dataIndex: "score",
      sorter: (a: EmployeeListItem, b: EmployeeListItem) => a.score - b.score,
    },
    {
      title: "Task OK / Failed",
      render: (_: any, record: EmployeeListItem) => (
        <Space>
          <Tag icon={<CheckCircleOutlined />} color="success">
            {record.taskSuccess}
          </Tag>
          <Tag icon={<CloseCircleOutlined />} color="error">
            {record.taskFail}
          </Tag>
        </Space>
      ),
      sorter: (a: EmployeeListItem, b: EmployeeListItem) =>
        a.taskSuccess - b.taskSuccess || a.taskFail - b.taskFail,
    },
    {
      title: "Status",
      render: (_: any, record: EmployeeListItem) => {
        const warningCount = record.taskFail;
        return warningCount > 0 ? (
          <Tag icon={<WarningOutlined />} color="warning">
            {warningCount} Warning{warningCount > 1 ? "s" : ""}
          </Tag>
        ) : (
          <Tag color="success">Good</Tag>
        );
      },
      sorter: (a: EmployeeListItem, b: EmployeeListItem) => a.taskFail - b.taskFail,
    },
  ];

  if (loading) return <Loading />;

  return (
    <div style={{ padding: "10px" }}>
      <Space style={{ marginBottom: 16, flexWrap: "wrap" }}>
        <Select value={type} onChange={setType} style={{ width: 120 }}>
          <Option value="top">Top</Option>
          <Option value="bottom">Bottom</Option>
        </Select>
        <InputNumber
          min={1}
          max={50}
          value={limit}
          onChange={(value) => setLimit(value || 10)}
          style={{ width: 80 }}
        />
        <Search
          placeholder="Search employees"
          onSearch={onSearch}
          style={{ width: 200 }}
          enterButton
        />
        <Space>
          <span>Score:</span>
          <InputNumber
            min={0}
            value={minScore}
            onChange={(value) => setMinScore(value)}
            placeholder="Min"
            style={{ width: 100 }}
          />
          <span>-</span>
          <InputNumber
            min={minScore ?? 0}
            value={maxScore}
            onChange={(value) => setMaxScore(value)}
            placeholder="Max"
            style={{ width: 100 }}
          />
        </Space>
        <Button
          type="primary"
          onClick={handleCompare}
          disabled={selectedRowKeys.length < 2 || selectedRowKeys.length > 5}
        >
          Compare Selected ({selectedRowKeys.length})
        </Button>
      </Space>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data.map((item) => ({ ...item, key: item.employeeId }))}
        pagination={{ pageSize: 5 }}
        bordered
        style={{ background: "#fff", borderRadius: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      />
    </div>
  );
};

export default EmployeeOverview;