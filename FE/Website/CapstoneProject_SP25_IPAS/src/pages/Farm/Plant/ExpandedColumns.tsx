import { Farm, TableColumn } from "@/types";
import style from "./PlantList.module.scss";

export const ExpandedColumns: TableColumn<Farm>[] = [
  {
    header: "farmId",
    field: "farmId",
    accessor: (farm) => <div className={style.tableExpandText}>{farm.farmId}</div>,
    width: 150,
  },
  {
    header: "farmName",
    field: "farmName",
    accessor: (farm) => <div className={style.tableExpandText}>{farm.farmName}</div>,
    width: 300,
  },
  {
    header: "farmName",
    field: "farmName",
    accessor: (farm) => <div className={style.tableExpandText}>{farm.farmName}</div>,
    width: 300,
  },
  {
    header: "farmName",
    field: "farmName",
    accessor: (farm) => <div className={style.tableExpandText}>{farm.farmName}</div>,
    width: 300,
  },
  {
    header: "farmName",
    field: "farmName",
    accessor: (farm) => <div className={style.tableExpandText}>{farm.farmName}</div>,
    width: 300,
  },
  {
    header: "location",
    field: "location",
    accessor: (farm) => <div className={style.tableExpandText}>{farm.location}</div>,
    width: 150,
  },
];
