import React from "react";
import style from "./TableCell.module.scss";
import { Typography } from "antd";

interface TableCellProps {
  value: string | number | React.ReactNode;
  className?: string; // Truyền class từ ngoài vào nếu cần
  isCopyable?: boolean;
}

const TableCell: React.FC<TableCellProps> = ({ value, className, isCopyable = false }) => {
  const isEmpty =
    value === undefined || value === null || (typeof value === "string" && value.trim() === "");
  return (
    <Typography.Text
      copyable={isCopyable}
      className={`${style.tableText} ${className || ""}`.trim()}
    >
      {isEmpty ? "N/A" : value}
    </Typography.Text>
  );
};

export default TableCell;
