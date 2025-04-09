import { Flex, Tabs, TabsProps } from "antd";
import style from "./ProductDetails.module.scss";
import { useStyle } from "@/hooks";
import { Icons } from "@/assets";
import { Tooltip } from "@/components";
import { useNavigate, useParams } from "react-router-dom";
import { PATHS } from "@/routes";
import { ProductDetail } from "@/pages";
import { ROUTES } from "@/constants";

function ProductDetails() {
  const navigate = useNavigate();
  const { cropId } = useParams();
  const { styles } = useStyle();

  const items: TabsProps["items"] = [
    {
      key: "1",
      icon: <Icons.detail className={style.iconTab} />,
      label: <label className={style.titleTab}>Detail</label>,
      children: <ProductDetail />,
    },
  ];

  const handleBack = () => {
    if (cropId) {
      navigate(ROUTES.CROP_DETAIL(Number(cropId)));
    } else {
      navigate(PATHS.CLASSIFICATION.PRODUCT);
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
                title={cropId ? "Back To Harvest" : "Back to List"}
                children={<Icons.back className={style.backIcon} onClick={handleBack} />}
              />
            </Flex>
          ),
        }}
      />
    </Flex>
  );
}

export default ProductDetails;
