import { TableColumn } from "@/types";
import style from "./PlanList.module.scss";
import { Tag } from "antd";
import { GetPlan } from "@/payloads/plan";
import { TableCell } from "@/components";

export const planColumns: TableColumn<GetPlan>[] = [
    {
      header: "Plan Code",
      field: "planCode",
      accessor: (plan) => <TableCell value={plan.planCode} isCopyable={true} />,
      width: 150,
    },
    {
      header: "Plan Name",
      field: "planName",
      accessor: (plan) => <div className={style.tableText}>{plan.planName}</div>,
      width: 150,
    },
    {
      header: "Plan Detail",
      field: "planDetail",
      accessor: (plan) => <div className={style.tableText}>{plan.planDetail}</div>,
      width: 300,
    },
    {
      header: "Growth Stage",
      field: "growthStages",
      accessor: (plan) => <div className={style.tableText}>{plan.growthStages.map((p) => p.name)}</div>,
      width: 300,
    },
    {
      header: "Created Date",
      field: "createDate",
      accessor: (plan) => <div className={style.tableText}>{plan.createDate ? new Date(plan.createDate).toLocaleDateString() : "N/A"}</div>,
      width: 150,
    },
    {
      header: "Start Date",
      field: "startDate",
      accessor: (plan) => <div className={style.tableText}>{plan.createDate ? new Date(plan.startDate).toLocaleDateString() : "N/A"}</div>,
      width: 150,
    },
    {
      header: "End Date",
      field: "endDate",
      accessor: (plan) => <div className={style.tableText}>{plan.createDate ? new Date(plan.endDate).toLocaleDateString() : "N/A"}</div>,
      width: 150,
    },
    {
      header: "Status",
      field: "isActive",
      accessor: (plan) => (
        <Tag color={plan.isActive ? "green" : "red"}>
          {plan.isActive ? "Active" : "Inactive"}
        </Tag>
      ),
      width: 170,
    },
    {
      header: "Frequency",
      field: "frequency",
      accessor: (plan) => <div className={style.tableText}>{plan.frequency}</div>,
      width: 150,
    },
  ];
