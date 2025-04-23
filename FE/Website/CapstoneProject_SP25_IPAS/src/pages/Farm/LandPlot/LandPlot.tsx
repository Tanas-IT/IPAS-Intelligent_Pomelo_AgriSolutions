import { Flex, Input, Popover } from "antd";
import style from "./LandPlot.module.scss";
import { ConfirmModal, LandPlotActions, Loading, MapLandPlot } from "@/components";
import { useEffect, useState } from "react";
import { Icons } from "@/assets";
import PlotListPopup from "./PlotListPopup";
import { useNavigate } from "react-router-dom";
import { landPlotService } from "@/services";
import { GetLandPlot, GetLandPlotOfFarm } from "@/payloads";
import { useDebounce } from "use-debounce";
import ColorGuide from "./ColorGuide";
import { AddNewPlotDrawer } from "@/pages";
import { PATHS } from "@/routes";
import { toast } from "react-toastify";
import { useModal } from "@/hooks";
import { isManager } from "@/utils";

function LandPlot() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [landPlots, setLandPlots] = useState<GetLandPlotOfFarm>({
    longitude: 0,
    latitude: 0,
    landPlots: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredLandPlotIds, setFilteredLandPlotIds] = useState<string[]>([]);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [isGuidePopupVisible, setGuidePopupVisible] = useState(false);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [selectedPlot, setSelectedPlot] = useState<GetLandPlot | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500)[0];
  const deleteConfirmModal = useModal<{ id: number }>();
  const notManagerIn = !isManager();

  // const showDrawer = () => setIsDrawerVisible(true);
  const closeDrawer = () => setIsDrawerVisible(false);

  const fetchLandPlotData = async () => {
    try {
      setIsLoading(true);
      const result = await landPlotService.getLandPlots();
      console.log(result);
      
      if (result.statusCode === 200) setLandPlots(result.data);
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
    const landPlotsRes = landPlots?.landPlots ?? [];
    const filtered = landPlotsRes
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

  const showDrawer = (plot?: GetLandPlot) => {
    setSelectedPlot(plot ?? null);
    setIsDrawerVisible(true);
  };

  const handleClick = (plotId: number) => {
    navigate(PATHS.FARM.FARM_ROW_LIST, {
      state: { plotId, viewMode: "simulate" },
    });
  };

  const handleDelete = async (plotId: number | undefined) => {
    if (!plotId) return;
    const res = await landPlotService.deleteLandPlot(plotId);
    if (res.statusCode === 200) {
      toast.success(res.message);
      await fetchLandPlotData();
    } else {
      toast.error(res.message);
    }
    deleteConfirmModal.hideModal();
  };

  const handleUpdate = (plot: GetLandPlot) => {
    showDrawer(plot);
  };

  if (isLoading) return <Loading />;

  return (
    <Flex className={style.container}>
      {/* <SectionTitle title="Plant Management" totalRecords={10} /> */}
      <div className={style.mapWrapper}>
        <MapLandPlot
          longitude={landPlots.longitude}
          latitude={landPlots.latitude}
          landPlots={landPlots.landPlots}
          highlightedPlots={filteredLandPlotIds}
          onDeletePlot={(id) => deleteConfirmModal.showModal({ id: id })}
          onUpdatePlot={handleUpdate}
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
            {notManagerIn && (
              <LandPlotActions
                icon={<Icons.plus />}
                label="Add New Plot"
                onClick={() => showDrawer()}
              />
            )}

            <Popover
              content={
                <PlotListPopup
                  landPlots={landPlots.landPlots}
                  onClose={() => setPopupVisible(false)}
                />
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
        longitude={landPlots.longitude}
        latitude={landPlots.latitude}
        landPlots={landPlots.landPlots}
        fetchLandPlots={fetchLandPlotData}
        isOpen={isDrawerVisible}
        onClose={closeDrawer}
        selectedPlot={selectedPlot}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={() => handleDelete(deleteConfirmModal.modalState.data?.id)}
        onCancel={deleteConfirmModal.hideModal}
        itemName="Plot"
        actionType="delete"
      />
    </Flex>
  );
}

export default LandPlot;
