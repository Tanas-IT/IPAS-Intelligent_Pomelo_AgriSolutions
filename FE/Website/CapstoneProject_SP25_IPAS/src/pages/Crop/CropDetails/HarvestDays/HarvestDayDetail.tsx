import { Flex, Button, Empty, Table, Tag, Select } from "antd";
import { Icons } from "@/assets";
import style from "./HarvestDays.module.scss";
import { useEffect, useState } from "react";
import {
  GetHarvestDay,
  GetHarvestDayDetail,
  GetPlantHasHarvest,
  productHarvestHistoryRes,
  UpdateProductHarvestRequest,
} from "@/payloads";
import { harvestService } from "@/services";
import {
  ActionMenuHarvest,
  LoadingSkeleton,
  UpdateProductHarvestModal,
  UserAvatar,
} from "@/components";
import { formatCurrencyVND, formatDate, formatDateAndTime } from "@/utils";
import { harvestStatusColors, ROUTES } from "@/constants";
import { useCropStore } from "@/stores";
import { useNavigate } from "react-router-dom";
import { useModal } from "@/hooks";
import { toast } from "react-toastify";

interface HarvestDayDetailProps {
  selectedHarvest: GetHarvestDay | null;
  onBack: () => void;
  actionMenu: React.ReactNode;
}

