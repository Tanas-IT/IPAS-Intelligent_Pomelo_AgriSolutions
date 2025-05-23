import { Flex, Button, Image } from "antd";
import { Icons } from "@/assets";
import style from "./Details.module.scss";
import { formatDayMonthAndTime } from "@/utils";
import { FILE_FORMAT } from "@/constants";
import { FileResource } from "@/types";
import { UserAvatar } from "@/components";
import { useModifyPermission } from "@/hooks";

interface GrowthDetailContentProps<T extends { [key: string]: any }> {
  history: T | null;
  limitDays: number;
  isDisable: boolean;
  isLoading: boolean;
  actionMenu: (item: T) => React.ReactNode;
}

function GrowthDetailContent<T extends { [key: string]: any }>({
  history,
  limitDays,
  isDisable,
  isLoading,
  actionMenu,
}: GrowthDetailContentProps<T>) {
  if (!history) return null;
  const { canEdit } = useModifyPermission(history.createDate, history.userId, limitDays, isLoading);

  const images = history.resources
    .filter((res: FileResource) => res.fileFormat === FILE_FORMAT.IMAGE)
    .map((res: FileResource) => res.resourceURL);

  const videos = history.resources
    .filter((res: FileResource) => res.fileFormat === FILE_FORMAT.VIDEO)
    .map((res: FileResource) => res.resourceURL);

  return (
    <Flex className={style.detailWrapper} vertical>
      <Flex gap={12} className={style.modalHeader}>
        <Flex justify="space-between" align="center" style={{ width: "100%" }}>
          <Flex justify="center" align="center" gap={10}>
            <UserAvatar avatarURL={history.noteTakerAvatar || undefined} size={40} />
            <span className={style.userName}>{history.noteTakerName}</span>
            <span>created this note</span>
            <span className={style.createdDate}>{formatDayMonthAndTime(history.createDate)}</span>
          </Flex>

          {canEdit && !isDisable && actionMenu(history)}
        </Flex>
        {/* <Button icon={<Icons.back />} className={style.backButton} onClick={onBack}>
          Back to Growth History
        </Button> */}
      </Flex>

      <Flex className={style.modalInfoRow}>
        <Flex className={style.iconLabelContainer}>
          <Icons.description />
          <span className={style.label}>Issue:</span>
        </Flex>
        <p>{history.issueName}</p>
      </Flex>

      <Flex className={style.modalInfoRow}>
        <Flex className={style.iconLabelContainer}>
          <Icons.description />
          <span className={style.label}>Notes:</span>
        </Flex>
        <p>{history.content}</p>
      </Flex>

      <Flex className={style.modalInfoRow} vertical>
        <Flex className={style.iconLabelContainer}>
          <Icons.media />
          <span className={style.label}>Media:</span>
        </Flex>
        {history.numberImage === 0 && history.numberVideos === 0 ? (
          <p className={style.noMedia}>Employee haven't uploaded any images or videos.</p>
        ) : (
          <Flex className={style.mediaContainer} vertical>
            {images.length > 0 && (
              <Flex vertical>
                <span className={style.mediaLabel}>Images:</span>
                <Flex className={style.imageGrid}>
                  {images.map((img: string, index: number) => (
                    <Image
                      key={index}
                      src={img}
                      width={120}
                      height={120}
                      style={{ borderRadius: "8px", objectFit: "cover" }}
                      crossOrigin="anonymous"
                    />
                  ))}
                </Flex>
              </Flex>
            )}
            {videos.length > 0 && (
              <Flex vertical>
                <span className={style.mediaLabel}>Videos:</span>
                <Flex className={style.videoGrid}>
                  {videos.map((vid: string, index: number) => (
                    <video
                      key={index}
                      width="250"
                      height="200"
                      controls
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #d9d9d9",
                        objectFit: "cover",
                      }}
                      crossOrigin="anonymous"
                    >
                      <source src={vid} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ))}
                </Flex>
              </Flex>
            )}
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}

export default GrowthDetailContent;
