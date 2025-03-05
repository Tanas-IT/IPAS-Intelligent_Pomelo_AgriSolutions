import { TableColumn } from "@/types";
import { GetEmployee } from "@/payloads";
import { TableCell } from "@/components";
import { formatDate } from "@/utils";

export const EmployeeColumns: TableColumn<GetEmployee>[] = [
  {
    header: "Code",
    field: "user.userCode",
    accessor: (item) => <TableCell value={item.user.userCode} isCopyable={true} />,
    width: 180,
  },
  {
    header: "Email",
    field: "user.email",
    accessor: (item) => <TableCell value={item.user.email} />,
    width: 250,
  },
  {
    header: "Role",
    field: "roleName",
    accessor: (item) => <TableCell value={item.roleName} />,
    width: 150,
  },
  {
    header: "FullName",
    field: "user.fullName",
    accessor: (item) => <TableCell value={item.user.fullName} />,
    width: 180,
  },
  {
    header: "Phone Number",
    field: "user.phoneNumber",
    accessor: (item) => <TableCell value={item.user.phoneNumber} />,
    width: 150,
  },
  {
    header: "Gender",
    field: "user.gender",
    accessor: (item) => <TableCell value={item.user.gender} />,
    width: 150,
  },
  {
    header: "DOB",
    field: "user.dob",
    accessor: (item) => <TableCell value={formatDate(item.user.dob)} />,
    width: 150,
  },
  {
    header: "Create Date",
    field: "user.createDate",
    accessor: (item) => <TableCell value={formatDate(item.user.createDate)} />,
    width: 150,
  },
];
