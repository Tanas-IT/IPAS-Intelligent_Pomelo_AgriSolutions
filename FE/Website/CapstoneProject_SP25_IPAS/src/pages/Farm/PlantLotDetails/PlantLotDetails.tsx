import { Flex, Tabs, TabsProps } from "antd";
import style from "./PlantLotDetails.module.scss";
import { useStyle } from "@/hooks";
import { Icons } from "@/assets";
import { Tooltip } from "@/components";
import { useNavigate, useParams } from "react-router-dom";
import { PATHS } from "@/routes";

import { ROUTES } from "@/constants";
import { PlantLotCriteria, PlantLotDetail } from "@/pages";

function PlantLotDetails() {
  const navigate = useNavigate();
  const { styles } = useStyle();
  const { parentId, id } = useParams<{ parentId: string; id: string }>();

  const items: TabsProps["items"] = [
    {
      key: "1",
      icon: <Icons.detail className={style.iconTab} />,
      label: <label className={style.titleTab}>Detail</label>,
      children: <PlantLotDetail />,
    },
    {
      key: "2",
      icon: <Icons.criteria className={style.iconTab} />,
      label: <label className={style.titleTab}>Criteria</label>,
      children: <PlantLotCriteria />,
    },
  ];

  const handleBack = () => {
    if (parentId) {
      navigate(ROUTES.FARM_PLANT_LOT_DETAIL(Number(parentId)));
    } else {
      navigate(PATHS.FARM.FARM_PLANT_LOT_LIST);
    }
  };

  return (
    <Flex className={style.detailContainer}>
      <Tabs
        className={`${style.containerWrapper} ${styles.customTab}`}
        defaultActiveKey="1"
        items={items}
        tabBarExtraContent={{
          left: (
            <Flex className={style.extraContent}>
              <Tooltip
                title="Back to List"
                children={<Icons.back className={style.backIcon} onClick={handleBack} />}
              />
            </Flex>
          ),
        }}
      />
    </Flex>
  );
}

export default PlantLotDetails;
