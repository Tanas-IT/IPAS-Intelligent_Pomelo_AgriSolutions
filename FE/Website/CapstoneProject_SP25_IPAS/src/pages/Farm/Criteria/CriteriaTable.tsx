import { Table } from "antd";
import style from "./Criteria.module.scss";
import { GetCriteria } from "@/payloads";
import { CRITERIA_TARGETS } from "@/constants";
import { useStyle } from "@/hooks";

const columns = [
  {
    title: "#",
    dataIndex: "index",
    key: "index",
    align: "center" as const,
    render: (_: any, __: any, rowIndex: number) => rowIndex + 1,
  },
  {
    title: "Code",
    dataIndex: "criteriaCode",
    key: "criteriaCode",
    align: "center" as const,
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
    render: (text: string) => (text?.trim() ? text : "N/A"),
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
  },
  {
    title: "Check Interval Days",
    dataIndex: "frequencyDate",
    key: "frequencyDate",
    align: "center" as const,
  },
];

const CriteriaTable = ({ criteria }: { criteria: GetCriteria[] }) => {
  const { styles } = useStyle();

  return (
    <div className={style.criteriaTableWrapper}>
      <Table
        className={`${style.criteriaTable} ${styles.customeTable2}`}
        columns={columns}
        dataSource={criteria.map((c) => ({ ...c, key: c.criteriaId }))}
        pagination={false}
        bordered
      />
    </div>
  );
};
export default CriteriaTable;
