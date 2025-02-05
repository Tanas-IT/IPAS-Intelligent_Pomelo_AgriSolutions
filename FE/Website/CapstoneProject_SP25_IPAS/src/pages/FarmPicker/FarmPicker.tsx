import { Card, Col, Empty, Flex, Row, Tag, Typography } from "antd";
import style from "./FarmPicker.module.scss";
import { Icons, Images } from "@/assets";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import { CustomButton } from "@/components";
const Text = Typography;

interface Farm {
  id: number;
  name: string;
  address: string;
  createdAt: string;
  status: "Active" | "Inactive";
  role: "Owner" | "Employee";
  image: string;
}

function FarmPicker() {
  const navigate = useNavigate();
  const handleCardClick = () => {
    navigate(PATHS.DASHBOARD);
  };

  

  const farmsData: Farm[] = [
    // {
    //   id: 1,
    //   name: "Tan Trieu Pomelo Farm",
    //   address: "133/17 Hương Lộ 9, Tân Bình, Vĩnh Cửu, Đồng Nai",
    //   createdAt: "2025-01-21",
    //   status: "Active",
    //   role: "Owner",
    //   image: Images.logo,
    // },
    // {
    //   id: 2,
    //   name: "Tan Trieu Pomelo Farm",
    //   address: "133/17 Hương Lộ 9, Tân Bình, Vĩnh Cửu, Đồng Nai",
    //   createdAt: "2025-01-21",
    //   status: "Inactive",
    //   role: "Employee",
    //   image: Images.logo,
    // },
    // {
    //   id: 3,
    //   name: "Tan Trieu Pomelo Farm",
    //   address: "133/17 Hương Lộ 9, Tân Bình, Vĩnh Cửu, Đồng Nai",
    //   createdAt: "2025-01-21",
    //   status: "Inactive",
    //   role: "Employee",
    //   image: Images.logo,
    // },
    // {
    //   id: 4,
    //   name: "Tan Trieu Pomelo Farm",
    //   address: "133/17 Hương Lộ 9, Tân Bình, Vĩnh Cửu, Đồng Nai",
    //   createdAt: "2025-01-21",
    //   status: "Inactive",
    //   role: "Employee",
    //   image: Images.logo,
    // },
  ];



  if (farmsData.length === 0) {
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
            <Col span={12} key={farm.id}>
              <Card className={style.card} hoverable onClick={handleCardClick}>
                <Row gutter={16}>
                  {/* Cột chứa hình ảnh */}
                  <Col span={5} className={style.cardImgWrapper}>
                    <img alt="farm" src={farm.image} className={style.cardImg} />
                  </Col>

                  {/* Cột chứa thông tin */}
                  <Col span={15} className={style.cardInfoWrapper}>
                    <Flex className={style.cardInfo}>
                      <Flex className={style.farmDetails}>
                        <Text className={style.farmName}>{farm.name}</Text>
                        <Text className={style.address}>{farm.address}</Text>
                      </Flex>
                      <Flex className={style.creationInfo}>
                        <Text className={style.label}>Created at:</Text>
                        <Text className={style.date}>{farm.createdAt}</Text>
                        <Tag className={`${style.statusTag} ${style[farm.status.toLowerCase()]}`}>
                          {farm.status}
                        </Tag>
                      </Flex>
                    </Flex>
                  </Col>

                  <Col span={4}>
                    <Flex className={style.roleTagWrapper}>
                      <Tag className={`${style.statusTag} ${style[farm.role.toLowerCase()]}`}>
                        {farm.role}
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
