import React from "react";
import { Flex } from "antd";
import { landRowSimulate } from "@/payloads";
import { RowItemEdit, RowItemView } from "@/components";

interface RowListProps {
  plotId?: number;
  rowsData: landRowSimulate[];
  rowsPerLine: number;
  rowSpacing: number;
  lineSpacing: number;
  isHorizontal: boolean;
  isEditing?: boolean;
  moveRow?: (dragIndex: number, hoverIndex: number) => void;
  setIsPanning?: React.Dispatch<React.SetStateAction<boolean>>;
  onRowClick?: (row: landRowSimulate) => void;
}

const RowList: React.FC<RowListProps> = ({
  plotId,
  rowsData,
  rowsPerLine,
  rowSpacing,
  lineSpacing,
  isHorizontal,
  isEditing = true,
  moveRow,
  setIsPanning,
  onRowClick,
}) => {
  const renderRows = () => {
    const groupedRows = [];
    for (let i = 0; i < rowsData.length; i += rowsPerLine) {
      groupedRows.push(
        <Flex key={i} style={{ marginBottom: `${lineSpacing}px` }} justify="flex-start">
          {rowsData
            .slice(i, i + rowsPerLine)
            .map((row, index) =>
              isEditing ? (
                <RowItemEdit
                  key={row.landRowId}
                  rowSpacing={rowSpacing}
                  row={row}
                  index={i + index}
                  isHorizontal={isHorizontal}
                  moveRow={isEditing ? moveRow : undefined}
                  setIsPanning={isEditing ? setIsPanning : undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                />
              ) : (
                <RowItemView
                  plotId={plotId ?? 0}
                  key={row.landRowId}
                  rowSpacing={rowSpacing}
                  row={row}
                  isHorizontal={isHorizontal}
                />
              ),
            )}
        </Flex>,
      );
    }
    return groupedRows;
  };

  return <>{renderRows()}</>;
};

export default RowList;
