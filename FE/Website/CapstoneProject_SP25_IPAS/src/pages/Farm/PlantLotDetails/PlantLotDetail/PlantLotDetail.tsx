import { useLocation, useNavigate } from "react-router-dom";
import style from "./PlantLotDetail.module.scss";
import { Divider, Flex, Table } from "antd";
import { Icons } from "@/assets";
import { InfoFieldDetail, LoadingSkeleton } from "@/components";
import { useEffect, useState } from "react";
import { formatDate, formatDayMonth, formatDayMonthAndTime } from "@/utils";
import { plantLotService } from "@/services";
import { GetPlantLotDetail } from "@/payloads";

import LotSectionHeader from "../LotSectionHeader/LotSectionHeader";
import { ROUTES } from "@/constants";
import { usePlantLotStore } from "@/stores";

function PlantLotDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnames = location.pathname.split("/");
  const lotId = pathnames[pathnames.length - 2];
  const { lot, setLot } = usePlantLotStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchPlantLot = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // ⏳ Delay 1 giây
    try {
      const res = await plantLotService.getPlantLot(Number(lotId));
      if (res.statusCode === 200) {
        setLot(res.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlantLot();
  }, []);

  const infoFieldsLeft = [
    { label: "Partner", value: lot?.partnerName, icon: Icons.category },
    { label: "Seeding Name", value: lot?.seedingName, icon: Icons.plant },
    {
      label: "Imported Date",
      value: lot?.importedDate ? formatDayMonth(lot.importedDate) : "N/A",
      icon: Icons.time,
    },
    { label: "Note", value: lot?.note, icon: Icons.area },
  ];

  const infoFieldsRight = [
    { label: "Unit", value: lot?.unit, icon: Icons.area },
    { label: "Initial Quantity", value: lot?.previousQuantity, icon: Icons.area },
    { label: "Qualified Quantity", value: lot?.lastQuantity, icon: Icons.area },
    { label: "Assigned Quantity", value: lot?.usedQuantity, icon: Icons.area },
  ];

  const description = lot?.note ?? "N/A";
  const additionalLots = lot?.additionalPlantLots ?? [];

  if (isLoading) return <LoadingSkeleton rows={10} />;

  return (
    <Flex className={style.contentDetailWrapper}>
      <LotSectionHeader lot={lot} />
      <Divider className={style.divider} />
      <Flex className={style.contentSectionBody}>
        <Flex className={style.col}>
          {infoFieldsLeft.map((field, index) => (
            <InfoFieldDetail
              key={index}
              icon={field.icon}
              label={field.label}
              value={field.value}
            />
          ))}
        </Flex>
        <Flex className={style.col}>
          {infoFieldsRight.map((field, index) => (
            <InfoFieldDetail
              key={index}
              icon={field.icon}
              label={field.label}
              value={field.value}
            />
          ))}
        </Flex>
      </Flex>
      {/* <DescriptionSection description={description} id={plant.plantId} code={plant.plantCode} /> */}
      {/* Danh sách lô bổ sung */}
      {additionalLots.length > 0 && (
        <>
          <Divider className={style.divider} />
          <h3 className={style.sectionTitle}>Additional Plant Lots</h3>
          <div className={style.additionalTable}>
            <Table
              dataSource={additionalLots}
              rowKey="plantLotId"
              columns={[
                {
                  title: "Code",
                  dataIndex: "plantLotCode",
                  key: "plantLotCode",
                },
                {
                  title: "Lot Name",
                  dataIndex: "plantLotName",
                  key: "plantLotName",
                },
                {
                  title: "Unit",
                  dataIndex: "unit",
                  key: "unit",
                },
                {
                  title: "Initial Quantity",
                  dataIndex: "previousQuantity",
                  key: "previousQuantity",
                },
                {
                  title: "Qualified Quantity",
                  dataIndex: "lastQuantity",
                  key: "lastQuantity",
                },
                {
                  title: "Assigned Quantity",
                  dataIndex: "usedQuantity",
                  key: "usedQuantity",
                },
                {
                  title: "Imported Date",
                  dataIndex: "importedDate",
                  key: "importedDate",
                  render: (date) => (date ? formatDate(date) : "N/A"),
                },
                {
                  title: "Status",
                  dataIndex: "status",
                  key: "status",
                },
              ]}
              pagination={false}
              onRow={(record) => ({
                onClick: () => navigate(ROUTES.FARM_PLANT_LOT_DETAIL(record.plantLotId)),
                style: { cursor: "pointer" },
              })}
            />
          </div>
        </>
      )}
    </Flex>
  );
}

export default PlantLotDetail;
