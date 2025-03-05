import { Checkbox, Divider, Flex, Form, Select, Table, Typography } from "antd";
import {
  GetLandRow,
  GetPlant,
  landRowDetail,
  landRowSimulate,
  PlantRequest,
  plantSimulate,
} from "@/payloads";
import { LoadingSkeleton, ModalForm } from "@/components";
const { Text } = Typography;
import style from "./LandRow.module.scss";
import { useEffect, useState } from "react";
import { landRowService, plantService } from "@/services";
import { formatDate } from "@/utils";

type ViewPlantsModalProps = {
  rowId: number | undefined;
  isOpen: boolean;
  onClose: () => void;
};

const ViewPlantsModal = ({ rowId, isOpen, onClose }: ViewPlantsModalProps) => {
  if (!rowId) return;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rowData, setRowData] = useState<landRowDetail>();

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        setIsLoading(true);
        const res = await landRowService.getPlantInRow(rowId);
        if (res.statusCode === 200) {
          setRowData(res.data);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlants();
  }, []);

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={onClose}
      onSave={onClose}
      title={`View Plants`}
      noCancel={true}
      saveLabel="Close"
      size="largeXL"
    >
      <Flex vertical gap={20}>
        {/* Header hiển thị thông tin hàng */}
        <Flex gap={8} className={style.rowHeader} justify="space-between">
          <Flex gap={12} className={style.rowInfo}>
            <Text className={style.rowLabel}>Location:</Text>
            <div className={style.rowValueWrapper}>
              <Text>{`${rowData?.landPlotname} (Row ${rowData?.rowIndex})`}</Text>
            </div>
          </Flex>

          <Flex gap={12} className={style.rowInfo}>
            <Text className={style.rowLabel}>Plants in Row:</Text>
            <div className={style.rowValueWrapper}>
              <Text className={style.plantCount}>
                {rowData?.indexUsed}/ {rowData?.treeAmount}
              </Text>
            </div>
          </Flex>
        </Flex>

        {/* Bảng danh sách cây chưa có vị trí */}
        {isLoading ? (
          <LoadingSkeleton rows={10} />
        ) : (
          <Table
            dataSource={rowData?.plants}
            rowKey="plantId"
            pagination={{ pageSize: 5 }}
            columns={[
              { title: "Plant Code", dataIndex: "plantCode" },
              { title: "Cultivar", dataIndex: "masterTypeName" },
              {
                title: "Planting Date",
                dataIndex: "plantingDate",
                render: (date) => formatDate(date),
              },
              { title: "Growth Stage", dataIndex: "plantCode" },
              { title: "Health Status", dataIndex: "healthStatus" },
            ]}
          />
        )}
      </Flex>
    </ModalForm>
  );
};

export default ViewPlantsModal;
