import { useLocation } from "react-router-dom";
import style from "./PlantDetail.module.scss";
import { Divider, Flex, Image, Tag } from "antd";
import { Icons } from "@/assets";
import { LoadingSkeleton, Tooltip } from "@/components";
import { useEffect, useState } from "react";
import { DEFAULT_PLANT, formatDayMonth, formatDayMonthAndTime } from "@/utils";
import { plantService } from "@/services";
import { GetPlantDetail } from "@/payloads";

const InfoField = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <Flex className={style.infoField}>
    <Flex className={style.fieldLabelWrapper}>
      <Icon className={style.fieldIcon} />
      <label className={style.fieldLabel}>{label}:</label>
    </Flex>
    <label className={style.fieldValue}>{value}</label>
  </Flex>
);

const SectionHeader = ({
  title,
  code,
  status,
}: {
  title: string;
  code: string;
  status: string;
}) => {
  const normalStatuses = ["healthy", "normal"];
  const isNormal = normalStatuses.some((s) => status.toLowerCase().includes(s));
  return (
    <Flex className={style.contentSectionHeader}>
      <Flex className={style.contentSectionTitle}>
        <Flex className={style.contentSectionTitleLeft}>
          <label className={style.title}>{title}</label>
          <Tooltip title="Hello">
            <Icons.tag className={style.iconTag} />
          </Tooltip>
          <Tag className={`${style.statusTag} ${isNormal ? style.normal : style.issue}`}>
            {status}
          </Tag>
        </Flex>
        {/* <Flex>
      <Icons.edit
        className={style.iconEdit}
        onClick={() => {
          console.log(1);
        }}
      />
    </Flex> */}
      </Flex>
      <label className={style.subTitle}>Code: {code}</label>
    </Flex>
  );
};

const DescriptionSection = ({ description, image }: { description: string; image: string }) => {
  const isShortDescription = description.length < 50; // Điều kiện kiểm tra mô tả ngắn

  return (
    <Flex className={style.descriptionSection}>
      <Flex className={`${style.infoField} ${style.infoFieldColumn}`}>
        {isShortDescription ? (
          // Nếu mô tả ngắn, hiển thị trong cùng một dòng
          <Flex className={style.infoField}>
            <Flex className={style.fieldLabelWrapper}>
              <Icons.description className={style.fieldIcon} />
              <label className={style.fieldLabel}>Description:</label>
            </Flex>
            <label className={style.fieldValue}>{description}</label>
          </Flex>
        ) : (
          // Nếu mô tả dài, hiển thị thành nhiều dòng
          <>
            <Flex className={style.fieldLabelWrapper}>
              <Icons.description className={style.fieldIcon} />
              <label className={style.fieldLabel}>Description:</label>
            </Flex>
            <label className={style.fieldValue}>{description}</label>
          </>
        )}
        {image && (
          <Flex className={style.imageWrapper}>
            <Image crossOrigin="anonymous" width={160} src={image} />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

function PlantDetail() {
  const location = useLocation();
  const pathnames = location.pathname.split("/");
  const plantId = pathnames[pathnames.length - 2];
  const [plant, setPlant] = useState<GetPlantDetail>(DEFAULT_PLANT);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchLandPlots = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // ⏳ Delay 1 giây
      try {
        const res = await plantService.getPlant(Number(plantId));
        if (res.statusCode === 200) {
          setPlant(res.data);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchLandPlots();
  }, []);

  const infoFieldsLeft = [
    { label: "Growth Status", value: plant.growthStageName, icon: Icons.growth },
    { label: "Plant Lot", value: "Green Pomelo Lot 1", icon: Icons.box },
    { label: "Mother Plant", value: "P001", icon: Icons.plant },
    { label: "Create Date", value: formatDayMonthAndTime(plant.createDate), icon: Icons.time },
  ];

  const infoFieldsRight = [
    {
      label: "Plant Location",
      value:
        plant.landPlotName && plant.rowIndex !== undefined && plant.plantIndex !== undefined
          ? `${plant.landPlotName} - Row ${plant.rowIndex} - Plant #${plant.plantIndex}`
          : "Not Assigned",
      icon: Icons.location,
    },
    {
      label: "Cultivar",
      value: `${plant.masterTypeName} - ${plant.characteristic}`,
      icon: Icons.plant,
    },
    { label: "Planting Date", value: formatDayMonth(plant.plantingDate), icon: Icons.time },
  ];

  const description = plant.description ?? "N/A";

  const image = typeof plant.imageUrl === "string" ? plant.imageUrl : "";

  if (isLoading) return <LoadingSkeleton rows={10} />;

  return (
    <Flex className={style.contentWrapper}>
      <SectionHeader title={plant.plantName} code={plant.plantCode} status={plant.healthStatus} />
      <Divider className={style.divider} />
      <Flex className={style.contentSectionBody}>
        <Flex className={style.col}>
          {infoFieldsLeft.map((field, index) => (
            <InfoField key={index} icon={field.icon} label={field.label} value={field.value} />
          ))}
        </Flex>
        <Flex className={style.col}>
          {infoFieldsRight.map((field, index) => (
            <InfoField key={index} icon={field.icon} label={field.label} value={field.value} />
          ))}
        </Flex>
      </Flex>
      <DescriptionSection description={description} image={image} />
    </Flex>
  );
}

export default PlantDetail;
