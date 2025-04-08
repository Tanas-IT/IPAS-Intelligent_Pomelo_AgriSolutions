import { TableColumn } from "@/types";
import { GetPlant } from "@/payloads";
import { TableCell } from "@/components";
import { formatDate } from "@/utils";
import { Popover, QRCode, Tag } from "antd";
import { healthStatusColors } from "@/constants";

const baseUrl = import.meta.env.VITE_APP_BASE_URL;

export const plantColumns: TableColumn<GetPlant>[] = [
  {
    header: "Code",
    field: "plantCode",
    accessor: (item) => (
      <Popover
        content={<QRCode type="svg" value={`${baseUrl}/farm/plants/${item.plantId}/details`} />}
      >
        <>
          <TableCell value={item.plantCode} isCopyable={true} />
        </>
      </Popover>
    ),
    width: 200,
  },
  {
    header: "Name",
    field: "plantName",
    accessor: (item) => <TableCell value={item.plantName} />,
    width: 180,
  },
  {
    header: "Cultivar",
    field: "masterTypeName",
    accessor: (item) => <TableCell value={item.masterTypeName} />,
    width: 160,
  },
  {
    header: "Health Status",
    field: "healthStatus",
    accessor: (item) => {
      const statusText = item.healthStatus; // Dữ liệu đã là text
      return (
        <Tag color={healthStatusColors[statusText] || "default"}>{statusText || "Unknown"}</Tag>
      );
    },
    width: 180,
  },
  {
    header: "Planting Date",
    field: "plantingDate",
    accessor: (item) => <TableCell value={formatDate(item.plantingDate)} />,
    width: 180,
  },
  {
    header: "Growth Stage",
    field: "growthStageName",
    accessor: (item) => <TableCell value={item.growthStageName} />,
    width: 180,
  },
  {
    header: "Plant Location",
    field: "plantIndex",
    accessor: (item) => (
      <TableCell
        value={
          item.landPlotName && item.rowIndex && item.plantIndex
            ? `${item.landPlotName} - Row ${item.rowIndex} - Plant #${item.plantIndex}`
            : "Not Assigned"
        }
      />
    ),
    width: 200,
  },
];
