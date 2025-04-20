// import { useEffect, useState } from "react";
// import { Table, Flex, Image, Tag, Button, Select } from "antd";
// import { GetUser } from "@/payloads";
// import { Images } from "@/assets";
// import { fetchUserInfoByRole } from "@/utils";
// import { GetAttendanceList } from "@/payloads/worklog";

// type EmployeeType = { fullName: string; avatarURL: string; userId: number };

// interface EmployeeTableProps {
//   employees: GetAttendanceList[];
//   attendanceStatus: { [key: number]: string | null };
//   onReplaceEmployee: (replacedUserId: number, replacementUserId: number) => void;
//   onUpdateReporter: (userId: number, isReporter: boolean) => void;
//   isEditable: boolean;
// }

// const EmployeeTable: React.FC<EmployeeTableProps> = ({
//   employees,
//   attendanceStatus,
//   onReplaceEmployee,
//   onUpdateReporter,
//   isEditable,
// }) => {
//   const [replacingStates, setReplacingStates] = useState<{ [key: number]: number | null }>({});
//   const [employee, setEmployee] = useState<EmployeeType[]>([]);
//   console.log("attendanceStatus", attendanceStatus);
//   console.log("employees", employees);

//   useEffect(() => {
//     const fetchAllEmployees = async () => {
//       const users = await fetchUserInfoByRole("User");
//       setEmployee(users);
//     };
//     fetchAllEmployees();
//   }, []);

//   useEffect(() => {
//     setReplacingStates({});
//   }, [employees]);

//   const handleReplace = (replacedUserId: number, replacementUserId: number) => {
//     console.log("replacedUserId", replacedUserId);
//     console.log("replacementUserId", replacementUserId);
//     onReplaceEmployee(replacedUserId, replacementUserId);
//     setReplacingStates((prev) => ({ ...prev, [replacedUserId]: replacementUserId }));
//   };

//   const handleStartReplace = (userId: number) => {
//     setReplacingStates((prev) => ({ ...prev, [userId]: null }));
//   };

//   const handleCancelReplace = (userId: number) => {
//     setReplacingStates((prev) => {
//       const newState = { ...prev };
//       delete newState[userId];
//       return newState;
//     });
//   };

//   const columns = [
//     {
//       title: "User Name",
//       dataIndex: "fullName",
//       render: (text: string, record: GetUser) => (
//         <Flex align="center" gap={8}>
//           <Image
//             src={record.avatarURL || Images.avatar}
//             width={32}
//             height={32}
//             style={{ borderRadius: "50%" }}
//             crossOrigin="anonymous"
//           />
//           <span>{text}</span>
//         </Flex>
//       ),
//     },
//     {
//       title: "Status",
//       dataIndex: "statusOfUser",
//       render: (status: string | undefined) => (
//         <Tag
//           color={
//             status === "Received"
//               ? "green"
//               : status === "Replaced"
//               ? "orange"
//               : status
//               ? "red"
//               : "gray"
//           }
//         >
//           {status || "Not Yet"}
//         </Tag>
//       ),
//     },
//     {
//       title: "Role",
//       dataIndex: "isReporter",
//       render: (isReporter: boolean) => (
//         <Tag color={isReporter ? "blue" : "default"}>
//           {isReporter ? "Reporter" : "Employee"}
//         </Tag>
//       ),
//     },
//     {
//       title: "Replacement",
//       render: (_: any, record: GetUser) => {
//         const isReplacing = replacingStates[record.userId] !== undefined;
//         const availableReplacements = employee.filter(
//           (emp) =>
//             emp.userId !== record.userId &&
//             !employees.some((e) => e.userId === emp.userId)
//         );

