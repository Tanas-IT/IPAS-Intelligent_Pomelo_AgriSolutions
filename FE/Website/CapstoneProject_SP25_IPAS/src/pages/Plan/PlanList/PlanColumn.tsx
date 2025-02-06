import { TableColumn } from "@/types";
import style from "./PlanList.module.scss";
import { Tag } from "antd";
import { GetPlan } from "@/payloads/plan";

export const planColumns: TableColumn<GetPlan>[] = [
    {
      header: "Plan Code",
      field: "planCode",
      accessor: (plan) => plan.planCode,
      width: 150,
    },
    {
      header: "Plan Detail",
      field: "planDetail",
      accessor: (plan) => <div className={style.tableText}>{plan.planDetail}</div>,
      width: 300,
    },
    {
      header: "Created Date",
      field: "createDate",
      accessor: (plan) => <div className={style.tableText}>{plan.createDate.toLocaleDateString()}</div>,
      width: 150,
    },
    {
      header: "Start Date",
      field: "startDate",
      accessor: (plan) => <div className={style.tableText}>{plan.startDate.toLocaleDateString()}</div>,
      width: 150,
    },
    {
      header: "End Date",
      field: "endDate",
      accessor: (plan) => <div className={style.tableText}>{plan.endDate.toLocaleDateString()}</div>,
      width: 150,
    },
    {
      header: "Responsible By",
      field: "responsibleBy",
      accessor: (plan) => <div className={style.tableText}>{plan.responsibleBy}</div>,
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
