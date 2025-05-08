import { useEffect, useState } from "react";
import { Table, Flex, Image, Tag, Button, Select, Radio } from "antd";
import { GetUser } from "@/payloads";
import { Icons, Images } from "@/assets";
import { fetchUserInfoByRole, getFarmId } from "@/utils";
import { EmployeeWithSkills, GetAttendanceList, GetWorklogDetail } from "@/payloads/worklog";
import { worklogService } from "@/services";
import { toast } from "react-toastify";
import { worklog } from "@/assets/images/images";
import { useStyle } from "@/hooks";

type EmployeeType = { fullName: string; avatarURL: string; userId: number };

interface EmployeeTableProps {
  employees: GetAttendanceList[];
  attendanceStatus: { [key: number]: string | null };
  onReplaceEmployee: (replacedUserId: number, replacementUserId: number) => void;
  onUpdateTempReporter: (userId: number) => void;
  onUpdateReplacingStates: (states: { [key: number]: number | null }) => void;
  isEditable: boolean;
  initialReporterId?: number;
  tempReporterId?: number;
  worklog?: GetWorklogDetail;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  attendanceStatus,
  onReplaceEmployee,
  onUpdateTempReporter,
  onUpdateReplacingStates,
  isEditable,
  initialReporterId,
  tempReporterId,
  worklog,
}) => {
  const [replacingStates, setReplacingStates] = useState<{ [key: number]: number | null }>({});
  const [employee, setEmployee] = useState<EmployeeType[]>([]);
  const { styles } = useStyle();
  console.log("replacingStates", replacingStates);
  console.log("employees", employees);
  console.log("tempReporterId", tempReporterId);

  useEffect(() => {
    const fetchEmployees = async () => {
      const farmId = getFarmId();
      const response = await worklogService.getEmployeesByWorkSkill(
        Number(farmId),
        worklog?.masterTypeId,
      );
      if (response.statusCode === 200) {
        setEmployee(response.data);
      } else {
        toast.warning("Failed to fetch employees");
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    setReplacingStates({});
  }, [employees]);

  const handleReplace = (replacedUserId: number, replacementUserId: number) => {
    setReplacingStates((prev) => {
      const newState = { ...prev, [replacedUserId]: replacementUserId };
      onUpdateReplacingStates(newState);
      console.log("tempReporterId", tempReporterId);
      console.log("replacedUserId", replacedUserId);

      if (tempReporterId === replacedUserId) {
        console.log("vo day");

        onUpdateTempReporter(replacementUserId);
      }

      return newState;
    });
  };

  const handleStartReplace = (userId: number) => {
    setReplacingStates((prev) => {
      const newState = { ...prev, [userId]: null };
      onUpdateReplacingStates(newState);
      return newState;
    });
  };

  const handleCancelReplace = (userId: number) => {
    setReplacingStates((prev) => {
      const newState = { ...prev };
      delete newState[userId];
      onUpdateReplacingStates(newState);
      return newState;
    });
  };

  const columns = [
    {
      title: "User Name",
      dataIndex: "fullName",
      align: "center" as const,
      render: (text: string, record: GetUser) => (
        <Flex align="center" justify="center" gap={8}>
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
      dataIndex: "statusOfUser",
      align: "center" as const,
      render: (status: string | undefined) => (
        <Tag
          color={
            status === "Received"
              ? "green"
              : status === "Replaced" || status === "BeReplaced"
              ? "orange"
              : status
              ? "red"
              : "gray"
          }
        >
          {status || "Not Yet"}
        </Tag>
      ),
    },
    {
      title: "Role",
      align: "center" as const,
      render: (_: any, record: GetAttendanceList) => (
        <Tag color={record.isReporter ? "blue" : "default"}>
          {record.isReporter ? "Reporter" : "Employee"}
        </Tag>
      ),
    },
    {
      title: "Reporter",
      align: "center" as const,
      render: (_: any, record: GetUser) => {
        // const isCurrentReporter = record.userId === tempReporterId;
        // console.log("isCurrentReporter", isCurrentReporter);

        // // 2. Check nếu đang là user bị thay thế (nằm trong keys của replacingStates)
        // const isBeingReplaced = Object.keys(replacingStates).includes(String(record.userId));
        // console.log("isBeingReplaced", isBeingReplaced);

        // // 3. Check nếu đang là user thay thế (nằm trong values của replacingStates)
        // const isReplacingSomeone = Object.values(replacingStates).includes(record.userId);
        // console.log("isReplacingSomeone", isReplacingSomeone);

        // const isChecked = isCurrentReporter || isBeingReplaced || isReplacingSomeone;
        const isCurrentReporter =
          record.userId === tempReporterId || replacingStates[record.userId] === tempReporterId;

        return (
          <Radio
            checked={isCurrentReporter}
            onChange={() => onUpdateTempReporter(record.userId)}
            disabled={!isEditable}
          />
        );
      },
    },
    {
      title: "Replacement",
      align: "center" as const,
      render: (_: any, record: GetUser) => {
        const isReplacing = replacingStates[record.userId] !== undefined;

        const availableReplacements = employee.filter(
          (emp) => emp.userId !== record.userId && !employees.some((e) => e.userId === emp.userId),
        );
        // const availableReplacements = employee.filter(
        //   (emp) =>
        //     emp.userId !== record.userId &&
        //     !employees.some((e) => e.userId === emp.userId) &&
        //     !Object.values(replacingStates).includes(emp.userId) // Loại bỏ nhân viên đã được chọn làm thay thế
        // );

        return isEditable ? (
          isReplacing ? (
            <Flex gap={8} align="center">
              <Select
                style={{
                  width: 250,
                  borderRadius: 8,
                  border: "1px solid #d9d9d9",
                }}
                placeholder={
                  <span style={{ display: "flex", alignItems: "center", color: "#bfbfbf" }}>
                    <Icons.search style={{ marginRight: 8 }} />
                    Select replacement
                  </span>
                }
                value={replacingStates[record.userId] || null}
                onChange={(value) => handleReplace(record.userId, value)}
                showSearch
                optionLabelProp="label"
                dropdownStyle={{
                  borderRadius: 8,
                  boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)",
                  padding: 8,
                  width: 300,
                }}
              >
                {availableReplacements.map((emp) => (
                  <Select.Option key={emp.userId} value={emp.userId} label={emp.fullName}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        padding: "4px 0",
                      }}
                    >
                      <Flex align="center" gap={8}>
                        <img
                          src={emp.avatarURL}
                          alt={emp.fullName}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            objectFit: "cover",
                            border: "1px solid #f0f0f0",
                          }}
                          crossOrigin="anonymous"
                        />
                        <span
                          style={{
                            fontWeight: 500,
                            color: "rgba(0, 0, 0, 0.88)",
                          }}
                        >
                          {emp.fullName}
                        </span>
                      </Flex>

                      <Flex gap={4} wrap="wrap" style={{ marginTop: 6 }}>
                        {(emp as EmployeeWithSkills).skillWithScore?.slice(0, 3)?.map((skill) => (
                          <Tag
                            key={skill.skillName}
                            icon={
                              <Icons.score
                                style={{ fontSize: 12, marginRight: "5px" }}
                                color="gold"
                              />
                            }
                            color="green"
                            style={{
                              margin: 0,
                              fontSize: 12,
                              padding: "0 6px",
                            }}
                          >
                            {skill.skillName} ({skill.score})
                          </Tag>
                        ))}
                        {(emp as EmployeeWithSkills).skillWithScore?.length > 3 && (
                          <Tag style={{ fontSize: 12, padding: "0 6px" }}>
                            +{(emp as EmployeeWithSkills).skillWithScore.length - 3}
                          </Tag>
                        )}
                      </Flex>
                    </div>
                  </Select.Option>
                ))}
              </Select>
              <Button onClick={() => handleCancelReplace(record.userId)} icon={<Icons.close />} />
            </Flex>
          ) : (
            <Button onClick={() => handleStartReplace(record.userId)} disabled={!isEditable}>
              Replace
            </Button>
          )
        ) : (
          <Button disabled>Replace</Button>
        );
      },
    },
  ];

  return (
    <Table
      className={`${styles.customeTable2}`}
      dataSource={employees}
      columns={columns}
      rowKey="userId"
    />
  );
};

export default EmployeeTable;
