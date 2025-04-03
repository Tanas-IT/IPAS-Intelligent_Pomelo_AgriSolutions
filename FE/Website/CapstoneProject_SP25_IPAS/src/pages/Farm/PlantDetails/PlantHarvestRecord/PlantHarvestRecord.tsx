import { LoadingSkeleton, PlantSectionHeader, TimelineFilter } from "@/components";
import { Divider, Empty, Flex, Select } from "antd";
import style from "./PlantHarvestRecord.module.scss";
import { useEffect, useState } from "react";
import { Dayjs } from "dayjs";
import { formatDayMonthAndTime } from "@/utils";
import { GetPlantRecord } from "@/payloads";
import { DEFAULT_RECORDS_IN_DETAIL, MASTER_TYPE } from "@/constants";
import { useDirtyStore, usePlantStore } from "@/stores";
import { plantService } from "@/services";
import { useMasterTypeOptions } from "@/hooks";

function PlantHarvestRecord() {
  const { plant } = usePlantStore();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const { options: productOptions } = useMasterTypeOptions(MASTER_TYPE.PRODUCT);
  const [productFilter, setProductFilter] = useState<number>();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const visibleCount = DEFAULT_RECORDS_IN_DETAIL;
  const [data, setData] = useState<GetPlantRecord[]>([]);
  const [totalIssues, setTotalIssues] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  if (!plant) return;

  const fetchData = async () => {
    if (isFirstLoad || isLoading) await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const res = await plantService.getPlantRecordHarvest(
        plant.plantId,
        visibleCount,
        currentPage,
        dateRange?.[0]?.format("YYYY-MM-DD"),
        dateRange?.[1]?.format("YYYY-MM-DD"),
        productFilter,
      );
      if (res.statusCode === 200) {
        setData((prevData) => (currentPage > 1 ? [...prevData, ...res.data.list] : res.data.list));
        setTotalIssues(res.data.totalRecord);
      }
    } finally {
      setIsLoading(false);
      setIsFirstLoad(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, dateRange, productFilter, isLoading]);

  const handleResetData = async () => {
    setData([]);
    setIsLoading(true);
    setCurrentPage(1);
  };

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates && dates[0] && dates[1] ? [dates[0], dates[1]] : null);
    handleResetData();
  };

  const handleProductChange = (value: number) => {
    setProductFilter(value);
    handleResetData();
  };

  if (isFirstLoad) return <LoadingSkeleton rows={10} />;
  return (
    <Flex className={style.contentDetailWrapper}>
      <PlantSectionHeader />
      <Divider className={style.divider} />
      <Flex className={style.contentSectionBody} vertical>
        <Flex gap={20}>
          <TimelineFilter dateRange={dateRange} onDateChange={handleDateChange} />
          <Select
            placeholder="Select Product"
            value={productFilter}
            onChange={handleProductChange}
            allowClear
            style={{ width: 150 }}
            options={productOptions}
          />
        </Flex>

        <Flex className={style.historyTimeline}>
          {isLoading ? (
            <LoadingSkeleton rows={5} />
          ) : data.length === 0 ? (
            <Flex justify="center" align="center" style={{ width: "100%" }}>
              <Empty description="No Record Data Available" />
            </Flex>
          ) : (
            data.map((record, index) => (
              <>
                <Flex key={index} className={style.historyContainer}>
                  <Flex className={style.historyWrapper}>
                    <div className={style.historyDot} />
                    <div className={style.historyDash} />
                  </Flex>
                  <div className={style.timelineDetail}>
                    <Flex gap={10} align="center">
                      <span className={style.userName}>{record.recordBy}</span>
                      <span>recorded a harvest</span>
                      <span className={style.createdDate}>
                        {formatDayMonthAndTime(record.recordDate)}
                      </span>
                    </Flex>
                    <Flex className={style.infoRow}>
                      <span className={style.label}>Crop Name:</span>
                      <span className={style.noteContent}>{record.cropName}</span>
                    </Flex>
                    <Flex className={style.infoRow}>
                      <span className={style.label}>Product Name:</span>
                      <span className={style.noteContent}>{record.productName}</span>
                    </Flex>
                    <Flex className={style.infoRow}>
                      <span className={style.label}>Yield:</span>
                      <span className={style.noteContent}>
                        {record.actualQuantity} {record.unit}
                      </span>
                    </Flex>
                  </div>
                </Flex>
                {index < data.length - 1 && <Divider className={style.dividerBold} />}
              </>
            ))
          )}
        </Flex>

        {/* Load More Button */}
        {data.length !== totalIssues && (
          <Flex justify="center" className={style.loadMoreWrapper}>
            <span onClick={() => setCurrentPage((prev) => prev + 1)}>Load More</span>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}
export default PlantHarvestRecord;
