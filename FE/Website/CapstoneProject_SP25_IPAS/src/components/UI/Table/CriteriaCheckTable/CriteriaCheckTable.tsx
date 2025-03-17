import { useStyle } from "@/hooks";
import { Table, Checkbox } from "antd";
import style from "./CriteriaCheckTable.module.scss";
import { GetCriteriaCheck } from "@/payloads";

interface CriteriaCheckTableProps {
  data: GetCriteriaCheck[];
  isConditionCompleted: boolean;
  hasCompleteCheck?: boolean;
  hasPassCheck?: boolean;
  handleCompletedChange: (criteriaId: number, checked: boolean) => void;
}

const CriteriaCheckTable: React.FC<CriteriaCheckTableProps> = ({
  data,
  isConditionCompleted,
  hasCompleteCheck = false,
  hasPassCheck = false,
  handleCompletedChange,
}) => {
  const { styles } = useStyle();

  const columns = [
    {
      title: "#",
      key: "index",
      align: "center" as const,
      render: (_: any, __: any, rowIndex: number) => rowIndex + 1,
    },
    {
      title: "Name",
      dataIndex: "criteriaName",
      key: "criteriaName",
      align: "center" as const,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      align: "center" as const,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      align: "center" as const,
    },
    hasCompleteCheck
      ? {
          title: "Is Completed",
          key: "isChecked",
          align: "center" as const,
          render: (_: any, record: GetCriteriaCheck) => (
            <Checkbox
              className={styles.customCheckbox}
              checked={record.isChecked}
              disabled={isConditionCompleted}
              onChange={(e) => handleCompletedChange(record.criteriaId, e.target.checked)}
            />
          ),
        }
      : null,
    hasPassCheck
      ? {
          title: "Pass",
          key: "isPass",
          align: "center" as const,
          render: (_: any, record: GetCriteriaCheck) => (
            <Checkbox
              className={styles.customCheckbox}
              checked={record.isPassed}
              disabled={isConditionCompleted}
              onChange={() => handleCompletedChange(record.criteriaId, true)}
            />
          ),
        }
      : null,
    hasPassCheck
      ? {
          title: "Not Pass",
          key: "notPass",
          align: "center" as const,
          render: (_: any, record: GetCriteriaCheck) => (
            <Checkbox
              className={styles.customCheckbox}
              checked={!record.isPassed}
              disabled={isConditionCompleted}
              onChange={() => handleCompletedChange(record.criteriaId, false)}
            />
          ),
        }
      : null,
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

export default CriteriaCheckTable;
