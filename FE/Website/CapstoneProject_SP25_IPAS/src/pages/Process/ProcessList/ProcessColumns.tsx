import { TableColumn } from "@/types";
import style from "./ProcessList.module.scss";
import { GetProcess } from "@/payloads/process";
import { Tag } from "antd";

export const processColumns: TableColumn<GetProcess>[] = [
  {
    header: "Process Code",
    field: "processCode",
    accessor: (process) => process.processCode,
    width: 150,
  },
  {
    header: "Process Name",
    field: "processName",
    accessor: (process) => <div className={style.tableText}>{process.processName}</div>,
    width: 300,
  },
  {
    header: "Created Date",
    field: "createDate",
    accessor: (process) =>  <div className={style.tableText}>{process.createDate.toLocaleDateString()}</div>,
    width: 150,
  },
  {
    header: "Growth Stage",
    field: "growthStageName",
    accessor: (process) =>  <div className={style.tableText}>{process.growthStageName}</div>,
    width: 150,
  },
  {
    header: "Type",
    field: "processStyleName",
    accessor: (process) =>  <div className={style.tableText}>{process.processStyleName}</div>,
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
