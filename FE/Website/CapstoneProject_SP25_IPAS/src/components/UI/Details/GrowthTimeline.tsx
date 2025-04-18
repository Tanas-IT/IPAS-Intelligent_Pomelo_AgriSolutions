import { Divider, Empty, Flex } from "antd";
import { Icons } from "@/assets";
import { LoadingSkeleton, UserAvatar } from "@/components";
import { formatDayMonthAndTime } from "@/utils";
import style from "./Details.module.scss";

interface GrowthTimelineProps<T extends { [key: string]: any }> {
  data: T[];
  idKey: keyof T;
  isLoading: boolean;
  totalIssues: number;
  onLoadMore: () => void;
  onViewDetail: (item: T) => void;
  onDelete: (id: number) => void;
}

const GrowthTimeline = <T extends { [key: string]: any }>({
  data,
  idKey,
  isLoading,
  totalIssues,
  onLoadMore,
  onViewDetail,
  onDelete,
}: GrowthTimelineProps<T>) => {
  return (
    <Flex className={style.historyTimeline}>
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : data.length === 0 ? (
        <Flex justify="center" align="center" style={{ width: "100%" }}>
          <Empty description="No Growth History Data Available" />
        </Flex>
      ) : (
        data.map((item, index) => (
          <>
            <Flex key={index} className={style.historyContainer} onClick={() => onViewDetail(item)}>
              <Flex className={style.historyWrapper}>
                <div className={style.historyDot} />
                <div className={style.historyDash} />
              </Flex>
              <div className={style.timelineDetail}>
                <Flex gap={10} align="center">
                  <UserAvatar avatarURL={item?.noteTakerAvatar} size={30} />
                  <span className={style.userName}>{item.noteTakerName}</span>
                  <span>created this note</span>
                  <span className={style.createdDate}>
                    {formatDayMonthAndTime(item.createDate)}
                  </span>
                </Flex>
                <Flex className={style.infoRow}>
                  <span className={style.label}>Issue:</span>
                  <span className={style.noteContent}>{item.issueName}</span>
                </Flex>
                <Flex className={style.infoRow}>
                  <span className={style.label}>Note:</span>
                  <span className={style.noteContent}>{item.content}</span>
                </Flex>
                <Flex justify="space-between">
                  <Flex className={style.infoRow}>
                    <span className={style.label}>Media:</span>
                    <span>
                      {item.numberImage} Images | {item.numberVideos} Videos
                    </span>
                  </Flex>
                  <Icons.delete
                    className={style.iconEdit}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete((item as any)[idKey]);
                    }}
                  />
                </Flex>
              </div>
            </Flex>
            {index < data.length - 1 && <Divider className={style.dividerBold} />}
          </>
        ))
      )}

      {/* Load More Button */}
      {data.length !== totalIssues && (
        <Flex justify="center" className={style.loadMoreWrapper}>
          <span onClick={onLoadMore}>Load More</span>
        </Flex>
      )}
    </Flex>
  );
};

export default GrowthTimeline;
