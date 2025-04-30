import { Divider, Flex, Image, Tabs, TabsProps } from "antd";
import style from "./FarmInfo.module.scss";
import { Icons } from "@/assets";
import { useStyle } from "@/hooks";
import Overview from "./Overview";
import LegalDocument from "./LegalDocument";
import { useEffect, useState } from "react";
import { GetFarmInfo } from "@/payloads";
import { defaultLogoFarm, getDefaultFarm, getFarmId, isOwner } from "@/utils";
import { farmService } from "@/services";
import { LogoState } from "@/types";
import { LoadingSkeleton } from "@/components";
import PackageInfo from "./PackageInfo";

function FarmInfo() {
  const { styles } = useStyle();
  const [isLoading, setIsLoading] = useState(true);
  const [farmDetails, setFarmDetails] = useState<GetFarmInfo>(getDefaultFarm);
  const [logo, setLogo] = useState<LogoState>(defaultLogoFarm);
  const isLoginOwner = isOwner();

  const fetchFarmData = async () => {
    try {
      setIsLoading(true);
      const result = await farmService.getFarm(getFarmId());

      if (result.statusCode === 200) {
        setFarmDetails(result.data);
        setLogo((prev) => ({ ...prev, logoUrl: result.data.logoUrl }));
      }
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmData();
  }, []);

  const items: TabsProps["items"] = [
    {
      key: "1",
      icon: <Icons.overview className={style.iconTab} />,
      label: <label className={style.titleTab}>Overview</label>,
      children: isLoading ? (
        <LoadingSkeleton rows={10} />
      ) : (
        <Overview farm={farmDetails} setFarm={setFarmDetails} logo={logo} setLogo={setLogo} />
      ),
    },
    ...(isLoginOwner
      ? [
          {
            key: "2",
            icon: <Icons.document className={style.iconTab} />,
            label: <label className={style.titleTab}>Legal Documents</label>,
            children: <LegalDocument />,
          },
          {
            key: "3",
            icon: <Icons.document className={style.iconTab} />,
            label: <label className={style.titleTab}>Package Information</label>,
            children: <PackageInfo farm={farmDetails} />,
          },
        ]
      : []),
  ];

  return (
    <Flex className={style.container}>
      <Flex className={style.header}>
        <Image crossOrigin="anonymous" className={style.logo} src={logo.logoUrl} />
        <Flex className={style.farmInfo}>
          <h2 className={style.farmName}>{farmDetails.farmName}</h2>
          <Flex className={style.ownerInfo}>
            <Flex className={style.ownerName}>
              <label>Owned by</label>
              <strong>{farmDetails.owner.fullName}</strong>
            </Flex>
            <Divider type="vertical" className={style.divider} />
            <Flex className={style.ownerContact}>
              <Icons.mail /> {farmDetails.owner.email}
            </Flex>
            <Divider type="vertical" className={style.divider} />
            <Flex className={style.ownerContact}>
              <Icons.phone /> +{farmDetails.owner.phoneNumber}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Tabs
        className={`${style.containerWrapper} ${styles.customTab}`}
        defaultActiveKey="1"
        items={items}
      />
    </Flex>
  );
}

export default FarmInfo;
