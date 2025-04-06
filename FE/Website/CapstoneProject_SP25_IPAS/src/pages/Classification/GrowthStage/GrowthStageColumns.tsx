import { TableColumn } from "@/types";
import { formatDate } from "@/utils";
import { TableCell } from "@/components";
import { GetGrowthStage } from "@/payloads";

export const growthStageColumns: TableColumn<GetGrowthStage>[] = [
  {
    header: "Code",
    field: "growthStageCode",
    accessor: (item) => <TableCell value={item.growthStageCode} isCopyable={true} />,
    width: 160,
  },
  {
    header: "Name",
    field: "growthStageName",
    accessor: (item) => <TableCell value={item.growthStageName} />,
    width: 180,
  },
  {
    header: "Month Range",
    field: "monthAgeStart",
    accessor: (item) => {
      const startYear = (item.monthAgeStart / 12).toFixed(0);
      const endYear = (item.monthAgeEnd / 12).toFixed(0);
      return (
        <TableCell
          value={`${item.monthAgeStart} - ${item.monthAgeEnd} (${startYear} - ${endYear} years)`}
        />
      );
    },
    width: 180,
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
