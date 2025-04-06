import { TableColumn } from "@/types";
import { GetHarvestDay } from "@/payloads";
import { formatCurrencyVND, formatDate } from "@/utils";
import { TableCell } from "@/components";
import { Tag } from "antd";
import { harvestStatusColors } from "@/constants";

export const HarvestDayColumns: TableColumn<GetHarvestDay>[] = [
  {
    header: "Code",
    field: "harvestHistoryCode",
    accessor: (item) => <TableCell value={item.harvestHistoryCode} isCopyable={true} />,
    width: 250,
  },
  {
    header: "Harvest Date",
    field: "dateHarvest",
    accessor: (item) => {
      const schedule = item.carePlanSchedules?.[0]; // Lấy lịch đầu tiên nếu có
      return (
        <TableCell
          value={`${formatDate(item.dateHarvest)} ${
            schedule?.startTime ? `(${schedule.startTime} - ${schedule.endTime})` : ""
          }`}
        />
      );
    },
    width: 250,
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
    accessor: (item) => <TableCell value={formatCurrencyVND(item.totalPrice)} />,
    width: 200,
  },
  {
    header: "Note",
    field: "harvestHistoryNote",
    accessor: (item) => <TableCell value={item.harvestHistoryNote} />,
    width: 200,
  },
];
