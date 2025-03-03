import { TableColumn } from "@/types";
import { formatDate } from "@/utils";
import { TableCell } from "@/components";
import { GetGrowthStage } from "@/payloads";

export const growthStageColumns: TableColumn<GetGrowthStage>[] = [
  {
    header: "Code",
    field: "growthStageCode",
    accessor: (item) => <TableCell value={item.growthStageCode} />,
    width: 160,
  },
  {
    header: "Name",
    field: "growthStageName",
    accessor: (item) => <TableCell value={item.growthStageName} />,
    width: 180,
  },
  {
    header: "From Month",
    field: "monthAgeStart",
    accessor: (item) => <TableCell value={item.monthAgeStart} />,
    width: 150,
  },
  {
    header: "To Month",
    field: "monthAgeEnd",
    accessor: (item) => <TableCell value={item.monthAgeEnd} />,
    width: 150,
  },
  {
    header: "Stage Actions",
    field: "activeFunction",
    accessor: (item) => <TableCell value={item.activeFunction} />,
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