//         return isEditable ? (
//           isReplacing ? (
//             <Flex gap={8}>
//               <Select
//                 style={{ width: 150 }}
//                 placeholder="Select replacement"
//                 value={replacingStates[record.userId] || null}
//                 onChange={(value) => handleReplace(record.userId, value)}
//                 disabled={!isEditable}
//               >
//                 {availableReplacements.map((emp) => (
//                   <Select.Option key={emp.userId} value={emp.userId}>
//                     {emp.fullName}
//                   </Select.Option>
//                 ))}
//               </Select>
//               <Button onClick={() => handleCancelReplace(record.userId)} disabled={!isEditable}>
//                 Cancel
//               </Button>
//             </Flex>
//           ) : (
//             <Button onClick={() => handleStartReplace(record.userId)} disabled={!isEditable}>
//               Replace
//             </Button>
//           )
//         ) : (
//           <Button disabled>Replace</Button>
//         );
//       },
//     },
//   ];

//   return <Table dataSource={employees} columns={columns} rowKey="userId" />;
// };

// export default EmployeeTable;
import { useEffect, useState } from "react";
import { Table, Flex, Image, Tag, Button, Select, Radio } from "antd";
import { GetUser } from "@/payloads";
import { Images } from "@/assets";
import { fetchUserInfoByRole } from "@/utils";
import { GetAttendanceList } from "@/payloads/worklog";

type EmployeeType = { fullName: string; avatarURL: string; userId: number };

interface EmployeeTableProps {
  employees: GetAttendanceList[];
  attendanceStatus: { [key: number]: string | null };
  onReplaceEmployee: (replacedUserId: number, replacementUserId: number) => void;
  onUpdateTempReporter: (userId: number) => void;
  isEditable: boolean;
  initialReporterId?: number;
  tempReporterId?: number;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  attendanceStatus,
  onReplaceEmployee,
  onUpdateTempReporter,
  isEditable,
  initialReporterId,
  tempReporterId,
}) => {
  const [replacingStates, setReplacingStates] = useState<{ [key: number]: number | null }>({});
  const [employee, setEmployee] = useState<EmployeeType[]>([]);

  useEffect(() => {
    const fetchAllEmployees = async () => {
      const users = await fetchUserInfoByRole("User");
      setEmployee(users);
    };
    fetchAllEmployees();
  }, []);

  useEffect(() => {
    setReplacingStates({});
  }, [employees]);

  const handleReplace = (replacedUserId: number, replacementUserId: number) => {
    onReplaceEmployee(replacedUserId, replacementUserId);
    setReplacingStates((prev) => ({ ...prev, [replacedUserId]: replacementUserId }));
  };

  const handleStartReplace = (userId: number) => {
    setReplacingStates((prev) => ({ ...prev, [userId]: null }));
  };

  const handleCancelReplace = (userId: number) => {
    setReplacingStates((prev) => {
      const newState = { ...prev };
      delete newState[userId];
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
      render: (_: any, record: GetUser) => (
        <Tag color={record.userId === initialReporterId ? "blue" : "default"}>
          {record.userId === initialReporterId ? "Reporter" : "Employee"}
        </Tag>
      ),
    },
    {
      title: "Reporter",
      render: (_: any, record: GetUser) => (
        <Radio
          checked={record.userId === tempReporterId}
          onChange={() => onUpdateTempReporter(record.userId)}
          disabled={!isEditable}
        >
          {record.fullName}
        </Radio>
      ),
    },
    {
      title: "Replacement",
      render: (_: any, record: GetUser) => {
        const isReplacing = replacingStates[record.userId] !== undefined;
        const availableReplacements = employee.filter(
          (emp) =>
            emp.userId !== record.userId &&
            !employees.some((e) => e.userId === emp.userId)
        );

        return isEditable ? (
          isReplacing ? (
            <Flex gap={8}>
              <Select
                style={{ width: 150 }}
                placeholder="Select replacement"
                value={replacingStates[record.userId] || null}
                onChange={(value) => handleReplace(record.userId, value)}
                disabled={!isEditable}
              >
                {availableReplacements.map((emp) => (
                  <Select.Option key={emp.userId} value={emp.userId}>
                    {emp.fullName}
                  </Select.Option>
                ))}
              </Select>
              <Button onClick={() => handleCancelReplace(record.userId)} disabled={!isEditable}>
                Cancel
              </Button>
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

  return <Table dataSource={employees} columns={columns} rowKey="userId" />;
};

export default EmployeeTable;