import { FC, useEffect, useState } from "react";
import style from "./LandRow.module.scss";
import { GetLandPlotSimulate } from "@/payloads";
import { Flex, Popover } from "antd";
import { Loading, MapControls, RowList } from "@/components";
import { AddNewPlotDrawer } from "@/pages";
import { Icons } from "@/assets";
import { usePanZoom } from "@/hooks";
import { landPlotService } from "@/services";
import { isOwner } from "@/utils";
import ColorGuide from "./ColorGuide";

interface SimulationViewProps {
  plotId?: number;
}

const SimulationView: FC<SimulationViewProps> = ({ plotId }) => {
  const [plotData, setPlotData] = useState<GetLandPlotSimulate>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
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
  const isOwnerLogin = isOwner();
  const [isGuidePopupVisible, setGuidePopupVisible] = useState(false);

  const closeDrawer = () => setIsDrawerVisible(false);
  const showDrawer = () => setIsDrawerVisible(true);

  const fetchPlotData = async () => {
    if (plotId) {
      try {
        setIsLoading(true);
        const res = await landPlotService.getLandPlotSimulate(plotId);

        if (res.statusCode === 200) setPlotData(res.data);
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchPlotData();
  }, [plotId]);

  if (isLoading)
    return (
      <Flex justify="center" align="center" style={{ width: "100%" }}>
        <Loading />
      </Flex>
    );
  if (!plotId || !plotData) return <p>No simulation data available</p>;

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <Flex className={style.rowHeaderWrapper}>
        {/* Nút Zoom In/Out */}
        <Flex className={style.zoomControls}>
          <span className={style.rowOrientationLabel}>
            Orientation: {plotData.isRowHorizontal ? "Horizontal" : "Vertical"}
          </span>
          <Flex gap={20} wrap="wrap" justify="end">
            <div style={{ visibility: isOwnerLogin ? "visible" : "hidden" }}>
              <MapControls
                icon={<Icons.edit />}
                label="Modify Plot Layout"
                onClick={() => showDrawer()}
              />
            </div>

            <Popover
              content={<ColorGuide onClose={() => setGuidePopupVisible(false)} />}
              trigger="click"
              placement="bottomRight"
              open={isGuidePopupVisible}
              onOpenChange={(visible) => setGuidePopupVisible(visible)}
            >
              <>
                <MapControls icon={<Icons.seedling />} label="Color Guide" />
              </>
            </Popover>
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
            rowsPerLine={plotData.rowPerLine}
            isHorizontal={plotData.isRowHorizontal}
            isEditing={false}
          />
        </div>
      </Flex>
      <AddNewPlotDrawer
        longitude={plotData.farmLongtitude}
        latitude={plotData.farmLatitude}
        plotSimulate={plotData}
        isOpen={isDrawerVisible}
        onClose={closeDrawer}
        fetchSimulateLandPlots={fetchPlotData}
      />
    </div>
  );
};

export default SimulationView;
