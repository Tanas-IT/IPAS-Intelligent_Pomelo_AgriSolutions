import { Flex, List, Tag, Typography } from "antd";
const { Text } = Typography;
import { useMemo } from "react";
import style from "./LandPlot.module.scss";
import { Icons } from "@/assets";
import { formatDate } from "@/utils";
import { GetLandPlot } from "@/payloads";
import { PlotDetailItem } from "@/components";

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
              {/* <Flex className={style.col}>
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
              </Flex> */}

              <Flex className={style.col}>
                <Flex className={style.plotItemHeader}>
                  <Text className={style.plotItemTitle}>
                    {plot.landPlotName} - {plot.landPlotCode}
                  </Text>
                  <label className={style.plotItemDescription}>{plot.description}</label>
                </Flex>

                {/* Chi tiết đất */}
                <PlotDetailItem
                  icon={<Icons.calendar />}
                  label="Create Date"
                  value={formatDate(plot.createDate)}
                />
                <PlotDetailItem
                  icon={<Icons.ruler />}
                  label="Area & Size"
                  value={`${plot.area} m² — ${plot.length}m × ${plot.width}m`}
                />
                <PlotDetailItem
                  icon={<Icons.list />}
                  label="Rows"
                  value={`${plot.numberOfRows} rows, ${plot.rowPerLine} per line`}
                />
                <PlotDetailItem
                  icon={<Icons.direction />}
                  label="Direction"
                  value={plot.isRowHorizontal ? "Horizontal" : "Vertical"}
                />

                <PlotDetailItem
                  icon={<Icons.spacing />}
                  label="Spacing"
                  value={`Line: ${plot.lineSpacing}m, Row: ${plot.rowSpacing}m`}
                />
                <PlotDetailItem icon={<Icons.soil />} label="Soil Type" value={plot.soilType} />
                <PlotDetailItem
                  icon={<Icons.target />}
                  label="Target Market"
                  value={plot.targetMarket}
                />
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
