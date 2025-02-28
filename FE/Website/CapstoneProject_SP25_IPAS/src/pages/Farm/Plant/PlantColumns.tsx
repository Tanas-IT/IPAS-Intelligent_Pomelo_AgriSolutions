import { TableColumn } from "@/types";
import { GetPlant } from "@/payloads";
import { TableCell } from "@/components";
import { formatDate } from "@/utils";

export const plantColumns: TableColumn<GetPlant>[] = [
  {
    header: "Code",
    field: "plantCode",
    accessor: (item) => <TableCell value={item.plantCode} />,
    width: 160,
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
    accessor: (item) => <TableCell value={item.healthStatus} />,
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
  {
    header: "Description",
    field: "description",
    accessor: (item) => <TableCell value={item.description} />,
    width: 300,
  },
  {
    header: "Created Date",
    field: "createDate",
    accessor: (item) => <TableCell value={formatDate(item.createDate)} />,
    width: 150,
  },
];
