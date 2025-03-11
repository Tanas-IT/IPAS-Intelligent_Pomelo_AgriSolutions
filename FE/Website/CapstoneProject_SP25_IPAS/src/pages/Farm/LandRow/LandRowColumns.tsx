import { TableColumn } from "@/types";
import { GetLandRow } from "@/payloads";
import { TableCell } from "@/components";
import { formatDate } from "@/utils";

export const LandRowColumns: TableColumn<GetLandRow>[] = [
  {
    header: "Code",
    field: "landRowCode",
    accessor: (item) => <TableCell value={item.landRowCode} isCopyable={true} />,
    width: 250,
  },
  {
    header: "Row Identifier",
    field: "landRowCode",
    accessor: (item) => <TableCell value={`${item.landPlotname} (Row ${item.rowIndex})`} />,
    width: 250,
  },
  {
    header: "Plants Per Row",
    field: "treeAmount",
    accessor: (item) => <TableCell value={<span>🌳 {item.treeAmount}</span>} />,
    width: 180,
  },
  {
    header: "Plant Spacing",
    field: "distance",
    accessor: (item) => <TableCell value={item.distance} />,
    width: 180,
  },
  {
    header: "Status",
    field: "status",
    accessor: (item) => <TableCell value={item.status} />,
    width: 150,
  },
  {
    header: "Description",
    field: "description",
    accessor: (item) => <TableCell value={item.description} />,
    width: 200,
  },
  {
    header: "Created Date",
    field: "createDate",
    accessor: (item) => <TableCell value={formatDate(item.createDate)} />,
    width: 150,
  },
];
