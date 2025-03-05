import { Flex } from "antd";
import { Images } from "@/assets";
import { landRowSimulate } from "@/payloads";
import { Tooltip } from "@/components";
import style from "./RowItem.module.scss";
import { useNavigate } from "react-router-dom";
import { HEALTH_STATUS, healthStatusColors } from "@/constants";

interface RowItemViewProps {
  plotId: number;
  row: landRowSimulate;
  rowSpacing: number;
  isHorizontal: boolean;
  onClick?: () => void;
}

const RowItemView: React.FC<RowItemViewProps> = ({
  plotId,
  row,
  rowSpacing,
  isHorizontal,
  onClick,
}) => {
  const navigate = useNavigate();
  const getPlantStyle = (i: number, isRealPlant: boolean): React.CSSProperties => {
    const spacingStyle = isHorizontal
      ? { marginRight: i !== row.treeAmount - 1 ? `${row.distance}px` : "0" }
      : { marginBottom: i !== row.treeAmount - 1 ? `${row.distance}px` : "0" };

    return {
      backgroundColor: isRealPlant ? "transparent" : "gray", // Cây thật trong suốt, cây xám có màu
      WebkitMaskImage: `url(${Images.plant2})`,
      maskImage: `url(${Images.plant2})`,
      WebkitMaskSize: "contain",
      maskSize: "contain",
      ...spacingStyle,
    };
  };

  return (
    <Flex justify="flex-start" className={style.rowContainer}>
      <Tooltip title={row.landRowCode}>
        <Flex
          className={style.row}
          vertical={!isHorizontal}
          style={{
            width: isHorizontal ? `${row.length}px` : `${row.width}px`,
            height: isHorizontal ? `${row.width}px` : `${row.length}px`,
            marginRight: `${rowSpacing}px`,
            cursor: "default",
          }}
          onClick={onClick}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {Array.from({ length: row.treeAmount }).map((_, i) => {
            const plant = row.plants.find((plant) => plant.plantIndex === i + 1); // Kiểm tra vị trí cây

            return (
              <Tooltip key={i} title={plant ? `Plant #${plant.plantCode}` : `No plant`}>
                <div
                  className={`${style.plantImage} ${plant ? style.view : ""}`}
                  style={{
                    ...getPlantStyle(i, !!plant),
                    backgroundColor: plant ? healthStatusColors[plant.healthStatus] : "gray",
                  }}
                  onClick={
                    plant
                      ? () => navigate(`/farm/land-rows/${plotId}/plants/${plant.plantId}/details`)
                      : undefined
                  }
                >
                  {/* {plant && <img src={Images.plant2} alt={`Plant #${i + 1}`} />} */}
                  {plant && plant.healthStatus === HEALTH_STATUS.HEALTHY && (
                    <img src={Images.plant2} alt={`Plant #${i + 1}`} />
                  )}
                  {/* Chỉ render ảnh khi có cây */}
                </div>
              </Tooltip>
            );
          })}
        </Flex>
      </Tooltip>
    </Flex>
  );
};

export default RowItemView;
