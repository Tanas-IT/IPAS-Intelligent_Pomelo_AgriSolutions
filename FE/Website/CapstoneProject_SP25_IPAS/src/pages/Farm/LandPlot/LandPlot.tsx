import { Button, Flex, Input, Popover, Typography } from "antd";
import style from "./LandPlot.module.scss";
import { LandPlotActions, Loading, MapLandPlot, SectionTitle } from "@/components";
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
  const [selectedPolygon, setSelectedPolygon] = useState<string | null>(null);
  const [polygons, setPolygons] = useState<PolygonInit[]>([
    {
      id: "polygon1",
      coordinates: [
        [
          [106.78546314117068, 10.997278708395825],
          [106.78589533924475, 10.997556840012322],
          [106.78592699828585, 10.99751539287513],
          [106.78547296403684, 10.997232090171735],
          [106.78546314117068, 10.997278708395825],
        ],
      ],
    },
    {
      id: "polygon2",
      coordinates: [
        [
          [106.7855136114656, 10.997171331485006],
          [106.78596437055711, 10.997462428171985],
          [106.78593105040267, 10.997509293796838],
          [106.78547802086456, 10.997225685284874],
          [106.7855136114656, 10.997171331485006],
        ],
      ],
    },
  ]);
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

  // useEffect(() => {
  //   fetchLandPlotData();
  // }, []);

  if (isLoading) return <Loading />;

  return (
    <Flex className={style.container}>
      {/* <SectionTitle title="Plant Management" totalRecords={10} /> */}
      <div className={style.mapWrapper}>
        <MapLandPlot
          longitude={farmLocation.longitude}
          latitude={farmLocation.latitude}
          isEditing={false}
          polygons={polygons}

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
