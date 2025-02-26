import { TableColumn } from "@/types";
import style from "./PackageList.module.scss";
import { Tag } from "antd";
import { GetPackage } from "@/payloads/package";

export const packageColumns: TableColumn<GetPackage>[] = [
  {
    header: "Code",
    field: "packageCode",
    accessor: (pkg) => pkg.packageCode,
    width: 150,
  },
  {
    header: "Package Name",
    field: "packageName",
    accessor: (pkg) => <div className={style.tableText}>{pkg.packageName}</div>,
    width: 200,
  },
  {
    header: "Price",
    field: "packagePrice",
    accessor: (pkg) => `$${pkg.packagePrice.toFixed(2)}`,
    width: 120,
  },
  {
    header: "Created Date",
    field: "createDate",
    accessor: (pkg) => (
      <div className={style.tableText}>
        {pkg.createDate ? new Date(pkg.createDate).toLocaleDateString() : "N/A"}
      </div>
    ),
    width: 150,
  },
  {
    header: "Start Date",
    field: "startDate",
    accessor: (pkg) => (
      <div className={style.tableText}>
        {pkg.startDate ? new Date(pkg.startDate).toLocaleDateString() : "N/A"}
      </div>
    ),
    width: 150,
  },
  {
    header: "Duration",
    field: "duration",
    accessor: (pkg) => `${pkg.duration} days`,
    width: 130,
  },
  {
    header: "Status",
    field: "isActive",
    accessor: (pkg) => (
      <Tag color={pkg.isActive ? "green" : "red"}>
        {pkg.isActive ? "Active" : "Inactive"}
      </Tag>
    ),
    width: 120,
  },
];
