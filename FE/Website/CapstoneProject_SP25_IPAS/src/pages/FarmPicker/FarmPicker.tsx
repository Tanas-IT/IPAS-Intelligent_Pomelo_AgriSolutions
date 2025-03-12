import { Card, Col, Empty, Flex, Row, Tag, Typography } from "antd";
import style from "./FarmPicker.module.scss";
import { Icons, Images } from "@/assets";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import { CustomButton, Loading } from "@/components";
import { useEffect, useState } from "react";
import { authService, farmService } from "@/services";
import { LOCAL_STORAGE_KEYS, MESSAGES, UserRole } from "@/constants";
import { formatDate, getRoleId, getUserId } from "@/utils";
import { toast } from "react-toastify";
import { GetFarmPicker } from "@/payloads";
import { useFarmStore } from "@/stores";
import { useLocalStorage } from "@/hooks";
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
        console.log(result);

        if (result.statusCode === 200) {
          setFarmsData(result.data ?? []);
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


      const farmResult = await farmService.getFarm(farmId.toString());
      if (farmResult.statusCode === 200) {
        const farmExpiredDate = farmResult.data.farmExpiredDate;
        const isExpired = farmExpiredDate && new Date(farmExpiredDate) < new Date();

        useFarmStore.getState().setFarmInfo(
          result.data.farmName,
          result.data.farmLogo,
          farmExpiredDate,
        );

        const roleId = getRoleId();
        
        if (isExpired && roleId !== UserRole.Owner.toString()) {
          toast.warning("This farm's package has expired. Please contact the owner to renew.");
          navigate(PATHS.FARM_PICKER);
        } else {
          navigate(PATHS.DASHBOARD);
        }
      } else {
        toast.error("Failed to fetch farm details.");
      }
    } else {
      toast.error(MESSAGES.ERROR_OCCURRED);
    }
  };

  // const handleCreateNewFarm = async () => {
  //   console.log("ủaaaaaaaaaa");
    
  //   try {
  //     const farmExpiredDate = useFarmStore.getState().farmExpiredDate;
  //     const isExpired = farmExpiredDate ? new Date(farmExpiredDate) < new Date() : true;
  //     console.log("farmExpiredDateeeeee", farmExpiredDate);
  //     console.log("isExpired", isExpired);
      
  
  //     if (isExpired) {
  //       toast.warning(
  //         farmExpiredDate
  //           ? "Your farm's package has expired. Please purchase a new package."
  //           : "You have not purchased a package. Please buy one before creating a farm."
  //       );
  //       navigate(PATHS.PACKAGE.PACKAGE_PURCHASE);
  //     } else {
  //       navigate(PATHS.FARM.CREATE_FARM);
  //     }
  //   } catch (error) {
  //     console.error("Error checking subscription:", error);
  //     toast.error(MESSAGES.ERROR_OCCURRED);
  //   }
  // };
  
  const handleCreateNewFarm = async () => {
    try {
      navigate(PATHS.FARM.CREATE_FARM);
    } catch (error) {
      console.error("Error checking subscription:", error);
      toast.error(MESSAGES.ERROR_OCCURRED);
    }
  };

  if (loading) return <Loading />;

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
          <CustomButton label="Create New Farm" icon={<Icons.plus />} handleOnClick={handleCreateNewFarm} />
        </Empty>
      </Flex>
    );
  }

  return (
    <Flex className={style.container}>
      <Flex className={style.headerWrapper}>
        <CustomButton
          label="Create New Farm"
          icon={<Icons.plus />}
          handleOnClick={handleCreateNewFarm}
        />
      </Flex>
      <Flex className={style.contentWrapper}>
        <Row gutter={[18, 30]} className={style.cardWrapper}>
          {farmsData?.map((farm) => {
            const isInactive = farm.farm.status.toLowerCase() === "inactive" || !farm.isActive;
            return (
              <Col span={12} key={farm.farm.farmId}>
                <Card
                  className={`${style.card} ${isInactive ? style.inactiveCard : ""}`}
                  hoverable
                  onClick={() => !isInactive && handleCardClick(farm.farm.farmId)}
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
                            className={`${style.statusTag} ${isInactive ? style.inactive : style.active
                              }`}
                          >
                            {isInactive ? "Inactive" : "Active"}
                          </Tag>
                        </Flex>
                      </Flex>
                    </Col>

                    <Col span={4}>
                      <Flex className={style.roleTagWrapper}>
                        <Tag
                          className={`${style.statusTag} ${farm.roleId == UserRole.Owner.toString() ? style.owner : style.other
                            }`}
                        >
                          {farm.roleName}
                        </Tag>
                      </Flex>
                    </Col>
                  </Row>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Flex>
    </Flex>
  );
}

export default FarmPicker;
