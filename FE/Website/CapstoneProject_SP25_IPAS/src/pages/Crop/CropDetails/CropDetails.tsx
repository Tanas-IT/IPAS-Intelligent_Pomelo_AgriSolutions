import { Flex, Tabs, TabsProps } from "antd";
import style from "./CropDetails.module.scss";
import { useStyle } from "@/hooks";
import { Icons } from "@/assets";
import { Tooltip } from "@/components";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import { CropDetail, HarvestDays } from "@/pages";
import { useCropStore } from "@/stores";

function CropDetails() {
  const location = useLocation();
  const { isHarvestDetailView, setIsHarvestDetailView } = useCropStore();
  const navigate = useNavigate();
  const isFromWorklog = location.state?.isFromWorklog ?? false;
  const { styles } = useStyle();

  const items: TabsProps["items"] = [
    {
      key: "1",
      icon: <Icons.detail className={style.iconTab} />,
      label: <label className={style.titleTab}>Detail</label>,
      children: <CropDetail />,
    },
    {
      key: "2",
      icon: <Icons.plant className={style.iconTab} />,
      label: <label className={style.titleTab}>Harvest Days</label>,
      children: <HarvestDays />,
    },
  ];

  const handleBack = () => {
    if (isHarvestDetailView) {
      setIsHarvestDetailView(false);
    } else {
      navigate(PATHS.CROP.CROP_LIST);
    }
  };

  return (
    <Flex className={style.detailContainer}>
      <Tabs
        className={`${style.containerWrapper} ${styles.customTab}`}
        defaultActiveKey={isFromWorklog ? "2" : "1"}
        items={items}
        onChange={() => setIsHarvestDetailView(false)}
        tabBarExtraContent={{
          left: (
            <Flex className={style.extraContent}>
              <Tooltip
                title={isHarvestDetailView ? "Back to Harvest" : "Back to List"}
                children={<Icons.back className={style.backIcon} onClick={handleBack} />}
              />
            </Flex>
          ),
        }}
      />
    </Flex>
  );
}

export default CropDetails;
