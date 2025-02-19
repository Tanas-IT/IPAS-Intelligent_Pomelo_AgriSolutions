import { TableColumn } from "@/types";
import { GetMasterType } from "@/payloads";
import { formatDate } from "@/utils";
import { TableCell } from "@/components";
import { Collapse, Tag } from "antd";
import { MasterTypeDetailView } from "./MasterTypeDetailView";
const { Panel } = Collapse;

export const masterTypeColumns: TableColumn<GetMasterType>[] = [
  {
    header: "Code",
    field: "masterTypeCode",
    accessor: (item) => <TableCell value={item.masterTypeCode} />,
    width: 150,
  },
  {
    header: "Name",
    field: "masterTypeName",
    accessor: (item) => <TableCell value={item.masterTypeName} />,
    width: 150,
  },
  {
    header: "Type",
    field: "typeName",
    accessor: (item) => <TableCell value={item.typeName} />,
    width: 150,
  },
  {
    header: "Description",
    field: "masterTypeDescription",
    accessor: (item) => <TableCell value={item.masterTypeDescription} />,
    width: 300,
  },
  {
    header: "Created Date",
    field: "createDate",
    accessor: (item) => <TableCell value={formatDate(item.createDate)} />,
    width: 150,
  },
  {
    header: "Details", // Thêm cột chi tiết
    field: "masterTypeDetailModels",
    accessor: (item) =>
      item.masterTypeDetailModels && item.masterTypeDetailModels.length > 0 ? (
        <Collapse defaultActiveKey={[]} ghost expandIconPosition="right">
          <Panel header="Type Details" key="1">
            {item.masterTypeDetailModels.map((detail) => (
              <MasterTypeDetailView key={detail.masterTypeDetailId} masterTypeDetail={detail} />
            ))}
          </Panel>
        </Collapse>
      ) : (
        <p>No details available</p> // Nếu không có chi tiết, có thể hiển thị thông báo hoặc bỏ qua
      ),
    width: 300,
  },
  {
    header: "Active Status",
    field: "isActive",
    accessor: (item) => (
      <Tag color={item.isActive ? "green" : "red"}>{item.isActive ? "Active" : "Inactive"}</Tag>
    ),
    width: 150,
  },
];
