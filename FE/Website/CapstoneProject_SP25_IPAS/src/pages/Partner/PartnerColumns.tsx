import { TableColumn } from "@/types";
import { formatDate } from "@/utils";
import { TableCell } from "@/components";
import { GetPartner } from "@/payloads";

export const PartnerColumns: TableColumn<GetPartner>[] = [
  {
    header: "Code",
    field: "partnerCode",
    accessor: (item) => <TableCell value={item.partnerCode} isCopyable={true} />,
    width: 200,
  },
  {
    header: "Name",
    field: "partnerName",
    accessor: (item) => <TableCell value={item.partnerName} />,
    width: 180,
  },
  {
    header: "Role",
    field: "major",
    accessor: (item) => <TableCell value={item.major} />,
    width: 150,
  },
  {
    header: "Phone Number",
    field: "phoneNumber",
    accessor: (item) => <TableCell value={item.phoneNumber} />,
    width: 180,
  },
  {
    header: "Description",
    field: "description",
    accessor: (item) => <TableCell value={item.description} />,
    width: 300,
  },
  {
    header: "Created Date",
    field: "createDate",
    accessor: (item) => <TableCell value={formatDate(item.createDate)} />,
    width: 150,
  },
];
