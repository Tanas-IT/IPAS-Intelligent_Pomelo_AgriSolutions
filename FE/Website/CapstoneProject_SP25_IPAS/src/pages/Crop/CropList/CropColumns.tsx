import { TableColumn } from "@/types";
import { GetCrop2 } from "@/payloads";
import { TableCell } from "@/components";
import { formatCurrencyVND, formatDate } from "@/utils";
import { Tag } from "antd";

export const CropColumns: TableColumn<GetCrop2>[] = [
  {
    header: "Code",
    field: "cropCode",
    accessor: (item) => <TableCell value={item.cropCode} isCopyable={true} />,
    width: 200,
  },
  {
    header: "Name",
    field: "cropName",
    accessor: (item) => <TableCell value={item.cropName} />,
    width: 180,
  },
  {
    header: "Harvest Season",
    field: "harvestSeason",
    accessor: (item) => <TableCell value={item.harvestSeason} />,
    width: 150,
  },
  {
    header: "Crop Duration",
    field: "startDate",
    accessor: (item) => (
      <TableCell value={`${formatDate(item.startDate)} - ${formatDate(item.endDate)}`} />
    ),
    width: 300,
  },
  {
    header: "Crop Expected Time",
    field: "cropExpectedTime",
    accessor: (item) => <TableCell value={formatDate(item.cropExpectedTime)} />,
    width: 150,
  },
  // {
  //   header: "Crop Actual Time",
  //   field: "cropActualTime",
  //   accessor: (item) => <TableCell value={formatDate(item.cropActualTime)} />,
  //   width: 150,
  // },
  {
    header: "Status",
    field: "status",
    accessor: (item) => <TableCell value={item.status} />,
    width: 120,
  },
  {
    header: "Estimate Yield",
    field: "estimateYield",
    accessor: (item) => <TableCell value={item.estimateYield ? `${item.estimateYield} kg` : ""} />,
    width: 150,
  },

  // {
  //   header: "Actual Yield",
  //   field: "actualYield",
  //   accessor: (item) => <TableCell value={item.actualYield ? `${item.actualYield} kg` : ""} />,
  //   width: 150,
  // },

  // {
  //   header: "Notes",
  //   field: "notes",
  //   accessor: (item) => <TableCell value={item.notes} />,
  //   width: 200,
  // },
  {
    header: "Market Price",
    field: "marketPrice",
    accessor: (item) => <TableCell value={formatCurrencyVND(item.marketPrice)} />,
    width: 150,
  },
  {
    header: "Number of Harvests",
    field: "numberHarvest",
    accessor: (item) => <TableCell value={item.numberHarvest} />,
    width: 180,
  },
  {
    header: "Number of Plots",
    field: "numberPlot",
    accessor: (item) => <TableCell value={item.numberPlot} />,
    width: 180,
  },
];
