import { Flex, List, Tag, Typography } from "antd";
const { Text } = Typography;
import { useMemo } from "react";
import style from "./LandPlot.module.scss";
import { Icons } from "@/assets";
import { formatDate } from "@/utils";
import { GetLandPlot } from "@/payloads";

interface PlotListPopupProps {
  onClose: () => void;
  landPlots: GetLandPlot[];
}

function PlotListPopup({ onClose, landPlots }: PlotListPopupProps) {
  const plotList = useMemo(
    () => (
      <List
        className={style.landPlotList}
        dataSource={landPlots}
        renderItem={(plot) => (
          <List.Item>
            <Flex className={style.plotItemWrapper}>
              {/* Trạng thái của Land Plot */}
              <Flex className={style.col}>
                <Tag
                  color={
                    plot.status === "Active"
                      ? "green"
                      : plot.status === "Warning"
                      ? "orange"
                      : "red"
                  }
                >
                  {plot.status}
                </Tag>
              </Flex>

              <Flex className={style.col}>
                <Flex className={style.plotItemHeader}>
                  <Text className={style.plotItemTitle}>
                    {plot.landPlotName} - {plot.landPlotCode}
                  </Text>
                  <label className={style.plotItemDescription}>{plot.description}</label>
                </Flex>

                {/* Chi tiết đất */}
                <Flex className={style.plotItemDetails}>
                  <Flex className={style.plotItemDetail}>
                    <Icons.calendar />
                    <label>Create Date:</label>
                  </Flex>
                  {formatDate(plot.createDate)}
                </Flex>

                <Flex className={style.plotItemDetails}>
                  <Flex className={style.plotItemDetail}>
                    <Icons.area />
                    <label>Area:</label>
                  </Flex>
                  {plot.area} m²
                </Flex>

                <Flex className={style.plotItemDetails}>
                  <Flex className={style.plotItemDetail}>
                    <Icons.soil />
                    <label>Soil Type:</label>
                  </Flex>
                  {plot.soilType}
                </Flex>

                <Flex className={style.plotItemDetails}>
                  <Flex className={style.plotItemDetail}>
                    <Icons.target />
                    <label>Target Market:</label>
                  </Flex>
                  {plot.targetMarket}
                </Flex>
              </Flex>
            </Flex>
          </List.Item>
        )}
      />
    ),
    [],
  );

  return (
    <Flex className={style.popupContainer}>
      {/* Header với nút đóng */}
      <Flex className={style.popupHeader} justify="space-between" align="center">
        <h3>Land Plots</h3>
        <button className={style.closeButton} onClick={onClose}>
          ✖
        </button>
      </Flex>
      {/* Body chứa danh sách */}
      <Flex className={style.popupBody}>{plotList}</Flex>
    </Flex>
  );
}

export default PlotListPopup;
