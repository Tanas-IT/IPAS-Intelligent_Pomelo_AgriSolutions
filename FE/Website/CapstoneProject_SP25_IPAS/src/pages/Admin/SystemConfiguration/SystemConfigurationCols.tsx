import { TableColumn } from "@/types";
import { GetSystemConfig } from "@/payloads";
import { TableCell } from "@/components";
import { Tag } from "antd";
import { formatDate } from "@/utils";

export const SystemConfigurationCols: TableColumn<GetSystemConfig>[] = [
  {
    header: "Configuration Key",
    field: "configKey",
    accessor: (item) => <TableCell value={item.configKey} isCopyable={true} />,
    width: 200,
  },
  {
    header: "Value",
    field: "configValue",
    accessor: (item) => <TableCell value={item.configValue} />,
    width: 150,
  },
  {
    header: "Description",
    field: "description",
    accessor: (item) => <TableCell value={item.description} />,
    width: 320,
  },
  {
    header: "Status",
    field: "isActive",
    accessor: (item) => (
      <Tag color={item.isActive ? "green" : "red"}>{item.isActive ? "Active" : "Inactive"}</Tag>
    ),
    width: 150,
  },
  {
    header: "Created Date",
    field: "createDate",
    accessor: (item) => <TableCell value={formatDate(item.createDate)} />,
    width: 150,
  },
];
