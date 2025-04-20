import { TableColumn } from "@/types";
import { GetFarmInfo } from "@/payloads";
import { TableCell, UserAvatar } from "@/components";
import { formatDate } from "@/utils";
import { Flex, Tag } from "antd";

export const FarmColumns: TableColumn<GetFarmInfo>[] = [
  {
    header: "Code",
    field: "farmCode",
    accessor: (item) => <TableCell value={item.farmCode} isCopyable={true} />,
    width: 200,
  },
  {
    header: "Farm Name",
    field: "farmName",
    accessor: (item) => (
      <Flex justify="flex-start" align="center" gap={12}>
        <UserAvatar avatarURL={item?.logoUrl} size={50} shape="square" />
        <Flex justify="center" style={{ width: "100%" }}>
          <TableCell value={item.farmName} />
        </Flex>
      </Flex>
    ),
    width: 220,
  },
  {
    header: "Owner",
    field: "owner.email",
    accessor: (item) => (
      <TableCell
        value={
          item.owner ? (
            <Flex vertical>
              <div>{item.owner.fullName}</div>
              <div style={{ color: "#888" }}>{item.owner.email}</div>
            </Flex>
          ) : (
            <div>N/A</div>
          )
        }
      />
    ),
    isSort: false,
    width: 200,
  },
  {
    header: "Full Address",
    field: "address",
    accessor: (item) => (
      <TableCell value={`${item.address}, ${item.ward}, ${item.district}, ${item.province}`} />
    ),
    width: 350,
  },
  {
    header: "Expired Date",
    field: "farmExpiredDate",
    accessor: (item) => <TableCell value={formatDate(item.farmExpiredDate)} />,
    width: 150,
  },
  {
    header: "Status",
    field: "status",
    accessor: (item) => <Tag color={item.status === "Active" ? "green" : "red"}>{item.status}</Tag>,
    width: 150,
  },
  {
    header: "Area (m²)",
    field: "area",
    accessor: (item) => <TableCell value={item.area} />,
    width: 100,
  },
  {
    header: "Soil Type",
    field: "soilType",
    accessor: (item) => <TableCell value={item.soilType} />,
    width: 150,
  },
  {
    header: "Climate Zone",
    field: "climateZone",
    accessor: (item) => <TableCell value={item.climateZone} />,
    width: 150,
  },
  {
    header: "Description",
    field: "description",
    accessor: (item) => <TableCell value={item.description} />,
    width: 150,
  },
  {
    header: "Create Date",
    field: "createDate",
    accessor: (item) => <TableCell value={formatDate(item.createDate)} />,
    width: 150,
  },
];
