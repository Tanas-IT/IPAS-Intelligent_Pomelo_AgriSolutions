import { TableColumn } from "@/types";
import { GetTag } from "@/payloads";
import { TableCell } from "@/components";

export const TagManagementCols: TableColumn<GetTag>[] = [
  // {
  //   header: "Code",
  //   field: "tagId",
  //   accessor: (item) => <TableCell value={item.tagId} isCopyable={true} />,
  //   width: 200,
  // },
  {
    header: "Tag Name",
    field: "name",
    accessor: (item) => <TableCell value={item.name} />,
    width: 250,
  },
  {
    header: "Type",
    field: "type",
    accessor: (item) => <TableCell value={item.type} />,
    width: 180,
  },
  {
    header: "Image Count",
    field: "imageCount",
    accessor: (item) => <TableCell value={item.imageCount} />,
    width: 150,
  },
];
