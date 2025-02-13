import { Card, Col, Empty, Flex, Row, Tag, Typography } from "antd";
import style from "./FarmPicker.module.scss";
import { Icons, Images } from "@/assets";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import { CustomButton } from "@/components";
import { useEffect, useState } from "react";
import { authService, farmService } from "@/services";
import { LOCAL_STORAGE_KEYS, MESSAGES, UserRole } from "@/constants";
import { formatDate } from "@/utils";
import { toast } from "react-toastify";
import { GetFarmPicker } from "@/payloads";
import { useFarmStore } from "@/stores";
const Text = Typography;

function FarmPicker() {
  const navigate = useNavigate();
  const [farmsData, setFarmsData] = useState<GetFarmPicker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        setLoading(true);
        const result = await farmService.getFarmsOfUser();
        if (result.statusCode === 200) {
          setFarmsData(result.data);
        } else {
          console.error("Failed to fetch farms:", result.message);
        }
      } catch (error) {
        console.error("Error fetching farms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, []);

  const handleCardClick = async (farmId: string | number) => {
    const result = await authService.refreshTokenInFarm(farmId);
    if (result.statusCode === 200) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, result.data.accessToken);
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, result.data.refreshToken);
      localStorage.setItem(LOCAL_STORAGE_KEYS.FARM_NAME, result.data.farmName);
      localStorage.setItem(LOCAL_STORAGE_KEYS.FARM_LOGO, result.data.farmLogo);
      useFarmStore.getState().setFarmInfo(result.data.farmName, result.data.farmLogo);
      navigate(PATHS.DASHBOARD);
    } else {
      toast.error(MESSAGES.ERROR_OCCURRED);
    }
  };

  if (farmsData && farmsData.length === 0) {
    return (
      <Flex className={style.emptyContainer}>
        <Empty
          className={style.empty}
          description={
            <Typography.Text className={style.emptyDescription}>
              It looks like you haven’t added any farms yet. Start managing your farm by creating a
              new one!
            </Typography.Text>
          }
        >
          <CustomButton label="Create New Farm" icon={<Icons.plus />} handleOnClick={() => {}} />
        </Empty>
      </Flex>
    );
  }

  return (
    <Flex className={style.container}>
      <Flex className={style.headerWrapper}>
        <CustomButton label="Add New Farm" icon={<Icons.plus />} handleOnClick={() => {}} />
      </Flex>
      <Flex className={style.contentWrapper}>
        <Row gutter={[18, 30]} className={style.cardWrapper}>
          {farmsData.map((farm) => (
            <Col span={12} key={farm.farm.farmId}>
              <Card
                className={style.card}
                hoverable
                onClick={() => handleCardClick(farm.farm.farmId)}
              >
                <Row gutter={16} className={style.cardContent}>
                  {/* Cột chứa hình ảnh */}
                  <Col span={5} className={style.cardImgWrapper}>
                    <img
                      crossOrigin="anonymous"
                      alt="farm"
                      src={farm.farm.logoUrl}
                      className={style.cardImg}
                    />
                  </Col>

                  {/* Cột chứa thông tin */}
                  <Col span={15} className={style.cardInfoWrapper}>
                    <Flex className={style.cardInfo}>
                      <Flex className={style.farmDetails}>
                        <Text className={style.farmName}>{farm.farm.farmName}</Text>
                        <Text
                          className={style.address}
                        >{`${farm.farm.address}, ${farm.farm.ward}, ${farm.farm.district}, ${farm.farm.province}`}</Text>
                      </Flex>
                      <Flex className={style.creationInfo}>
                        <Text className={style.label}>Created at:</Text>
                        <Text className={style.date}>{formatDate(farm.farm.createDate)}</Text>
                        <Tag
                          className={`${style.statusTag} ${style[farm.farm.status.toLowerCase()]}`}
                        >
                          {farm.farm.status}
                        </Tag>
                      </Flex>
                    </Flex>
                  </Col>

                  <Col span={4}>
                    <Flex className={style.roleTagWrapper}>
                      <Tag
                        className={`${style.statusTag} ${
                          farm.roleId == UserRole.Owner.toString() ? style.owner : style.other
                        }`}
                      >
                        {farm.roleName}
                      </Tag>
                    </Flex>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      </Flex>
    </Flex>
  );
}

export default FarmPicker;
