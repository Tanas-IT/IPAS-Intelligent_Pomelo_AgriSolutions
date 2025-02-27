import { TableColumn } from "@/types";
import { GetPlant } from "@/payloads";
import style from "./PlantList.module.scss";
import { TableCell } from "@/components";

export const plantColumns: TableColumn<GetPlant>[] = [
  {
    header: "Code",
    field: "plantCode",
    accessor: (item) => <TableCell value={item.plantCode} />,
    width: 150,
  },
  {
    header: "Code",
    field: "plantCode",
    accessor: (item) => <TableCell value={item.plantCode} />,
    width: 150,
  },
];
