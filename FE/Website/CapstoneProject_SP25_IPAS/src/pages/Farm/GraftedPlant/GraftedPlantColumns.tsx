import { TableColumn } from "@/types";
import { GetGraftedPlant } from "@/payloads";
import { TableCell } from "@/components";
import { formatDate } from "@/utils";
import { Tag } from "antd";
import { healthStatusColors } from "@/constants";

export const GraftedPlantColumns: TableColumn<GetGraftedPlant>[] = [
  {
    header: "Code",
    field: "graftedPlantCode",
    accessor: (item) => <TableCell value={item.graftedPlantCode} isCopyable={true} />,
    width: 200,
  },
  {
    header: "Name",
    field: "graftedPlantName",
    accessor: (item) => <TableCell value={item.graftedPlantName} />,
    width: 160,
  },
  {
    header: "Cultivar",
    field: "cultivarName",
    accessor: (item) => <TableCell value={item.cultivarName} />,
    width: 160,
  },
  {
    header: "Health Status",
    field: "status",
    accessor: (item) => {
      const statusText = item.status; // Dữ liệu đã là text
      return (
        <Tag color={healthStatusColors[statusText] || "default"}>{statusText || "Unknown"}</Tag>
      );
    },
    width: 180,
  },
  {
    header: "Mother Plant",
    field: "plantCode",
    accessor: (item) => <TableCell value={item.plantCode} />,
    width: 160,
  },
  {
    header: "Separated Date",
    field: "separatedDate",
    accessor: (item) => <TableCell value={formatDate(item.separatedDate)} />,
    width: 180,
  },
  {
    header: "Grafted Date",
    field: "graftedDate",
    accessor: (item) => <TableCell value={item.graftedDate && formatDate(item.graftedDate)} />,
    width: 180,
  },
  {
    header: "Note",
    field: "note",
    accessor: (item) => <TableCell value={item.note} />,
    width: 180,
  },
  {
    header: "Completed",
    field: "isCompleted",
    accessor: (item) => (
      <Tag color={item.isCompleted ? "green" : "red"}>
        {item.isCompleted ? "Completed" : "Not Completed"}
      </Tag>
    ),
    width: 120,
  },
];
