import React from "react";
import style from "./MapLandPlot.module.scss";
import { Button, Flex, Tag, Typography } from "antd";
const { Text } = Typography;
import { GetLandPlot } from "@/payloads";
import { Icons } from "@/assets";
import { formatDate, isManager } from "@/utils";
import PlotDetailItem from "../PlotDetailItem/PlotDetailItem";

interface PopupContentProps {
  plot: GetLandPlot;
  onClose: () => void;
  onViewRows?: (plotId: number) => void;
  onUpdatePlot?: (plot: GetLandPlot) => void;
  onDeletePlot?: (plotId: number) => void;
}

const PopupContent: React.FC<PopupContentProps> = ({
  plot,
  onClose,
  onViewRows = () => {},
  onUpdatePlot = () => {},
  onDeletePlot = () => {},
}) => {
  const notManagerIn = !isManager();
  return (
    <div className={style.popupContainer}>
      <Flex className={style.popupHeader}>
        <h3>Plot Detail</h3>
        <button className={style.popupClose} onClick={onClose}>
          &times;
        </button>
      </Flex>
      <Flex className={style.plotItemWrapper}>
        <Flex className={style.col}>
          <Flex className={style.plotItemHeader}>
            <Flex className={style.row}>
              <Text className={style.plotItemTitle}>
                {plot.landPlotName} - {plot.landPlotCode}
              </Text>
              {/* <Tag
                color={
                  plot.status === "Active" ? "green" : plot.status === "Warning" ? "orange" : "red"
                }
              >
                {plot.status}
              </Tag> */}
            </Flex>
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
          <PlotDetailItem icon={<Icons.target />} label="Target Market" value={plot.targetMarket} />
        </Flex>
      </Flex>
      <Flex className={style.popupFooter}>
        {notManagerIn && (
          <Flex gap={20}>
            <Button
              type="primary"
              danger
              onClick={() => onDeletePlot(Number(plot.landPlotId))}
              className={style.btn}
            >
              Delete
            </Button>
            <Button
              onClick={() => onUpdatePlot(plot)}
              className={`${style.btn} ${style.updateBtn}`}
            >
              Update
            </Button>
          </Flex>
        )}

        <Button
          onClick={() => onViewRows(Number(plot.landPlotId))}
          className={`${style.btn} ${style.updateBtn}`}
        >
          View Rows
        </Button>
      </Flex>
    </div>
  );
};

export default PopupContent;
