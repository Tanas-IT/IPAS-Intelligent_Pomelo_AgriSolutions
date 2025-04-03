import { ColumnsType } from "antd/es/table";
import { Collapse, Typography, Flex } from "antd";
import { formatDate } from "@/utils";
import { GetGraftedPlantHistory, GraftedPlant } from "@/payloads";
import style from "./PlantGraftedHistory.module.scss";

const { Text } = Typography;
const { Panel } = Collapse;

export const columns: ColumnsType<GetGraftedPlantHistory> = [
  {
    title: "Grafted Date",
    dataIndex: "graftedDate",
    key: "graftedDate",
    align: "center",
    render: (date: string) => formatDate(date),
  },
  {
    title: "Initial Quantity",
    dataIndex: "totalBranches",
    key: "totalBranches",
    align: "center",
  },
  {
    title: "Grafted Quantity",
    dataIndex: "completedCount",
    key: "completedCount",
    align: "center",
  },
  {
    title: "Grafted Branch Names",
    dataIndex: "listGrafted",
    key: "listGrafted",
    align: "center",
    width: 400,
    render: (listGrafted: GraftedPlant[]) => (
      <Collapse ghost>
        <Panel header={<Text strong>View Branches ({listGrafted.length})</Text>} key="1">
          <div className={style.graftedList}>
            {listGrafted.map((graft, index) => (
              <Flex key={index} justify="space-between" align="center" className={style.graftedRow}>
                <Text>{graft.name}</Text>
                <Text strong>{graft.status}</Text>
                <Text type={graft.isCompleted ? "success" : "danger"}>
                  {graft.isCompleted ? "Completed" : "Not Completed"}
                </Text>
              </Flex>
            ))}
          </div>
        </Panel>
      </Collapse>
    ),
  },
];
