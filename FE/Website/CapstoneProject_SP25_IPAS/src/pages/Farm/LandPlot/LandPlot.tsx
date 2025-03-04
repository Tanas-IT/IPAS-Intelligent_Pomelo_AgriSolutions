import { Flex, Input, Popover } from "antd";
import style from "./LandPlot.module.scss";
import { LandPlotActions, Loading, MapLandPlot } from "@/components";
import { useEffect, useState } from "react";
import { Icons } from "@/assets";
import PlotListPopup from "./PlotListPopup";
import { useNavigate } from "react-router-dom";
import { landPlotService } from "@/services";
import { GetLandPlot } from "@/payloads";
import { useDebounce } from "use-debounce";
import ColorGuide from "./ColorGuide";
import { AddNewPlotDrawer } from "@/pages";
import { PATHS } from "@/routes";

function LandPlot() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [landPlots, setLandPlots] = useState<GetLandPlot[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLandPlotIds, setFilteredLandPlotIds] = useState<string[]>([]);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isGuidePopupVisible, setGuidePopupVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500)[0];

  const showDrawer = () => setIsDrawerVisible(true);
  const closeDrawer = () => setIsDrawerVisible(false);

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

  useEffect(() => {
    if (debouncedSearchTerm) {
      handleSearch(debouncedSearchTerm);
    } else {
      setFilteredLandPlotIds([]);
    }
  }, [debouncedSearchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);

    const filtered = landPlots
      .filter((plot) =>
        [
          plot.landPlotName,
          plot.area,
          plot.soilType,
          plot.status,
          plot.targetMarket,
          plot.landPlotCode,
          plot.landPlotId,
        ].some((field) => String(field).toLowerCase().includes(value.toLowerCase())),
      )
      .map((plot) => plot.landPlotId);

    setFilteredLandPlotIds(filtered);
  };

  const handleClick = (plotId: number) => {
    navigate(PATHS.FARM.FARM_ROW_LIST, {
      state: { plotId, viewMode: "simulate" },
    });
  };

  const handleDelete = (plotId: number) => {
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
          longitude={landPlots[0]?.farmLongtitude ?? 0}
          latitude={landPlots[0]?.farmLatitude ?? 0}
          landPlots={landPlots}
          highlightedPlots={filteredLandPlotIds}
          onDeletePlot={handleDelete}
          onViewRows={handleClick}
        />
        <Flex className={style.mapControls}>
          <Input.Search
            placeholder="Input search text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={style.search}
          />
          <Flex className={style.actionBtnsWrapper}>
            <Popover
              content={<ColorGuide onClose={() => setGuidePopupVisible(false)} />}
              trigger="click"
              placement="bottomRight"
              open={isGuidePopupVisible}
              onOpenChange={(visible) => setGuidePopupVisible(visible)}
            >
              <>
                <LandPlotActions icon={<Icons.seedling />} label="Color Guide" />
              </>
            </Popover>
            <LandPlotActions icon={<Icons.plus />} label="Add New Plot" onClick={showDrawer} />
            <Popover
              content={
                <PlotListPopup landPlots={landPlots} onClose={() => setPopupVisible(false)} />
              }
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
      <AddNewPlotDrawer
        landPlots={landPlots}
        fetchLandPlots={fetchLandPlotData}
        isOpen={isDrawerVisible}
        onClose={closeDrawer}
      />
    </Flex>
  );
}

export default LandPlot;
