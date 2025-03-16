import { Flex, Tabs, TabsProps } from "antd";
import style from "./PlantDetails.module.scss";
import { useStyle } from "@/hooks";
import { Icons } from "@/assets";
import { Tooltip } from "@/components";
import { useNavigate, useParams } from "react-router-dom";
import { PATHS } from "@/routes";
import PlantDetail from "./PlantDetail/PlantDetail";
import PlantCriteria from "./PlantCriteria/PlantCriteria";
const TabPane = Tabs.TabPane;

function PlantDetails() {
  const { plotId } = useParams();
  const navigate = useNavigate();
  const { styles } = useStyle();

  const items: TabsProps["items"] = [
    {
      key: "1",
      icon: <Icons.overview className={style.iconTab} />,
      label: <label className={style.titleTab}>Overview</label>,
      children: "Content of Tab Pane 1",
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
      children: "Content of Tab Pane 3",
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

  const onChange = (key: string) => {
    console.log(key);
  };

  return (
    <Flex className={style.detailContainer}>
      <Tabs
        className={`${style.containerWrapper} ${styles.customTab}`}
        defaultActiveKey="2"
        items={items}
        onChange={onChange}
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
