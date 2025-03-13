import { TableColumn } from "@/types";
import { GetPlantLot2 } from "@/payloads";
import { TableCell } from "@/components";
import { formatDate } from "@/utils";
import { Tag } from "antd";

export const PlantLotColumns: TableColumn<GetPlantLot2>[] = [
  {
    header: "Code",
    field: "plantLotCode",
    accessor: (item) => <TableCell value={item.plantLotCode} isCopyable={true} />,
    width: 180,
  },
  {
    header: "Name",
    field: "plantLotName",
    accessor: (item) => <TableCell value={item.plantLotName} />,
    width: 150,
  },
  {
    header: "Provider",
    field: "partnerName",
    accessor: (item) => <TableCell value={item.partnerName} />,
    width: 150,
  },
  {
    header: "Unit",
    field: "unit",
    accessor: (item) => <TableCell value={item.unit} />,
    width: 100,
  },
  {
    header: "Initial Quantity",
    field: "previousQuantity",
    accessor: (item) => <TableCell value={item.previousQuantity} />,
    width: 160,
  },
  {
    header: "Checked  Quantity",
    field: "inputQuantity",
    // accessor: (item) => <TableCell value={item.inputQuantity} />,
    accessor: (item) => (
      <TableCell value={!item.inputQuantity ? "Checking..." : item.inputQuantity} />
    ),
    width: 160,
  },
  {
    header: "Qualified Quantity",
    field: "lastQuantity",
    // accessor: (item) => <TableCell value={item.lastQuantity} />,
    accessor: (item) => <TableCell value={!item.lastQuantity ? "Checking..." : item.lastQuantity} />,
    width: 160,
  },
  {
    header: "Assigned Quantity",
    field: "usedQuantity",
    accessor: (item) => <TableCell value={item.usedQuantity} />,
    width: 160,
  },
  {
    header: "Seeding Name",
    field: "seedingName",
    accessor: (item) => <TableCell value={item.seedingName} />,
    width: 180,
  },
  {
    header: "Note",
    field: "note",
    accessor: (item) => <TableCell value={item.note} />,
    width: 200,
  },
  {
    header: "Completed",
    field: "isPassed",
    accessor: (item) => (
      <Tag color={item.isPassed ? "green" : "red"}>
        {item.isPassed ? "Completed" : "Not Completed"}
      </Tag>
    ),
    width: 120,
  },
  {
    header: "Imported Date",
    field: "importedDate",
    accessor: (item) => <TableCell value={formatDate(item.importedDate)} />,
    width: 150,
  },
];
