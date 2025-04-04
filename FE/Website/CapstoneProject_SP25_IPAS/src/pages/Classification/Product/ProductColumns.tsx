import { TableColumn } from "@/types";
import { GetMasterType, GetProduct } from "@/payloads";
import { formatDate } from "@/utils";
import { TableCell } from "@/components";
import { Collapse, Tag } from "antd";

export const productColumns: TableColumn<GetMasterType>[] = [
  {
    header: "Code",
    field: "masterTypeCode",
    accessor: (item) => <TableCell value={item.masterTypeCode} isCopyable={true} />,
    width: 200,
  },
  {
    header: "Name",
    field: "masterTypeName",
    accessor: (item) => <TableCell value={item.masterTypeName} />,
    width: 150,
  },
  // {
  //   header: "Type",
  //   field: "typeName",
  //   accessor: (item) => <TableCell value={item.typeName} />,
  //   width: 150,
  // },
  {
    header: "Description",
    field: "masterTypeDescription",
    accessor: (item) => <TableCell value={item.masterTypeDescription} />,
    width: 250,
  },
  {
    header: "Created Date",
    field: "createDate",
    accessor: (item) => <TableCell value={formatDate(item.createDate)} />,
    width: 150,
  },
  {
    header: "Active Status",
    field: "isActive",
    accessor: (item) => (
      <Tag color={item.isActive ? "green" : "red"}>{item.isActive ? "Active" : "Inactive"}</Tag>
    ),
    width: 150,
  },
];
