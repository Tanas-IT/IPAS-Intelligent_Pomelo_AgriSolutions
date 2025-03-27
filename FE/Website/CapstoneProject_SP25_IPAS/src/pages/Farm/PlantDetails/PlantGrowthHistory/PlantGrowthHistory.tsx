import style from "./PlantGrowthHistory.module.scss";
import { Avatar, DatePicker, Divider, Flex, Typography } from "antd";
import { Icons, Images } from "@/assets";
import { CustomButton, PlantSectionHeader } from "@/components";
import { useState } from "react";
import { DATE_FORMAT } from "@/utils";
import { Dayjs } from "dayjs";

const { Text } = Typography;
const { RangePicker } = DatePicker;

function PlantGrowthHistory() {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [visibleCount, setVisibleCount] = useState(3); // Số issue hiển thị ban đầu
  const totalIssues = 5; // Tổng số issue

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates && dates[0] && dates[1] ? [dates[0], dates[1]] : null);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 3); // Mỗi lần load thêm 3 issue
  };

  const handleAddNewIssue = () => {};

  return (
    <Flex className={style.contentDetailWrapper}>
      <PlantSectionHeader onAddNewIssue={handleAddNewIssue} />
      <Divider className={style.divider} />
      <Flex className={style.contentSectionBody} vertical>
        <Flex gap={20} className={style.filterSection}>
          <Flex justify="center" align="center" gap={4}>
            <Icons.calendar className={style.icon} />
            <Text strong>Timeline:</Text>
          </Flex>
          <RangePicker
            format={DATE_FORMAT}
            value={dateRange}
            onChange={handleDateChange}
            allowClear
          />
        </Flex>

        {/* 📌 Timeline Issue */}
        <Flex className={style.historyTimeline}>
          {[...Array(totalIssues)].slice(0, visibleCount).map((_, index, arr) => (
            <>
              <Flex key={index} className={style.historyContainer}>
                <Flex className={style.historyWrapper}>
                  <div className={style.historyDot} />
                  <div className={style.historyDash} />
                </Flex>
                <div className={style.timelineDetail}>
                  <Flex gap={10} align="center">
                    <Avatar src={Images.avatar} size={30} shape="circle" />
                    <span className={style.userName}>Nathan David</span>
                    <span>created this note</span>
                    <span className={style.createdDate}>Sunday, 1st Dec 2024, 8:30 AM</span>
                  </Flex>
                  <Flex className={style.infoRow}>
                    <span className={style.label}>Issue:</span>
                    <span className={style.noteContent}>Pest Infestation</span>
                  </Flex>
                  <Flex className={style.infoRow}>
                    <span className={style.label}>Note:</span>
                    <span className={style.noteContent}>
                      Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                      Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
                      when an unknown printer took a ga ......
                    </span>
                  </Flex>
                  <Flex justify="space-between">
                    <Flex className={style.infoRow}>
                      <span className={style.label}>Media:</span>
                      <span>2 Images | 0 Videos</span>
                    </Flex>
                    <CustomButton label="View Details" isCancel={false} isModal={true} />
                  </Flex>
                </div>
              </Flex>
              {index < arr.length - 1 && <Divider className={style.dividerBold} />}
            </>
          ))}
        </Flex>
        {/* Load More Button */}
        {visibleCount < totalIssues && (
          <Flex justify="center" className={style.loadMoreWrapper}>
            <span onClick={handleLoadMore}>Load More</span>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}

export default PlantGrowthHistory;
