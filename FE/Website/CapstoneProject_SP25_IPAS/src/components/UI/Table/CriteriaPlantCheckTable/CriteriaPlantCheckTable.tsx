import { useStyle } from "@/hooks";
import { Table, Checkbox, InputNumber } from "antd";
import style from "./CriteriaPlantCheckTable.module.scss";
import { GetCriteriaCheck } from "@/payloads";
import { formatDateAndTime } from "@/utils";

interface CriteriaPlantCheckTableProps {
  data: GetCriteriaCheck[];
  target: string;
  handleValueCheckChange: (criteriaId: number, valueCheck: number) => void;
}

const CriteriaPlantCheckTable: React.FC<CriteriaPlantCheckTableProps> = ({
  data,
  target,
  handleValueCheckChange,
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
      // width: 350,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      align: "center" as const,
    },
    {
      title: "Min Value",
      dataIndex: "minValue",
      key: "minValue",
      align: "center" as const,
      width: 100,
    },
    {
      title: "Max Value",
      dataIndex: "maxValue",
      key: "maxValue",
      align: "center" as const,
      width: 100,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      align: "center" as const,
    },
    {
      title: "Value Check",
      dataIndex: "valueChecked",
      key: "valueChecked",
      align: "center" as const,
      render: (_: any, record: GetCriteriaCheck, index: number) => (
        <InputNumber
          placeholder="Enter number..."
          value={record.valueChecked ?? null}
          //   readOnly={(isCondition && !!lot.inputQuantity) || (!isCondition && !!lot.lastQuantity)}
          onChange={(value) => handleValueCheckChange(record.criteriaId, value ?? 0)}
          min={0}
        />
      ),
      width: 100,
    },
    {
      title: "Check Date",
      dataIndex: "checkedDate",
      key: "checkedDate",
      align: "center" as const,
      render: (_: any, record: GetCriteriaCheck) =>
        record.checkedDate ? formatDateAndTime(record.checkedDate) : "-",
    },
    {
      title: "Check Interval Days ",
      dataIndex: "frequencyDate",
      key: "frequencyDate",
      align: "center" as const,
    },
    {
      title: "Is Passed",
      key: "isPassed",
      align: "center" as const,
      width: 100,
      render: (_: any, record: GetCriteriaCheck) => (
        <Checkbox className={styles.customCheckbox} checked={record.isPassed} disabled />
      ),
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

export default CriteriaPlantCheckTable;
