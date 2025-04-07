import { TableColumn } from "@/types";
import { GetCriteria, GetProduct } from "@/payloads";
import { formatDate } from "@/utils";
import { TableCell } from "@/components";
import { Collapse, Tag } from "antd";

export const expandedColumns: TableColumn<GetCriteria>[] = [
  {
    header: "Code",
    field: "criteriaCode",
    accessor: (item) => <TableCell value={item.criteriaCode} isCopyable={true} />,
    width: 200,
  },
  {
    header: "Name",
    field: "criteriaDescription",
    accessor: (item) => <TableCell value={item.criteriaDescription} />,
    width: 150,
  },
  {
    header: "Description",
    field: "criteriaDescription",
    accessor: (item) => <TableCell value={item.criteriaDescription} />,
    width: 150,
  },
  {
    header: "Priority",
    field: "priority",
    accessor: (item) => <TableCell value={item.priority} />,
    width: 250,
  },
  {
    header: "Check Interval Days",
    field: "frequencyDate",
    accessor: (item) => <TableCell value={item.frequencyDate} />,
    width: 150,
  },
];
