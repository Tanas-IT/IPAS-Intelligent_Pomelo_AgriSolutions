import { Flex, Button, Typography, Avatar, Image } from "antd";
import { Icons, Images } from "@/assets";
import style from "./PlantGrowthDetail.module.scss";
import { GetPlantGrowthHistory } from "@/payloads";
import { formatDayMonthAndTime } from "@/utils";

const { Title, Text } = Typography;

interface PlantGrowthDetailProps {
  history: GetPlantGrowthHistory | null;
  onBack: () => void;
}

function PlantGrowthDetail({ history, onBack }: PlantGrowthDetailProps) {
  if (!history) return null;

  const fakeImages = Array.from(
    { length: 5 },
    (_, index) => `https://picsum.photos/seed/${index}/200/200`,
  );

  const fakeVideos = [
    "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_5mb.mp4",
    "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_10mb.mp4",
  ];

  return (
    <Flex className={style.detailWrapper} vertical>
      <Flex gap={12} className={style.modalHeader}>
        <Flex justify="center" align="center" gap={10}>
          <Avatar src={Images.avatar} size={40} shape="circle" crossOrigin="anonymous" />
          <span className={style.userName}>{history.noteTaker}</span>
          <span>created this note</span>
          <span className={style.createdDate}>{formatDayMonthAndTime(history.createDate)}</span>
        </Flex>
        <Button icon={<Icons.back />} className={style.backButton} onClick={onBack}>
          Back to Growth History
        </Button>
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
        <Flex className={style.mediaContainer} vertical>
          {fakeImages.length > 0 && (
            <Flex vertical>
              <span className={style.mediaLabel}>Images:</span>
              <Flex className={style.imageGrid}>
                {fakeImages.map((img, index) => (
                  <Image
                    key={index}
                    src={img}
                    width={120}
                    height={120}
                    style={{ borderRadius: "5px" }}
                    crossOrigin="anonymous"
                  />
                ))}
              </Flex>
            </Flex>
          )}
          {fakeVideos.length > 0 && (
            <Flex vertical>
              <span className={style.mediaLabel}>Videos:</span>
              <Flex className={style.videoGrid}>
                {fakeVideos.map((vid, index) => (
                  <video key={index} width="200" controls style={{ borderRadius: "5px" }}>
                    <source src={vid} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ))}
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}

export default PlantGrowthDetail;
