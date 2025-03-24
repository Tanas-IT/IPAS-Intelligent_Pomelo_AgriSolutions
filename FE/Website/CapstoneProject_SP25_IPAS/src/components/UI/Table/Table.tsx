import { TableColumn } from "@/types";
import { Checkbox, Empty, Flex, notification, Skeleton, Table } from "antd";
import style from "./Table.module.scss";
import { useEffect, useMemo, useState } from "react";
import { Icons } from "@/assets";
import { useStyle } from "@/hooks";
import { ActionBar, Tooltip } from "@/components";
import ExpandableTable from "./ExpandableTable";
import { DEFAULT_ROWS_PER_PAGE } from "@/constants";

interface TableProps<T, E = T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: Extract<keyof T, string>;
  idName?: Extract<keyof T, string>;
  expandedColumns?: TableColumn<E>[];
  expandedRowName?: Extract<keyof T, string>;
  expandedRowKey?: Extract<keyof E, string>;
  idExpandedName?: Extract<keyof E, string>;
  title?: React.ReactNode;
  handleSortClick: (field: string) => void;
  selectedColumn?: string;
  sortDirection?: string;
  rotation: number;
  currentPage?: number;
  rowsPerPage?: number;
  handleDelete?: (ids: number[]) => void;
  onApplyCriteria?: (ids: number[]) => void;
  isLoading: boolean;
  caption: string;
  notifyNoData: string;
  renderAction?: (item: T) => React.ReactNode;
  renderExpandedAction?: (item: E) => React.ReactNode;
  onRowDoubleClick?: (record: T) => void;
  isOnRowEvent?: boolean;
  isViewCheckbox?: boolean;
}
const TableComponent = <T, E = T>({
  columns,
  rows,
  rowKey,
  idName,
  expandedColumns,
  expandedRowName,
  expandedRowKey,
  idExpandedName,
  title,
  handleSortClick,
  selectedColumn,
  sortDirection,
  rotation,
  currentPage = 1,
  rowsPerPage = DEFAULT_ROWS_PER_PAGE,
  handleDelete,
  onApplyCriteria,
  isLoading,
  caption,
  notifyNoData,
  renderAction,
  renderExpandedAction,
  onRowDoubleClick,
  isOnRowEvent = false,
  isViewCheckbox = true,
}: TableProps<T, E>) => {
  const { styles } = useStyle();

  const [selection, setSelection] = useState<string[]>([]);

  const hasSelection = selection.length > 0;

  const allSelected = useMemo(() => {
    if (!hasSelection) return false;

    const totalRows =
      rows.length +
      (expandedRowName
        ? rows.reduce((count, row) => count + ((row[expandedRowName] as E[])?.length || 0), 0)
        : 0);

    return selection.length === totalRows;
  }, [selection, rows, expandedRowName]);

  const toggleAllSelection = (isChecked: boolean) => {
    setSelection(
      isChecked
        ? rows.flatMap((row) => {
            const expandedRows =
              expandedRowName && expandedRowKey
                ? ((row[expandedRowName] as E[]) || []).map(
                    (child: E) => child[expandedRowKey] as string,
                  )
                : [];
            return [row[rowKey] as string, ...expandedRows]; // Thêm cả hàng chính và hàng con
          })
        : [], // Nếu bỏ chọn thì xóa tất cả
    );
  };

  const toggleRowSelection = (rowId: string) => {
    setSelection((prev) =>
      prev.includes(rowId) ? prev.filter((id) => id !== rowId) : [...prev, rowId],
    );
  };

  const toggleMainRowSelection = (rowId: string, rowData?: T) => {
    setSelection((prev) => {
      const isRowSelected = prev.includes(rowId);
      let updatedSelection = isRowSelected
        ? prev.filter((id) => id !== rowId) // Nếu đã chọn, bỏ chọn nó
        : [...prev, rowId]; // Nếu chưa chọn, thêm vào selection

      // Nếu là hàng chính và có hàng con, xử lý hàng con
      if (rowData && expandedRowName && expandedRowKey) {
        const expandedRows = ((rowData[expandedRowName] as E[]) || []).map(
          (child: E) => child[expandedRowKey] as string,
        );

        updatedSelection = isRowSelected
          ? updatedSelection.filter((id) => !expandedRows.includes(id)) // Bỏ chọn tất cả hàng con
          : [...updatedSelection, ...expandedRows]; // Chọn tất cả hàng con
      }

      return updatedSelection;
    });
  };

  useEffect(() => {
    setSelection([]);
  }, [currentPage, rowsPerPage]);

  const getIdFromCode = (code: string): number | undefined => {
    for (const row of rows) {
      if ((row as T)[rowKey] === code) {
        return (row as T)[idName as keyof T] as number;
      }

      // Kiểm tra hàng con (expanded rows)
      if (expandedRowName) {
        const expandedRows = (row[expandedRowName] as E[]) || [];
        for (const child of expandedRows) {
          if (expandedRowKey && (child as E)[expandedRowKey] === code) {
            return (child as E)[idExpandedName as keyof E] as number;
          }
        }
      }
    }
    return undefined;
  };

  const deleteSelectedItems = () => {
    const selectedIds = selection
      .map((code) => getIdFromCode(code))
      .filter((id): id is number => id !== undefined);

    if (handleDelete) {
      handleDelete(selectedIds); // Gửi danh sách các id đã chọn để xóa
    }

    setSelection([]);
  };

  const applyCriteriaSelectedItems = () => {
    const selectedIds = selection
      .map((code) => getIdFromCode(code))
      .filter((id): id is number => id !== undefined);

    if (onApplyCriteria) {
      onApplyCriteria(selectedIds as number[]); // Gửi danh sách các id đã chọn để xóa
    }

    setSelection([]);
  };

  const antColumns = [
    isViewCheckbox && {
      title: (
        <Checkbox
          className={styles.customCheckbox}
          checked={allSelected}
          indeterminate={hasSelection && !allSelected}
          onChange={(e) => toggleAllSelection(e.target.checked)}
        />
      ),
      dataIndex: "id",
      key: "id",
      width: 10,
      render: (text: string, record: T) => (
        <Flex>
          <Checkbox
            className={styles.customCheckbox}
            checked={selection.includes(record[rowKey] as string)}
            onChange={() => toggleMainRowSelection(record[rowKey] as string, record)}
          >
            {/* <span className={style.checkboxNum}>{text}</span> */}
            {text}
          </Checkbox>
        </Flex>
      ),
      fixed: "left",
    },
    ...columns.map((col) => {
      const isSortable = col.isSort === undefined || col.isSort;
      const tooltipText =
        selectedColumn === col.field
          ? sortDirection === "asc"
            ? "Click for Descending"
            : "Click for Ascending"
          : "Not sorted. Click for Ascending";
      return {
        title: (
          <div
            className={`${style.headerTbl} ${isSortable ? style.pointer : ""}`}
            onClick={isSortable ? () => handleSortClick(col.field.toString()) : undefined}
          >
            {isSortable ? (
              <Tooltip title={tooltipText}>
                <Flex className={style.headerCol}>
                  <span className={style.headerTitle}>{col.header}</span>
                  <Flex
                    className={style.iconSort}
                    style={{
                      opacity: selectedColumn === col.field ? 1 : undefined,
                      transform: `rotate(${selectedColumn === col.field ? rotation : 360}deg)`,
                      transition: "transform 0.3s ease-in-out",
                    }}
                  >
                    <Icons.sort />
                  </Flex>
                </Flex>
              </Tooltip>
            ) : (
              <span className={style.headerTitle}>{col.header}</span>
            )}
          </div>
        ),
        dataIndex: col.field,
        key: col.field,
        align: "center",
        width: col.width,
        render: (text: string, record: T) => col.accessor(record) ?? "N/A",
      };
    }),
    renderAction && {
      key: "actions",
      align: "center",
      render: (text: string, record: T) => renderAction(record),
      fixed: "right",
      width: 10,
    },
  ].filter(Boolean);

  const dataSource = rows.map((row, index) => ({
    ...row,
    key: row[rowKey] as string,
    id: (currentPage - 1) * rowsPerPage + index + 1,
  }));

  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  return (
    <>
      <Table
        className={`${style.tbl} ${styles.customTable}`}
        title={title ? () => title : undefined}
        // dataSource={isInitialLoad && isLoading ? [] : dataSource}
        dataSource={dataSource}
        expandable={
          expandedColumns && expandedRowName && expandedRowKey
            ? {
                expandedRowRender: (record) => (
                  <ExpandableTable
                    expandColumns={expandedColumns as TableColumn<any>[]}
                    expandRows={record[expandedRowName] as any[]}
                    rowKey={expandedRowKey}
                    parentIndex={dataSource.findIndex((r) => r[rowKey] === record[rowKey]) + 1}
                    selection={selection}
                    toggleRowSelection={toggleRowSelection}
                    renderAction={renderExpandedAction}
                  />
                ),
                rowExpandable: (record) => {
                  const field = record[expandedRowName];
                  return Array.isArray(field) && field.length > 0;
                },
              }
            : undefined
        }
        columns={antColumns as any}
        footer={() => <div className={styles.customTable}>{caption}</div>}
        pagination={false}
        loading={isLoading}
        locale={{
          emptyText: isLoading ? <Skeleton active /> : <Empty description={notifyNoData} />,
        }}
        // rowClassName={(record) =>
        //   selection.includes(record[rowKey] as string) ? style.selectedRow : ""
        // }
        rowClassName={(record) =>
          `${selection.includes(record[rowKey] as string) ? style.selectedRow : ""} ${
            isOnRowEvent ? style.clickableRow : ""
          }`
        }
        onRow={(record) =>
          isOnRowEvent
            ? {
                onDoubleClick: () => {
                  if (onRowDoubleClick) {
                    onRowDoubleClick(record);
                  }
                },
                onMouseMove: (event) => {
                  setTooltipVisible(true);
                  setTooltipPosition({ x: event.clientX, y: event.clientY });
                },
                onMouseLeave: () => {
                  setTooltipVisible(false);
                },
              }
            : {}
        }
        scroll={{ x: "max-content", y: 74 * 5 }}
      />
      {isOnRowEvent && tooltipVisible && (
        <div
          className={style.tooltipCustom}
          style={{
            left: tooltipPosition.x + 14,
            top: tooltipPosition.y + 14,
          }}
        >
          Double click to view details
        </div>
      )}

      <ActionBar
        selectedCount={selection.length}
        deleteSelectedItems={deleteSelectedItems}
        {...(onApplyCriteria && { onApplyCriteria: applyCriteriaSelectedItems })}
      />
    </>
  );
};
export default TableComponent;
