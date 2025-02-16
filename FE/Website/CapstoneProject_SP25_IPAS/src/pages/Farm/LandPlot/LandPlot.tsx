import { Button, Flex, Input, Popover, Typography } from "antd";
import style from "./LandPlot.module.scss";
import { ConfirmModal, LandPlotActions, Loading, MapLandPlot, SectionTitle } from "@/components";
import { useEffect, useState } from "react";
import { CoordsState, PolygonInit } from "@/types";
import { Icons } from "@/assets";
import PlotListPopup from "./PlotListPopup";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import { landPlotService } from "@/services";
import { GetLandPlot } from "@/payloads";

function LandPlot() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [farmLocation, setFarmLocation] = useState<CoordsState>({
    longitude: 106.786528,
    latitude: 10.9965,
  });
  const [landPlots, setLandPlots] = useState<GetLandPlot[]>([]);
  const [isPopupVisible, setPopupVisible] = useState(false);

  const fetchLandPlotData = async () => {
    try {
      setIsLoading(true);
      const result = await landPlotService.getLandPlots();

      if (result.statusCode === 200) {
        setLandPlots(result.data);
      }
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLandPlotData();
  }, []);

  const handleDelete = () => {
    console.log("Xóa lô đất!");
    // TODO: Gọi API hoặc thực hiện logic xóa ở đây
  };

  const handleUpdate = () => {
    console.log("Cập nhật lô đất!");
    // TODO: Gọi API hoặc mở modal chỉnh sửa
  };

  if (isLoading) return <Loading />;

  return (
    <Flex className={style.container}>
      {/* <SectionTitle title="Plant Management" totalRecords={10} /> */}
      <div className={style.mapWrapper}>
        <MapLandPlot
          longitude={farmLocation.longitude}
          latitude={farmLocation.latitude}
          isEditing={false}
          landPlots={landPlots}
          // setMarkerPosition={setMarkerPosition}
        />
        <Flex className={style.mapControls}>
          <Input.Search
            placeholder="input search text"
            onSearch={() => {}}
            className={style.search}
          />
          <Flex className={style.actionBtnsWrapper}>
            <LandPlotActions
              icon={<Icons.plus />}
              label="Add New Plot"
              onClick={() => navigate(PATHS.FARM.FARM_PLOT_CREATE)}
            />
            <Popover
              content={<PlotListPopup onClose={() => setPopupVisible(false)} />}
              trigger="click"
              placement="bottomRight"
              open={isPopupVisible}
              onOpenChange={(visible) => setPopupVisible(visible)}
            >
              <>
                <LandPlotActions icon={<Icons.seedling />} label="View Land Plots" />
              </>
            </Popover>
          </Flex>
        </Flex>
      </div>
    </Flex>
  );
}

export default LandPlot;
