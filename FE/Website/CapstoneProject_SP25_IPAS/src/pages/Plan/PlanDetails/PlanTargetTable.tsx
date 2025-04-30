import { useStyle } from "@/hooks";
import { Table } from "antd";
import style from "./PlanTargetTable.module.scss";

interface PlanTarget {
  type: "Plot" | "Row" | "Plant" | "Plant Lot" | "Grafted Plant";
  plotNames?: string[];
  rowNames?: string[];
  plantNames?: string[];
  plantLotNames?: string[];
  graftedPlantNames?: string[];
}

interface PlanTargetTableProps {
  data: PlanTarget[];
}

const columns = [
  { title: "Unit", dataIndex: "type", key: "type" },
  {
    title: "Plot Name",
    dataIndex: "plotNames",
    key: "plotNames",
    render: (names: string[]) => names?.join(", ") || "-",
  },
  {
    title: "Row Name",
    dataIndex: "rowNames",
    key: "rowNames",
    render: (names: string[]) => names?.join(", ") || "-",
  },
  {
    title: "Plant Name",
    dataIndex: "plantNames",
    key: "plantNames",
    render: (names: string[]) => names?.join(", ") || "-",
  },
  {
    title: "Plant Lot Name",
    dataIndex: "plantLotNames",
    key: "plantLotNames",
    render: (names: string[]) => names?.join(", ") || "-",
  },
  {
    title: "Grafted Plant Name",
    dataIndex: "graftedPlantNames",
    key: "graftedPlantNames",
    render: (names: string[]) => names?.join(", ") || "-",
  },
];

const PlanTargetTable: React.FC<PlanTargetTableProps> = ({ data }) => {
  const { styles } = useStyle();
  console.log("dataaa", data);
  return (
    <div>
      <h3 className={style.planTargetTitle}>Plan Target</h3>
      <Table
        className={`${style.tbl} ${styles.customeTable2}`}
        columns={columns}
        dataSource={data}
        rowKey={(record) => record.type}
      />
    </div>
  );
};

export default PlanTargetTable;