function HarvestDayDetail({ selectedHarvest, onBack, actionMenu }: HarvestDayDetailProps) {
  const navigate = useNavigate();
  const [harvestData, setHarvestData] = useState<GetHarvestDayDetail | null>(null);
  const [productId, setProductId] = useState<number | null>(null);
  const [plantsHarvested, setPlantsHarvested] = useState<GetPlantHasHarvest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { shouldRefetch } = useCropStore();
  const formModal = useModal<productHarvestHistoryRes>();

  if (!selectedHarvest) return null;
  const resetData = () => {
    setProductId(null);
    setPlantsHarvested([]);
  };

  const fetchHarvest = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const res = await harvestService.getHarvest(selectedHarvest.harvestHistoryId);
      if (res.statusCode === 200) {
        setHarvestData(res.data);
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchHarvest();
  }, [selectedHarvest, shouldRefetch]);

  useEffect(() => {
    if (!productId) return;

    const fetchPlants = async () => {
      const res = await harvestService.getPlantHasHarvest(
        selectedHarvest.harvestHistoryId,
        productId,
      );
      if (res.statusCode === 200) {
        setPlantsHarvested(res.data);
      }
    };

    fetchPlants();
  }, [productId]);

  const handleUpdateProductHarvest = async (values: UpdateProductHarvestRequest) => {
    const res = await harvestService.UpdateProductHarvest(values);
    if (res.statusCode === 200) {
      toast.success(res.message);
      formModal.hideModal();
      await fetchHarvest();
      resetData();
    } else {
      toast.error(res.message);
    }
  };

  if (loading) return <LoadingSkeleton rows={10} />;
  if (!harvestData)
    return (
      <>
        <Flex className={style.detailWrapper} vertical>
          <Flex gap={12} className={style.modalHeader}>
            <Button icon={<Icons.back />} className={style.backButton} onClick={onBack}>
              Back to Harvest
            </Button>
          </Flex>
          <Flex align="center" justify="center">
            <Empty description="No harvest data available" />
          </Flex>
        </Flex>
      </>
    );

  const {
    harvestHistoryCode,
    dateHarvest,
    harvestHistoryNote,
    totalPrice,
    harvestStatus,
    productHarvestHistory,
    carePlanSchedules,
  } = harvestData;

  // Lấy danh sách nhân viên từ work logs của các care plan schedules
  const employeesInHarvest = carePlanSchedules.flatMap((schedule) =>
    schedule.workLogs.flatMap((workLog) => workLog.userWorkLogs),
  );

  return (
    <Flex className={style.detailContainer} vertical>
      {/* Header */}
      <Flex gap={12} className={style.modalHeader}>
        <Flex className={style.modalInfoRow}>
          <Flex className={style.iconLabelContainer}>
            <Icons.description />
            <span className={style.label}>Harvest Code:</span>
          </Flex>
          <Flex justify="space-between" align="center" style={{ width: "100%" }}>
            <Flex gap={20}>
              <p>{harvestHistoryCode}</p>
              <Tag color={harvestStatusColors[harvestStatus] || "default"}>
                {harvestStatus || "Unknown"}
              </Tag>
            </Flex>

            {actionMenu}
          </Flex>
        </Flex>
      </Flex>

      {/* Harvest Info */}
      <Flex className={style.modalInfoRow}>
        <Flex className={style.iconLabelContainer}>
          <Icons.calendar />
          <span className={style.label}>Harvest Date & Time:</span>
        </Flex>
        <p>
          {dateHarvest ? formatDate(dateHarvest) : "N/A"}
          {carePlanSchedules.length > 0 &&
            ` (${carePlanSchedules[0].startTime} - ${carePlanSchedules[0].endTime})`}
        </p>
      </Flex>

      <Flex className={style.modalInfoRow}>
        <Flex className={style.iconLabelContainer}>
          <Icons.money />
          <span className={style.label}>Total Price:</span>
        </Flex>
        <p>{totalPrice ? formatCurrencyVND(totalPrice) : "N/A"}</p>
      </Flex>

      <Flex className={style.modalInfoRow}>
        <Flex className={style.iconLabelContainer}>
          <Icons.description />
          <span className={style.label}>Note:</span>
        </Flex>
        <p>{harvestHistoryNote ? harvestHistoryNote : "N/A"}</p>
      </Flex>

      <Flex className={style.sectionDetails}>
        {/* Employees Involved */}
        <div className={style.detailWrapper}>
          <Flex className={style.titleWrapper}>
            <p className={style.title}>Employees Involved</p>
          </Flex>
          {employeesInHarvest.length > 0 ? (
            <Flex wrap="wrap" gap={20}>
              {employeesInHarvest.map((employee) => (
                <Flex key={employee.userId} align="center" gap={10}>
                  <UserAvatar
                    avatarURL={employee.avatarURL || undefined}
                    fallbackText={employee.fullName}
                    size={40}
                  />
                  <p>
                    {employee.fullName}{" "}
                    {employee.isReporter && (
                      <Tag color="green" className={style.reporterTag}>
                        Reporter
                      </Tag>
                    )}
                  </p>
                </Flex>
              ))}
            </Flex>
          ) : (
            <Empty description="No employees involved" />
          )}
        </div>

        {/* Product Harvest History */}
        <div className={style.detailWrapper}>
          <Flex className={style.titleWrapper}>
            <p className={style.title}>Products Harvested</p>
          </Flex>
          <div className={style.tableWrapper}>
            <Table
              className={style.table}
              dataSource={productHarvestHistory}
              rowKey="productHarvestHistoryId"
              pagination={false}
              columns={[
                {
                  title: "Product",
                  dataIndex: "productName",
                  key: "productName",
                  align: "center",
                },
                {
                  title: "Yield Needed",
                  dataIndex: "quantityNeed",
                  key: "quantityNeed",
                  align: "center",
                  render: (_: any, record: any) => `${record.quantityNeed} ${record.unit}`,
                },
                {
                  title: "Cost Price",
                  dataIndex: "costPrice",
                  key: "costPrice",
                  align: "center",
                  render: (price, record) => `${formatCurrencyVND(price)}/${record.unit}`,
                },
                {
                  title: "Sell Price",
                  dataIndex: "sellPrice",
                  key: "sellPrice",
                  render: (price) => `${price ? formatCurrencyVND(price) : "N/A"}`,
                  align: "center",
                },
                {
                  title: "Action",
                  key: "action",
                  align: "center",
                  render: (item: productHarvestHistoryRes) => (
                    <Button type="dashed" onClick={() => formModal.showModal(item)}>
                      Update
                    </Button>
                  ),
                },
              ]}
            />
          </div>
        </div>

        <div className={style.detailWrapper}>
          <Flex align="center" gap={20} className={style.titleWrapper}>
            <p className={style.title}>Plants Harvested</p>
            <Select
              placeholder="Select Product"
              style={{ width: 240 }}
              options={productHarvestHistory?.map((product) => ({
                value: product.masterTypeId,
                label: product.productName,
              }))}
              value={productId}
              onChange={(value) => setProductId(value)}
              allowClear
            />
          </Flex>

          <div className={style.tableWrapper}>
            <Table
              className={style.table}
              dataSource={plantsHarvested}
              rowKey="productHarvestHistoryId"
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
              }}
              columns={[
                {
                  title: "Plant Name",
                  dataIndex: "plantName",
                  key: "plantName",
                  align: "center",
                },
                {
                  title: "Plant Location",
                  key: "plantIndex",
                  render: (item: GetPlantHasHarvest) =>
                    `${item.lantPlotName} - Row ${item.landRowIndex} - Plant #${item.plantIndex}`,
                  align: "center",
                },

                {
                  title: "Yield",
                  dataIndex: "actualQuantity",
                  key: "actualQuantity",
                  align: "center",
                  render: (_: any, record: { actualQuantity: number; unit: string }) =>
                    `${record.actualQuantity} ${record.unit}`,
                },
                {
                  title: "Record Date",
                  dataIndex: "recordDate",
                  key: "recordDate",
                  align: "center",
                  render: (date: string) => formatDateAndTime(date),
                },
                {
                  title: "Action",
                  key: "action",
                  align: "center",
                  render: (item: GetPlantHasHarvest) => (
                    <Button
                      type="dashed"
                      onClick={() => navigate(ROUTES.FARM_PLANT_DETAIL(item.plantId))}
                    >
                      View Details
                    </Button>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </Flex>
      <UpdateProductHarvestModal
        isOpen={formModal.modalState.visible}
        onClose={formModal.hideModal}
        onSave={(value) => handleUpdateProductHarvest(value)}
        isLoadingAction={loading}
        productHarvest={formModal.modalState.data}
      />
    </Flex>
  );
}

export default HarvestDayDetail;
