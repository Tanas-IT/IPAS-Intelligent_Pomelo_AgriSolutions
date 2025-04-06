import { TableColumn } from "@/types";
import { GetGraftedPlant } from "@/payloads";
import { TableCell } from "@/components";
import { formatDate } from "@/utils";
import { Popover, QRCode, Tag } from "antd";
import { healthStatusColors } from "@/constants";
const baseUrl = import.meta.env.VITE_APP_BASE_URL;

export const GraftedPlantColumns: TableColumn<GetGraftedPlant>[] = [
  {
    header: "Code",
    field: "graftedPlantCode",
    accessor: (item) => (
      <Popover
        content={
          <QRCode
            type="svg"
            value={`${baseUrl}/farm/grafted-plants/${item.graftedPlantId}/details`}
          />
        }
      >
        <>
          <TableCell value={item.graftedPlantCode} isCopyable={true} />
        </>
      </Popover>
    ),
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
    header: "Status",
    field: "status",
    accessor: (item) => {
      const statusText = item.status; // Dữ liệu đã là text
      return (
        <Tag color={healthStatusColors[statusText] || "default"}>{statusText || "Unknown"}</Tag>
      );
    },
    width: 150,
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
  {
    header: "Mother Plant",
    field: "plantName",
    accessor: (item) => <TableCell value={item.plantName} />,
    width: 180,
  },
  {
    header: "Destination Lot",
    field: "plantLotName",
    accessor: (item) => <TableCell value={item.plantLotName} />,
    width: 180,
  },
  {
    header: "Grafted Date",
    field: "graftedDate",
    accessor: (item) => <TableCell value={item.graftedDate && formatDate(item.graftedDate)} />,
    width: 180,
  },
  {
    header: "Separated Date",
    field: "separatedDate",
    accessor: (item) => <TableCell value={item.separatedDate && formatDate(item.separatedDate)} />,
    width: 180,
  },
  {
    header: "Note",
    field: "note",
    accessor: (item) => <TableCell value={item.note} />,
    width: 180,
  },
];
