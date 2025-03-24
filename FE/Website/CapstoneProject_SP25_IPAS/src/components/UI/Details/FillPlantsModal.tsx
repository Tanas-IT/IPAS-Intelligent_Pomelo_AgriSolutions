import { Card, Flex, Select, Table, Typography } from "antd";
import { GetLandPlotHaveEmptyPlant, PlantRequest } from "@/payloads";
import { ConfirmModal, CustomButton, ModalForm } from "@/components";
const { Text } = Typography;
import style from "./Details.module.scss";
import { useEffect, useState } from "react";
import { landPlotService, plantLotService } from "@/services";
import { usePlantLotStore } from "@/stores";
import { useGrowthStageOptions, useModal } from "@/hooks";
import { toast } from "react-toastify";

type FillPlantsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: PlantRequest) => void;
  isLoadingAction?: boolean;
};

const FillPlantsModal = ({ isOpen, onClose, onSave, isLoadingAction }: FillPlantsModalProps) => {
  const [plotList, setPlotList] = useState<GetLandPlotHaveEmptyPlant[]>();
  const { lot, setLot, markForRefetch } = usePlantLotStore();
  const confirmModal = useModal<{ plotId: number }>();
  const { options } = useGrowthStageOptions();
  const [selectedStage, setSelectedStage] = useState<number | undefined>();

  useEffect(() => {
    if (isOpen && options.length > 0) setSelectedStage(Number(options[0].value));
  }, [isOpen, options]);

  const fetchPlotHaveEmptyPlant = async () => {
    const res = await landPlotService.getLandPlotHaveEmptyPlant();
    if (res.statusCode === 200) {
      setPlotList(res.data);
    }
  };

  useEffect(() => {
    fetchPlotHaveEmptyPlant();
  }, []);

  const handleConfirm = (plotId: number) => {
    if (lot?.usedQuantity === lot?.lastQuantity) {
      toast.error("You have filled all available plants from this lot.");
    } else {
      confirmModal.showModal({ plotId });
    }
  };

  const handleFillPlants = async () => {
    const plotId = Number(confirmModal.modalState.data?.plotId);
    if (!plotId || !lot || !selectedStage) return;
    const res = await plantLotService.fillPlantToPlot(plotId, lot.plantLotId, selectedStage);
    if (res.statusCode === 200 && res.data) {
      toast.success(res.message);
      confirmModal.hideModal();
      setLot(res.data);
      await fetchPlotHaveEmptyPlant();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <>
      <ModalForm
        isOpen={isOpen}
        onClose={onClose}
        onSave={onClose}
        isLoading={isLoadingAction}
        title={`Distribute Plants from Lot`}
        saveLabel="Close"
        noCancel
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
                  ✅ Remaining:{" "}
                  <strong>{(lot?.lastQuantity ?? 0) - (lot?.usedQuantity ?? 0)}</strong>{" "}
                  {lot?.unit ?? ""}
                </Text>
                <Text>
                  🌱 Used: <strong>{lot?.usedQuantity ?? 0}</strong> {lot?.unit}
                </Text>
                <Flex align="center" gap={10}>
                  <Text strong>Growth Stage:</Text>
                  <Select
                    options={options}
                    value={selectedStage}
                    onChange={(value) => setSelectedStage(value)}
                    placeholder="Select growth stage"
                    style={{ width: 240 }}
                  />
                </Flex>
              </Flex>
            </Flex>
          </Card>

          {/* Bảng danh sách cây chưa có vị trí */}
          <div className={style.tableWrapper}>
            <Table
              className={style.table}
              dataSource={plotList}
              pagination={false}
              columns={[
                {
                  title: "#",
                  key: "index",
                  align: "center" as const,
                  render: (_: any, __: any, rowIndex: number) => rowIndex + 1,
                },
                { title: "Plot  Code", dataIndex: "landPlotCode" },
                { title: "Plot  Name", dataIndex: "landPlotName" },
                { title: "Empty Quantity", dataIndex: "emptySlot" },
                { title: "Description", dataIndex: "description" },
                { title: "Target Market", dataIndex: "targetMarket" },
                {
                  title: "Action",
                  align: "center" as const,
                  render: (_: any, record: GetLandPlotHaveEmptyPlant) => (
                    <CustomButton
                      label="Fill Plants"
                      height="24px"
                      fontSize="14px"
                      handleOnClick={() => handleConfirm(Number(record.landPlotId))}
                    />
                  ),
                },
              ]}
            />
          </div>
        </Flex>

        <div className={style.instructions}>
          <Text strong>⚠️ Planting Instructions: </Text>
          <Text type="secondary">
            You can fill plants into the available plots until the <strong>Used</strong> quantity
            matches the <strong>Remaining</strong> quantity in this lot. If there are still
            remaining plants, you can continue filling until all slots are occupied.
          </Text>
        </div>
      </ModalForm>
      <ConfirmModal
        visible={confirmModal.modalState.visible}
        onConfirm={() => handleFillPlants()}
        onCancel={confirmModal.hideModal}
        title="Confirm Plant Allocation"
        description="Are you sure you want to allocate plants from this lot to the selected plot? You can continue filling until the remaining quantity reaches zero."
      />
    </>
  );
};

export default FillPlantsModal;
