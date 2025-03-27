import { Flex, Tabs, TabsProps } from "antd";
import style from "./PlantDetails.module.scss";
import { useStyle } from "@/hooks";
import { Icons } from "@/assets";
import { Tooltip } from "@/components";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PATHS } from "@/routes";

import dayjs from "dayjs";
import { usePlantStore } from "@/stores";
import { useEffect } from "react";
import {
  PlantCareHistory,
  PlantCriteria,
  PlantDetail,
  PlantGraftedHistory,
  PlantGrowthHistory,
  PlantOverview,
} from "@/pages";
const TabPane = Tabs.TabPane;

function PlantDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { plotId } = useParams();
  const { productType, yearRange } = location.state || {};
  const { setPlantId } = usePlantStore();
  const formattedTimeline: [dayjs.Dayjs, dayjs.Dayjs] | undefined =
    Array.isArray(yearRange) &&
    yearRange.length === 2 &&
    yearRange.every((t) => typeof t === "string" && dayjs(t).isValid())
      ? ([dayjs(yearRange[0]), dayjs(yearRange[1])] as [dayjs.Dayjs, dayjs.Dayjs])
      : undefined;
  const pathnames = location.pathname.split("/");
  const plantId = pathnames[pathnames.length - 2];
  const { styles } = useStyle();

  useEffect(() => {
    if (plantId) {
      setPlantId(Number(plantId));
    }
  }, [plantId, setPlantId]);

  const items: TabsProps["items"] = [
    {
      key: "1",
      icon: <Icons.overview className={style.iconTab} />,
      label: <label className={style.titleTab}>Overview</label>,
      children: <PlantOverview productType={productType} timeline={formattedTimeline} />,
    },
    {
      key: "2",
      icon: <Icons.detail className={style.iconTab} />,
      label: <label className={style.titleTab}>Detail</label>,
      children: <PlantDetail />,
    },
    {
      key: "3",
      icon: <Icons.criteria className={style.iconTab} />,
      label: <label className={style.titleTab}>Criteria</label>,
      children: <PlantCriteria />,
    },
    {
      key: "4",
      icon: <Icons.history className={style.iconTab} />,
      label: <label className={style.titleTab}>Growth History</label>,
      children: <PlantGrowthHistory />,
    },
    {
      key: "5",
      icon: <Icons.tool className={style.iconTab} />,
      label: <label className={style.titleTab}>Care History</label>,
      children: <PlantCareHistory />,
    },
    {
      key: "6",
      icon: <Icons.seedling className={style.iconTab} />,
      label: <label className={style.titleTab}>Grafted History</label>,
      children: <PlantGraftedHistory />,
    },
  ];

  const handleBack = () => {
    if (plotId) {
      navigate(PATHS.FARM.FARM_ROW_LIST, {
        state: { plotId, viewMode: "simulate" },
      });
    } else {
      navigate(PATHS.FARM.FARM_PLANT_LIST);
    }
  };

  return (
    <Flex className={style.detailContainer}>
      <Tabs
        className={`${style.containerWrapper} ${styles.customTab}`}
        defaultActiveKey={productType && yearRange ? "1" : "2"}
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

export default PlantDetails;
