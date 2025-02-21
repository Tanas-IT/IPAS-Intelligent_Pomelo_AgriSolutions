import React from "react";
import style from "./TableExpandCell.module.scss";

interface TableExpandCellProps {
  value: string | number | React.ReactNode;
  className?: string; // Truyền class từ ngoài vào nếu cần
}

const TableExpandCell: React.FC<TableExpandCellProps> = ({ value, className }) => {
  return <div className={`${style.tableExpandText} ${className || ""}`.trim()}>{value}</div>;
};
export default TableExpandCell;
