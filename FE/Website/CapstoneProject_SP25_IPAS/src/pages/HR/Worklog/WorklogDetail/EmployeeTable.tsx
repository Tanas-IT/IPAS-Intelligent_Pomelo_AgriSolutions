import { useState } from "react";
import { Table, Flex, Image, Tag, Button, Select } from "antd";
import { GetUser } from "@/payloads";
import { Images } from "@/assets";

interface EmployeeTableProps {
  employees: GetUser[];
  attendanceStatus: { [key: number]: "Received" | "Rejected" };
  onReplaceEmployee: (replacedUserId: number, replacementUserId: number) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  attendanceStatus,
  onReplaceEmployee,
}) => {
  const [replacingEmployeeId, setReplacingEmployeeId] = useState<number | null>(null);

  const handleReplace = (replacedUserId: number, replacementUserId: number) => {
    onReplaceEmployee(replacedUserId, replacementUserId);
    setReplacingEmployeeId(null);
  };

  const columns = [
    {
      title: "User Name",
      dataIndex: "fullName",
      render: (text: string, record: GetUser) => (
        <Flex align="center" gap={8}>
          <Image
            src={record.avatarURL || Images.avatar}
            width={32}
            height={32}
            style={{ borderRadius: "50%" }}
            crossOrigin="anonymous"
          />
          <span>{text}</span>
        </Flex>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string, record: GetUser) => (
        <Tag color={attendanceStatus[record.userId] === "Received" ? "green" : "red"}>
          {attendanceStatus[record.userId]}
        </Tag>
      ),
    },
    {
      title: "Replacement",
      render: (_: any, record: GetUser) => {
        const isReplacing = replacingEmployeeId === record.userId;

        return isReplacing ? (
          <Flex gap={8}>
            <Select
              style={{ width: 150 }}
              placeholder="Select replacement"
              onChange={(value) => handleReplace(record.userId, value)}
            >
              {employees
                .filter((emp) => emp.userId !== record.userId) // Loại trừ nhân viên đang được thay thế
                .map((emp) => (
                  <Select.Option key={emp.userId} value={emp.userId}>
                    {emp.fullName}
                  </Select.Option>
                ))}
            </Select>
            <Button onClick={() => setReplacingEmployeeId(null)}>Cancel</Button>
          </Flex>
        ) : (
          <Button onClick={() => setReplacingEmployeeId(record.userId)}>
            Replace
          </Button>
        );
      },
    },
  ];

  return <Table dataSource={employees} columns={columns} rowKey="userId" />;
};

export default EmployeeTable;