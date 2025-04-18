import { TableColumn } from "@/types";
import { GetUser2 } from "@/payloads";
import { TableCell, UserAvatar } from "@/components";
import { formatDate } from "@/utils";
import { Flex, Tag } from "antd";

export const UserColumns: TableColumn<GetUser2>[] = [
  {
    header: "Code",
    field: "userCode",
    accessor: (item) => <TableCell value={item.userCode} isCopyable={true} />,
    width: 200,
  },
  {
    header: "FullName",
    field: "fullName",
    accessor: (item) => (
      <Flex justify="flex-start" align="center" gap={12}>
        <UserAvatar avatarURL={item?.avatarURL} />
        <Flex justify="center" style={{ width: "100%" }}>
          <TableCell value={item.fullName} />
        </Flex>
      </Flex>
    ),
    width: 200,
  },
  {
    header: "Email",
    field: "email",
    accessor: (item) => <TableCell value={item.email} />,
    width: 250,
  },
  {
    header: "Role",
    field: "roleName",
    accessor: (item) => <TableCell value={item.roleName} />,
    width: 180,
  },
  {
    header: "Gender",
    field: "gender",
    accessor: (item) => <TableCell value={item.gender} />,
    width: 150,
  },
  {
    header: "Status",
    field: "status",
    accessor: (item) => <Tag color={item.status === "Active" ? "green" : "red"}>{item.status}</Tag>,
    width: 150,
  },
  {
    header: "Phone Number",
    field: "phoneNumber",
    accessor: (item) => <TableCell value={item.phoneNumber} />,
    width: 150,
  },
  {
    header: "DOB",
    field: "dob",
    accessor: (item) => <TableCell value={formatDate(item.dob)} />,
    width: 150,
  },
  {
    header: "Create Date",
    field: "createDate",
    accessor: (item) => <TableCell value={formatDate(item.createDate)} />,
    width: 150,
  },
];
