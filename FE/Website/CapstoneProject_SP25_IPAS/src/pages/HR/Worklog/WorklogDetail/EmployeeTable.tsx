import { useEffect, useState } from "react";
import { Table, Flex, Image, Tag, Button, Select } from "antd";
import { GetUser } from "@/payloads";
import { Images } from "@/assets";
import { fetchUserInfoByRole } from "@/utils";

type EmployeeType = { fullName: string; avatarURL: string; userId: number };

interface EmployeeTableProps {
  employees: GetUser[];
  reporter: GetUser[];
  attendanceStatus: { [key: number]: "Received" | "Rejected" };
  onReplaceEmployee: (replacedUserId: number, replacementUserId: number) => void;
  onUpdateReporter: (userId: number, isReporter: boolean) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  reporter,
  attendanceStatus,
  onReplaceEmployee,
  onUpdateReporter,
}) => {
  const [replacingStates, setReplacingStates] = useState<{ [key: number]: number | null }>({}); // Lưu trạng thái thay thế và giá trị được chọn
  const [employee, setEmployee] = useState<EmployeeType[]>([]);
  console.log("attendanceStatus", attendanceStatus);
  console.log("employees", employees);
  

  useEffect(() => {
    const fetchAllEmployees = async () => {
      const users = await fetchUserInfoByRole("User");
      setEmployee(users);
    };
    fetchAllEmployees();
  }, []);

  const combinedEmployees = [
    ...reporter.map((rep) => ({
      ...rep,
      isReporter: true,
      statusOfUserWorkLog: attendanceStatus[rep.userId] || "Rejected",
    })),
    ...employees.map((emp) => ({
      ...emp,
      isReporter: false,
      statusOfUserWorkLog: attendanceStatus[emp.userId] || "Rejected",
    })),
  ];

  const handleReplace = (replacedUserId: number, replacementUserId: number) => {
    console.log("replacedUserId", replacedUserId);
    console.log("replacementUserId", replacementUserId);
    
    onReplaceEmployee(replacedUserId, replacementUserId); // Gọi hàm xử lý thay thế
    setReplacingStates((prev) => ({ ...prev, [replacedUserId]: replacementUserId })); // Lưu giá trị được chọn
  };

  const handleStartReplace = (userId: number) => {
    setReplacingStates((prev) => ({ ...prev, [userId]: null })); // Mở trạng thái thay thế
  };

  const handleCancelReplace = (userId: number) => {
    setReplacingStates((prev) => {
      const newState = { ...prev };
      delete newState[userId]; // Đóng trạng thái thay thế
      return newState;
    });
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
      dataIndex: "statusOfUserWorkLog",
      render: (status: string) => (
        <Tag color={status === "Received" ? "green" : "red"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Role",
      dataIndex: "isReporter",
      render: (isReporter: boolean) => (
        <Tag color={isReporter ? "blue" : "default"}>
          {isReporter ? "Reporter" : "Employee"}
        </Tag>
      ),
    },
    {
      title: "Replacement",
      render: (_: any, record: GetUser) => {
        const isReplacing = replacingStates[record.userId] !== undefined; // Kiểm tra trạng thái thay thế

        return isReplacing ? (
          <Flex gap={8}>
            <Select
              style={{ width: 150 }}
              placeholder="Select replacement"
              value={replacingStates[record.userId] || null} // Hiển thị giá trị được chọn
              onChange={(value) => handleReplace(record.userId, value)} // Xử lý khi chọn giá trị
            >
              {employee
                .filter((emp) => emp.userId !== record.userId) // Loại trừ nhân viên đang được thay thế
                .map((emp) => (
                  <Select.Option key={emp.userId} value={emp.userId}>
                    {emp.fullName}
                  </Select.Option>
                ))}
            </Select>
            <Button onClick={() => handleCancelReplace(record.userId)}>Cancel</Button>
          </Flex>
        ) : (
          <Button onClick={() => handleStartReplace(record.userId)}>
            Replace
          </Button>
        );
      },
    },
  ];

  return <Table dataSource={combinedEmployees} columns={columns} rowKey="userId" />;
};

export default EmployeeTable;