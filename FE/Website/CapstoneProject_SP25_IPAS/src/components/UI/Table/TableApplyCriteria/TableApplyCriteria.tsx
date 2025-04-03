import { Table, InputNumber } from "antd";
import style from "./TableApplyCriteria.module.scss";
import { Icons } from "@/assets";

type TableApplyCriteriaProps = {
  dataSource: any[];
  handleDelete: (key: number) => void;
  handlePriorityChange: (key: number, value: number | null) => void;
};

const TableApplyCriteria = ({
  dataSource,
  handleDelete,
  handlePriorityChange,
}: TableApplyCriteriaProps) => {
  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      align: "center" as const,
      render: (text: number) => <a>{text}</a>,
    },
    {
      title: "Name",
      dataIndex: "criteriaName",
      key: "criteriaName",
      align: "center" as const,
    },
    {
      title: "Description",
      dataIndex: "criteriaDescription",
      key: "criteriaDescription",
      align: "center" as const,
    },
    {
      title: "Min Value",
      dataIndex: "minValue",
      key: "minValue",
      align: "center" as const,
    },
    {
      title: "Max Value",
      dataIndex: "maxValue",
      key: "maxValue",
      align: "center" as const,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      align: "center" as const,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      align: "center" as const,
      render: (_: any, record: { key: number; priority: number }) => (
        <InputNumber
          className={style.priorityNumber}
          min={1}
          value={record.priority}
          onChange={(value) => handlePriorityChange(record.key, value)}
        />
      ),
    },
    {
      title: "Check Interval Days ",
      dataIndex: "frequencyDate",
      key: "frequencyDate",
      align: "center" as const,
      // render: (_: any, record: { key: number; frequencyDate: number }) => (
      //   <InputNumber
      //     className={style.priorityNumber}
      //     min={1}
      //     value={record.frequencyDate}
      //     onChange={(value) => handlePriorityChange(record.key, value)}
      //   />
      // ),
    },
    {
      title: "Action",
      key: "action",
      align: "center" as const,
      render: (_: any, record: { key: number }) => (
        <span className={style.actionIcon} onClick={() => handleDelete(record.key)}>
          <Icons.delete />
        </span>
      ),
    },
  ];

  return (
    <div className={style.criteriaTableWrapper}>
      <Table
        className={style.criteriaTable}
        dataSource={dataSource}
        columns={columns}
        rowKey="id"
        pagination={false}
      />
    </div>
  );
};

export default TableApplyCriteria;
