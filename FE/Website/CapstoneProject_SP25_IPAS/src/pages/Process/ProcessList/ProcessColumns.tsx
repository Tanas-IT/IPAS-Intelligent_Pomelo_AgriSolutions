import { TableColumn } from "@/types";
import style from "./ProcessList.module.scss";
import { GetProcess, GetProcessList } from "@/payloads/process";
import { Tag } from "antd";
import { TableCell } from "@/components";

export const processColumns: TableColumn<GetProcessList>[] = [
  {
    header: "Process Code",
    field: "processCode",
    accessor: (process) => <TableCell value={process.processCode} isCopyable={true} />,
    width: 150,
  },
  {
    header: "Process Name",
    field: "processName",
    accessor: (process) => <TableCell value={process.processName} />,
    width: 300,
  },
  {
    header: "In Use",
    field: "isInUse",
    accessor: (process) => (
      <Tag color={process.isInUse ? "blue" : "orange"}>
        {process.isInUse ? "In Use" : "Not In Use"}
      </Tag>
    ),
    width: 100,
  },
  {
    header: "Created Date",
    field: "createDate",
    accessor: (process) => (
      <TableCell
        value={process.createDate ? new Date(process.createDate).toLocaleDateString() : "N/A"}
      />
    ),
    width: 150,
  },
  {
    header: "Type",
    field: "processMasterTypeModel",
    accessor: (process) => <TableCell value={process?.processMasterTypeModel?.masterTypeName} />,
    width: 150,
  },
  {
    header: "Status",
    field: "isActive",
    accessor: (process) => (
      <Tag color={process.isActive ? "green" : "red"}>
        {process.isActive ? "Active" : "Inactive"}
      </Tag>
    ),
    width: 170,
  },
];
