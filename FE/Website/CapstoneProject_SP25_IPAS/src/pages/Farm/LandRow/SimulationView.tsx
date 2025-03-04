import { FC } from "react";
import style from "./LandRow.module.scss";
import { GetLandPlotSimulate } from "@/payloads";
import { Flex } from "antd";
import { MapControls, RowList } from "@/components";
import { Icons } from "@/assets";
import { usePanZoom } from "@/hooks";

interface SimulationViewProps {
  plotData?: GetLandPlotSimulate;
}

const SimulationView: FC<SimulationViewProps> = ({ plotData }) => {
  const {
    scale,
    setScale,
    offset,
    isPanning,
    containerRef,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = usePanZoom();

  if (!plotData) return <p>No simulation data available</p>;

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <Flex className={style.rowHeaderWrapper}>
        <Flex>
          <Flex className={style.rowInfoContainer}>
            <span className={style.rowOrientationLabel}>
              Orientation: {plotData.isRowHorizontal ? "Horizontal" : "Vertical"}
            </span>
          </Flex>

          {/* Nút Zoom In/Out */}
          <Flex className={style.zoomControls}>
            <MapControls
              icon={<Icons.zoomIn />}
              label="Zoom In"
              onClick={() => setScale((prev) => Math.min(prev + 0.1, 2))}
            />
            <MapControls
              icon={<Icons.zoomOut />}
              label=" Zoom Out"
              onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.5))}
            />
          </Flex>
        </Flex>
      </Flex>

      <Flex
        className={style.draggableRowContainer}
        style={{ cursor: isPanning ? "grabbing" : "grab" }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "center",
            transition: isPanning ? "none" : "transform 0.1s ease-out",
            width: "fit-content",
          }}
        >
          <RowList
            plotId={plotData.landPlotId}
            rowsData={plotData.landRows}
            rowSpacing={plotData.rowSpacing}
            rowsPerLine={plotData.rowPerLine}
            lineSpacing={plotData.lineSpacing}
            isHorizontal={plotData.isRowHorizontal}
            isEditing={false}
          />
        </div>
      </Flex>
    </div>
  );
};

export default SimulationView;
