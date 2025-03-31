import { TableColumn } from "@/types";
import { GetHarvestDay } from "@/payloads";
import { formatDate } from "@/utils";
import { TableCell } from "@/components";
import { Tag } from "antd";
import { harvestStatusColors } from "@/constants";

export const HarvestDayColumns: TableColumn<GetHarvestDay>[] = [
  {
    header: "Code",
    field: "harvestHistoryCode",
    accessor: (item) => <TableCell value={item.harvestHistoryCode} isCopyable={true} />,
    width: 200,
  },
  {
    header: "Harvest Date",
    field: "dateHarvest",
    accessor: (item) => <TableCell value={formatDate(item.dateHarvest)} />,
    width: 150,
  },
  {
    header: "Harvest Status",
    field: "harvestStatus",
    accessor: (item) => {
      const statusText = item.harvestStatus;
      return (
        <Tag color={harvestStatusColors[statusText] || "default"}>{statusText || "Unknown"}</Tag>
      );
    },
    width: 150,
  },
  {
    header: "Total Price",
    field: "totalPrice",
    accessor: (item) => <TableCell value={item.totalPrice} />,
    width: 200,
  },
  {
    header: "Note",
    field: "harvestHistoryNote",
    accessor: (item) => <TableCell value={item.harvestHistoryNote} />,
    width: 200,
  },
];
