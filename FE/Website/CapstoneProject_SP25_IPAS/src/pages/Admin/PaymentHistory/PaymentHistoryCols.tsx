import { TableColumn } from "@/types";
import { TableCell } from "@/components";
import { formatCurrencyVND, formatDate } from "@/utils";
import { GetPaymentHistory } from "@/payloads";
import { Tag } from "antd";
import { paymentStatusColors } from "@/constants";

export const PaymentHistoryCols: TableColumn<GetPaymentHistory>[] = [
  {
    header: "Code",
    field: "orderCode",
    accessor: (item) => <TableCell value={item.orderCode} isCopyable={true} />,
    width: 200,
  },
  {
    header: "Name",
    field: "orderName",
    accessor: (item) => <TableCell value={item.orderName} />,
    width: 200,
  },
  {
    header: "Farm Name",
    field: "farmName",
    accessor: (item) => <TableCell value={item.farmName} />,
    width: 150,
  },
  {
    header: "Total Price",
    field: "totalPrice",
    accessor: (item) => <TableCell value={formatCurrencyVND(item.totalPrice)} />,
    width: 150,
  },
  {
    header: "Status",
    field: "status",
    accessor: (item) => {
      const statusText = item.status; // Dữ liệu đã là text
      return (
        <Tag color={paymentStatusColors[statusText] || "default"}>{statusText || "Unknown"}</Tag>
      );
    },
    width: 150,
  },
  {
    header: "Order Date",
    field: "orderDate",
    accessor: (item) => <TableCell value={formatDate(item.orderDate)} />,
    width: 150,
  },
  {
    header: "Enrolled Date",
    field: "enrolledDate",
    accessor: (item) => <TableCell value={formatDate(item.enrolledDate)} />,
    width: 150,
  },
  {
    header: "Expired Date",
    field: "expiredDate",
    accessor: (item) => <TableCell value={formatDate(item.expiredDate)} />,
    width: 150,
  },
  {
    header: "Package Name",
    field: "package.packageName",
    accessor: (item) => <TableCell value={item.package.packageName} />,
    width: 150,
  },
  {
    header: "Note",
    field: "notes",
    accessor: (item) => <TableCell value={item.notes} />,
    width: 150,
  },
];
