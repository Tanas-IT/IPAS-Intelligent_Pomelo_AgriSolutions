import { TableColumn } from "@/types";
import { GetPlantLot2 } from "@/payloads";
import { TableCell } from "@/components";
import { formatDate } from "@/utils";

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
    width: 200,
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
    width: 120,
  },
  {
    header: "Previous Quantity",
    field: "previousQuantity",
    accessor: (item) => <TableCell value={item.previousQuantity} />,
    width: 150,
  },
  {
    header: "Last Quantity",
    field: "lastQuantity",
    accessor: (item) => <TableCell value={item.lastQuantity} />,
    width: 150,
  },
  {
    header: "Note",
    field: "note",
    accessor: (item) => <TableCell value={item.note} />,
    width: 200,
  },
  {
    header: "Imported Date",
    field: "importedDate",
    accessor: (item) => <TableCell value={formatDate(item.importedDate)} />,
    width: 150,
  },
];
