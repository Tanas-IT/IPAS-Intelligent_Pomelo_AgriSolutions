import { Flex, Button, Empty, Table, Tag } from "antd";
import { Icons } from "@/assets";
import style from "./HarvestDays.module.scss";
import { useEffect, useState } from "react";
import { GetHarvestDay, GetHarvestDayDetail } from "@/payloads";
import { harvestService } from "@/services";
import { ActionMenuHarvest, LoadingSkeleton, UserAvatar } from "@/components";
import { formatCurrencyVND, formatDate } from "@/utils";
import { harvestStatusColors } from "@/constants";
import { useCropStore } from "@/stores";

interface HarvestDayDetailProps {
  selectedHarvest: GetHarvestDay | null;
  onBack: () => void;
  actionMenu: React.ReactNode;
}

function HarvestDayDetail({ selectedHarvest, onBack, actionMenu }: HarvestDayDetailProps) {
  const [harvestData, setHarvestData] = useState<GetHarvestDayDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { shouldRefetch } = useCropStore();
  if (!selectedHarvest) return null;

  useEffect(() => {
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

    fetchHarvest();
  }, [selectedHarvest, shouldRefetch]);

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
    yieldHasRecord,
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
        <p>{formatCurrencyVND(totalPrice)}</p>
      </Flex>

      <Flex className={style.modalInfoRow}>
        <Flex className={style.iconLabelContainer}>
          <Icons.description />
          <span className={style.label}>Note:</span>
        </Flex>
        <p>{harvestHistoryNote ? harvestHistoryNote : "N/A"}</p>
      </Flex>

      <Flex className={style.sectionDetails}>
        {/* Product Harvest History */}
        <div className={style.detailWrapper}>
          <p className={style.title}>Products Harvested</p>
          <Table
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
                title: "Quantity Needed",
                dataIndex: "quantityNeed",
                key: "quantityNeed",
                align: "center",
              },
              {
                title: "Sell Price",
                dataIndex: "sellPrice",
                key: "sellPrice",
                render: (price) => `${formatCurrencyVND(price)}`,
                align: "center",
              },
              {
                title: "Unit",
                dataIndex: "unit",
                key: "unit",
                align: "center",
              },
            ]}
          />
        </div>

        {/* Employees Involved */}
        <div className={style.detailWrapper}>
          <p className={style.title}>Employees Involved</p>
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
      </Flex>
    </Flex>
  );
}

export default HarvestDayDetail;
