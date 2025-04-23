import { Flex } from "antd";
import { Images } from "@/assets";
import { landRowSimulate, plantSimulate } from "@/payloads";
import { Tooltip } from "@/components";
import style from "./RowItem.module.scss";
import { useNavigate } from "react-router-dom";
import { DEAD_STATUS, HEALTH_STATUS, healthStatusColors, ROUTES } from "@/constants";
import { calculateRowLength } from "@/utils";
import { useVirtualPlotConfigStore } from "@/stores";

interface RowItemViewProps {
  plotId: number;
  row: landRowSimulate;
  isHorizontal: boolean;
  onClick?: () => void;
}

const RowItemView: React.FC<RowItemViewProps> = ({
  plotId,
  row,
  isHorizontal,
  onClick,
}) => {
  const navigate = useNavigate();
  const { sizePlant, rowWidth, distance, rowSpacing } = useVirtualPlotConfigStore();

  const rowLength = calculateRowLength(row.treeAmount, distance, sizePlant);

  const getPlantStyle = (i: number, isRealPlant: boolean): React.CSSProperties => {
    const spacingStyle = isHorizontal
      ? { marginRight: i !== row.treeAmount - 1 ? `${distance}px` : "0" }
      : { marginBottom: i !== row.treeAmount - 1 ? `${distance}px` : "0" };

    // return {
    //   // backgroundColor: isRealPlant ? "transparent" : "gray",
    //   WebkitMaskImage: `url(${Images.plant2})`,
    //   maskImage: `url(${Images.plant2})`,
    //   WebkitMaskSize: "contain",
    //   maskSize: "contain",
    //   ...spacingStyle,
    // };
    return isRealPlant
      ? {
          WebkitMaskImage: `url(${Images.plant2})`,
          maskImage: `url(${Images.plant2})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          ...spacingStyle,
        }
      : {
          backgroundImage: `url(${Images.noPlant})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          // backgroundPosition: "center",
          ...spacingStyle,
        };
  };

  return (
    <Flex justify="flex-start" className={style.rowContainer}>
      {/* <Tooltip title={row.landRowCode}> */}
      <Flex
        className={style.row}
        vertical={!isHorizontal}
        style={{
          width: isHorizontal ? `${rowLength}px` : `${rowWidth}px`,
          height: isHorizontal ? `${rowWidth}px` : `${rowLength}px`,
          marginRight: `${rowSpacing}px`,
          cursor: "default",
        }}
        onClick={onClick}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {Array.from({ length: row.treeAmount }).map((_, i) => {
          // Lọc cây tại vị trí i + 1
          const plantsAtPosition = row.plants.filter((p) => p.plantIndex === i + 1);
          // Ưu tiên cây sống, nếu không có thì lấy cây chết
          const displayedPlant: plantSimulate | undefined =
            plantsAtPosition.find((p) => p.healthStatus !== DEAD_STATUS) || plantsAtPosition[0];

          return (
            <Tooltip
              key={i}
              title={displayedPlant ? `Plant #${displayedPlant.plantCode}` : `No plant`}
            >
              <div
                className={`${style.plantImage} ${displayedPlant ? style.view : ""}`}
                style={{
                  width: `${sizePlant}px`,
                  height: `${sizePlant}px`,
                  ...getPlantStyle(i, !!displayedPlant),
                  backgroundColor:
                    displayedPlant && healthStatusColors[displayedPlant.healthStatus],
                  // : "transparent",
                }}
                onClick={
                  displayedPlant
                    ? () =>
                        navigate(ROUTES.FARM_PLANT_DETAIL_FROM_ROW(plotId, displayedPlant.plantId))
                    : undefined
                }
              >
                {/* Chỉ render ảnh khi có cây và nó không bị chết */}
                {displayedPlant && displayedPlant.healthStatus === HEALTH_STATUS.HEALTHY && (
                  <img src={Images.plant2} alt={`Plant #${i + 1}`} />
                )}
                {/* {displayedPlant ? (
                  displayedPlant.healthStatus === HEALTH_STATUS.HEALTHY ? (
                    <img src={Images.plant2} alt={`Plant #${i + 1}`} />
                  ) : null
                ) : (
                  <img src={Images.noPlant} alt="No plant" />
                )} */}
              </div>
            </Tooltip>
          );
        })}
      </Flex>
      {/* </Tooltip> */}
    </Flex>
  );
};

export default RowItemView;
