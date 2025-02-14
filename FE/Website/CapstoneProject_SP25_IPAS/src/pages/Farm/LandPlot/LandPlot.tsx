import { Button, Flex, Input, Popover, Typography } from "antd";
import style from "./LandPlot.module.scss";
import { LandPlotActions, MapLandPlot, SectionTitle } from "@/components";
import { useEffect, useState } from "react";
import { CoordsState } from "@/types";
import { Icons } from "@/assets";
import PlotListPopup from "./PlotListPopup";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";

function LandPlot() {
  const navigate = useNavigate();
  const [farmLocation, setFarmLocation] = useState<CoordsState>({
    longitude: 106.786528,
    latitude: 10.9965,
  });
  const [isPopupVisible, setPopupVisible] = useState(false);

  const popoverContent = (
    <Flex vertical>
      <LandPlotActions
        icon={<Icons.plus />}
        label=" Add New Land Plot"
        isAction={true}
        onClick={() => navigate(PATHS.FARM.FARM_PLOT_CREATE)}
      />
      <LandPlotActions
        icon={<Icons.edit />}
        label="  Update Existing Land Plot"
        isAction={true}
        onClick={() => handleUpdatePlot()}
      />
    </Flex>
  );

  const handleUpdatePlot = () => {
    console.log("Opening Update Plot form...");
    // Mở modal hoặc chuyển trang đến form cập nhật
  };

  return (
    <Flex className={style.container}>
      {/* <SectionTitle title="Plant Management" totalRecords={10} /> */}
      <div className={style.mapWrapper}>
        <MapLandPlot
          longitude={farmLocation.longitude}
          latitude={farmLocation.latitude}
          isEditing={false}
          // setMarkerPosition={setMarkerPosition}
        />
        <Flex className={style.mapControls}>
          <Input.Search
            placeholder="input search text"
            onSearch={() => {}}
            className={style.search}
          />
          <Flex className={style.actionBtnsWrapper}>
            <Popover content={popoverContent} trigger="click" placement="bottomRight">
              <>
                <LandPlotActions icon={<Icons.tool />} label="Manage Plot" />
              </>
            </Popover>
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
