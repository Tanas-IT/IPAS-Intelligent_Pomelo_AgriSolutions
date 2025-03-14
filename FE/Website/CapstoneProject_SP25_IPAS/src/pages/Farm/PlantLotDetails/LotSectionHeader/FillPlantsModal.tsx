import { Card, Checkbox, Divider, Flex, Form, Select, Table, Typography } from "antd";
import { GetLandRow, GetPlant, PlantRequest, plantSimulate } from "@/payloads";
import { CustomButton, ModalForm } from "@/components";
const { Text } = Typography;
import style from "./LotSectionHeader.module.scss";
import { useEffect, useState } from "react";
import { plantService } from "@/services";
import { usePlantLotStore } from "@/stores";
import { formatDate } from "@/utils";

type FillPlantsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: PlantRequest) => void;
  isLoadingAction?: boolean;
};

const fakeLots = Array.from({ length: 5 }, (_, index) => ({
  plantLotCode: `LOT-00${index + 1}`,
  plantLotName: `Plant Lot ${index + 1}`,
  lastQuantity: Math.floor(Math.random() * 50) + 10, // Random từ 10-60
}));

const FillPlantsModal = ({ isOpen, onClose, onSave, isLoadingAction }: FillPlantsModalProps) => {
  const [lotList, setLotList] = useState(fakeLots);
  const { lot, setLot, shouldRefetch } = usePlantLotStore();

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSave={() => {}}
      isLoading={isLoadingAction}
      title={`Add Plants `}
      saveLabel="Apply"
      size="largeXL"
    >
      <Flex vertical gap={20} className={style.fillPlantsModal}>
        {/* Thông tin lô hiện tại */}
        <Card className={style.lotInfoCard} size="small">
          <Flex vertical gap={8} className={style.lotInfoCardContent}>
            <Text className={style.lotTitle}>
              {lot?.plantLotName} ({lot?.plantLotCode})
            </Text>

            <Flex className={style.lotStats}>
              <Text>
                ✅ Remaining: <strong>{lot?.lastQuantity}</strong> {lot?.unit}
              </Text>
              <Text>
                🌱 Used: <strong>{lot?.usedQuantity ?? 0}</strong> {lot?.unit}
              </Text>
            </Flex>
          </Flex>
        </Card>

        {/* Bảng danh sách cây chưa có vị trí */}
        <div className={style.tableWrapper}>
          <Table
            className={style.table}
            dataSource={lotList}
            pagination={false}
            columns={[
              {
                title: "#",
                key: "index",
                align: "center" as const,
                render: (_: any, __: any, rowIndex: number) => rowIndex + 1,
              },
              { title: "Lot  Code", dataIndex: "plantLotCode" },
              { title: "Lot  Code", dataIndex: "plantLotName" },
              { title: "Empty Quantity", dataIndex: "lastQuantity", align: "center" },
              {
                title: "Action",
                align: "center" as const,
                render: () => <CustomButton label="Fill Plants" height="24px" fontSize="14px" />,
              },
            ]}
          />
        </div>
      </Flex>

      {/* Hiển thị gợi ý vị trí còn trống */}
      <div className={style.availablePositions}>
        <Text strong>⚠️ Available Positions:</Text>
        {/* <Flex wrap="wrap" gap={8} className={style.positionGrid}>
          {getAvailablePositions().map((pos) => (
            <div key={pos} className={style.gridItem}>
              ⚠️ {pos}
            </div>
          ))}
        </Flex> */}
      </div>
    </ModalForm>
  );
};

export default FillPlantsModal;
