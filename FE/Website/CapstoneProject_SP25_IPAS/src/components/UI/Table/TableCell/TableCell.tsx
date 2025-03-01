import React from "react";
import style from "./TableCell.module.scss";

interface TableCellProps {
  value: string | number | React.ReactNode;
  className?: string; // Truyền class từ ngoài vào nếu cần
}

const TableCell: React.FC<TableCellProps> = ({ value, className }) => {
  const isEmpty =
    value === undefined || value === null || (typeof value === "string" && value.trim() === "");
  return (
    <div className={`${style.tableText} ${className || ""}`.trim()}> {isEmpty ? "N/A" : value}</div>
  );
};

export default TableCell;
