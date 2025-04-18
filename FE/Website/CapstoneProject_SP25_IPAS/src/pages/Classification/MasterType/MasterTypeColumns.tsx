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
    accessor: (item) => <TableCell value={item.masterTypeCode} isCopyable={true} />,
    width: 200,
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
    width: 250,
  },
  {
    header: "Created Date",
    field: "createDate",
    accessor: (item) => <TableCell value={formatDate(item.createDate)} />,
    width: 150,
  },
  {
    header: "Details",
    field: "masterTypeDetailModels",
    isSort: false,
    accessor: (item) => {
      const hasDetails =
        (item.backgroundColor && item.backgroundColor.trim() !== "") ||
        (item.textColor && item.textColor.trim() !== "") ||
        (item.characteristic && item.characteristic.trim() !== "") ||
        (item.isConflict !== null && item.isConflict !== undefined) ||
        (item.target && item.target.trim() !== "") ||
        (item.minTime !== null && item.minTime !== undefined) ||
        (item.maxTime !== null && item.maxTime !== undefined);

      return hasDetails ? (
        <Collapse defaultActiveKey={[]} ghost expandIconPosition="right">
          <Panel header="Type Details" key="1">
            {/* Hiển thị các thông tin nếu có */}
            {item.backgroundColor && (
              <MasterTypeDetailView name="Background Color" value={item.backgroundColor} />
            )}
            {item.textColor && <MasterTypeDetailView name="Text Color" value={item.textColor} />}
            {item.characteristic && (
              <MasterTypeDetailView name="Characteristic" value={item.characteristic} />
            )}
            {item.isConflict !== null && item.isConflict !== undefined && (
              <MasterTypeDetailView name="Is Conflict" value={item.isConflict ? "Yes" : "No"} />
            )}
            {item.target && <MasterTypeDetailView name="Target" value={item.targetDisplay} />}
            {item.maxTime !== null && item.maxTime !== undefined && (
              <MasterTypeDetailView
                name="Time Range"
                value={`${item.minTime} - ${item.maxTime} minutes`}
              />
            )}
          </Panel>
        </Collapse>
      ) : (
        <p>No details available</p>
      );
    },
    width: 280,
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
