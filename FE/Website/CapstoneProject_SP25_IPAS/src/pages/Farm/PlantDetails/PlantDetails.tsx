import { Flex, Tabs, TabsProps } from "antd";
import style from "./PlantDetails.module.scss";
import { useStyle } from "@/hooks";
import { Icons } from "@/assets";
import { Tooltip } from "@/components";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PATHS } from "@/routes";

import dayjs from "dayjs";
import { usePlantStore } from "@/stores";
import { useEffect, useState } from "react";
import {
  PlantCareHistory,
  PlantCriteria,
  PlantDetail,
  PlantGraftedHistory,
  PlantGrowthHistory,
  PlantHarvestRecord,
  PlantOverview,
} from "@/pages";
import { plantService } from "@/services";
import { isEmployee } from "@/utils";

function PlantDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { plotId } = useParams();
  const { productType, yearRange } = location.state || {};
  const formattedTimeline: [dayjs.Dayjs, dayjs.Dayjs] | undefined =
    Array.isArray(yearRange) &&
    yearRange.length === 2 &&
    yearRange.every((t) => typeof t === "string" && dayjs(t).isValid())
      ? ([dayjs(yearRange[0]), dayjs(yearRange[1])] as [dayjs.Dayjs, dayjs.Dayjs])
      : undefined;
  const { styles } = useStyle();
  const { isGrowthDetailView, setIsGrowthDetailView } = usePlantStore();

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
    // {
    //   key: "5",
    //   icon: <Icons.tool className={style.iconTab} />,
    //   label: <label className={style.titleTab}>Care History</label>,
    //   children: <PlantCareHistory />,
    // },
    {
      key: "6",
      icon: <Icons.plant className={style.iconTab} />,
      label: <label className={style.titleTab}>Harvest Record</label>,
      children: <PlantHarvestRecord />,
    },
    {
      key: "7",
      icon: <Icons.seedling className={style.iconTab} />,
      label: <label className={style.titleTab}>Grafted History</label>,
      children: <PlantGraftedHistory />,
    },
  ].filter((item) => {
    const isEmployeeIn = isEmployee();
    if (isEmployeeIn) {
      return ["2", "4", "6"].includes(item.key);
    }
    return true;
  });

  const handleBack = () => {
    if (plotId) {
      navigate(PATHS.FARM.FARM_ROW_LIST, {
        state: { plotId, viewMode: "simulate" },
      });
    } else if (isGrowthDetailView) {
      setIsGrowthDetailView(false);
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
        onChange={() => setIsGrowthDetailView(false)}
        tabBarExtraContent={{
          left: (
            <Flex className={style.extraContent}>
              <Tooltip
                title={isGrowthDetailView ? "Back to Growth History" : "Back to List"}
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
