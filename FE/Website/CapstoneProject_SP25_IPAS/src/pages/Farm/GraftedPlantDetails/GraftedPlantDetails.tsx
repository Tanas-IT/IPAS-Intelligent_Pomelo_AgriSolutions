import { Flex, Tabs, TabsProps } from "antd";
import style from "./GraftedPlantDetails.module.scss";
import { useStyle } from "@/hooks";
import { Icons } from "@/assets";
import { Tooltip } from "@/components";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import { GraftedGrowthHistory, GraftedPlantCriteria, GraftedPlantDetail } from "@/pages";
import { useGraftedPlantStore } from "@/stores";

function GraftedPlantDetails() {
  const navigate = useNavigate();
  const { styles } = useStyle();
  const { isGrowthDetailView, setIsGrowthDetailView } = useGraftedPlantStore();

  const items: TabsProps["items"] = [
    {
      key: "1",
      icon: <Icons.detail className={style.iconTab} />,
      label: <label className={style.titleTab}>Detail</label>,
      children: <GraftedPlantDetail />,
    },
    {
      key: "2",
      icon: <Icons.criteria className={style.iconTab} />,
      label: <label className={style.titleTab}>Criteria</label>,
      children: <GraftedPlantCriteria />,
    },
    {
      key: "3",
      icon: <Icons.history className={style.iconTab} />,
      label: <label className={style.titleTab}>Growth History</label>,
      children: <GraftedGrowthHistory />,
    },
  ];

  // const handleBack = () => navigate(PATHS.FARM.GRAFTED_PLANT_LIST);
  const handleBack = () => {
    if (isGrowthDetailView) {
      setIsGrowthDetailView(false);
    } else {
      navigate(PATHS.FARM.GRAFTED_PLANT_LIST);
    }
  };

  return (
    <Flex className={style.detailContainer}>
      <Tabs
        className={`${style.containerWrapper} ${styles.customTab}`}
        defaultActiveKey="1"
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

export default GraftedPlantDetails;
