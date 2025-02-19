import React from "react";
import style from "./TableCell.module.scss";

interface TableCellProps {
  value: string | number | React.ReactNode;
  className?: string; // Truyền class từ ngoài vào nếu cần
}

const TableCell: React.FC<TableCellProps> = ({ value, className }) => {
  return <div className={`${style.tableText} ${className || ""}`.trim()}>{value}</div>;
};

export default TableCell;
