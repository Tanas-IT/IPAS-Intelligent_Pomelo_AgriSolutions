import { Table } from "antd";
import style from "./CriteriaProductTable.module.scss";
import { GetCriteria } from "@/payloads";

interface CriteriaProductTableProps {
  data: GetCriteria[];
}

const CriteriaProductTable: React.FC<CriteriaProductTableProps> = ({ data }) => {
  const columns = [
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      align: "center" as const,
    },
    {
      title: "Name",
      dataIndex: "criteriaName",
      key: "criteriaName",
      align: "center" as const,
      width: 200,
    },
    {
      title: "Description",
      dataIndex: "criteriaDescription",
      key: "criteriaDescription",
      align: "center" as const,
      width: 300,
    },
    {
      title: "Min Value",
      dataIndex: "minValue",
      key: "minValue",
      align: "center" as const,
      width: 120,
    },
    {
      title: "Max Value",
      dataIndex: "maxValue",
      key: "maxValue",
      align: "center" as const,
      width: 120,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      align: "center" as const,
    },
    {
      title: "Check Interval Days ",
      dataIndex: "frequencyDate",
      key: "frequencyDate",
      align: "center" as const,
    },
  ].filter((col): col is Exclude<typeof col, null> => col !== null);

  return (
    <div className={style.criteriaTableWrapper}>
      <Table
        className={style.criteriaTable}
        columns={columns}
        dataSource={data}
        pagination={false}
        bordered
        rowKey="criteriaId"
      />
    </div>
  );
};

export default CriteriaProductTable;
