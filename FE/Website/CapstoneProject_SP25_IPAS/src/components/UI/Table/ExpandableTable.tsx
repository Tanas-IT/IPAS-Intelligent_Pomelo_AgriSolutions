import React from "react";
import { Table, Checkbox, Flex, notification } from "antd";
import { TableColumn } from "@/types";
import { useStyle } from "@/hooks";
import style from "./Table.module.scss";

interface ExpandableTableProps<E extends Record<string, any>> {
  expandColumns: TableColumn<E>[];
  expandRows: E[];
  rowKey: Extract<keyof E, string>;
  parentIndex: number;
  selection: string[];
  toggleRowSelection: (rowId: string) => void;
  renderAction?: (item: E) => React.ReactNode;
}

const ExpandableTable = <E extends Record<string, any>>({
  expandColumns,
  expandRows,
  rowKey,
  parentIndex,
  selection,
  toggleRowSelection,
  renderAction,
}: ExpandableTableProps<E>) => {
  const { styles } = useStyle();

  const antColumns = [
    {
      dataIndex: "id",
      key: "id",
      render: (text: string, record: E) => (
        <Flex>
          <Checkbox
            className={styles.customCheckbox}
            style={{ fontSize: "13px" }}
            checked={selection.includes(record[rowKey] as string)}
            onChange={() => toggleRowSelection(record[rowKey] as string)}
          >
            {text}
          </Checkbox>
        </Flex>
      ),
      width: 10,
      fixed: "left",
    },
    ...expandColumns.map((col) => ({
      title: (
        <div className={`${style.headerExpandTbl}`}>
          <Flex className={style.headerCol}>
            <span className={style.headerTitle}>{col.header}</span>
          </Flex>
        </div>
      ),
      dataIndex: col.field,
      key: col.field,
      align: "center",
      width: col.width,
      render: (text: string, record: E) => col.accessor(record) ?? "N/A",
    })),
    renderAction && {
      key: "actions",
      align: "center",
      render: (text: string, record: E) => renderAction(record),
      fixed: "right",
      width: 10,
    },
  ].filter(Boolean);

  const expandDataSource = expandRows.map((row, index) => ({
    ...row,
    key: row[rowKey] as string,
    id: `${parentIndex}.${index + 1}`,
  }));

  return (
    <Table
      className={`${styles.customExpandTable}`}
      dataSource={expandDataSource}
      columns={antColumns as any}
      pagination={false}
      rowClassName={(record) =>
        selection.includes(record[rowKey] as string) ? style.selectedRow : ""
      }
      scroll={{ x: "max-content" }}
    />
  );
};

export default ExpandableTable;
