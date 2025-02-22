import { Button, Flex, Form, Input, Popover, Typography } from "antd";
import style from "./LandPlotCreate.module.scss";
import { EditActions, InfoField, Loading, MapControls, MapLandPlot } from "@/components";
import { useEffect, useState } from "react";
import { Icons } from "@/assets";

import { useSidebarStore } from "@/stores";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import { RulesManager } from "@/utils";
import { LandPlotsStateType } from "@/types";
import { landPlotService } from "@/services";

function LandPlotCreate() {
  const location = useLocation();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [state, setState] = useState<LandPlotsStateType>({
    longitude: 0,
    latitude: 0,
    landPlots: [],
  });

  const { setSidebarState } = useSidebarStore();
  useEffect(() => {
    setSidebarState(false);
  }, []);

  const fetchLandPlotData = async () => {
    try {
      setIsLoading(true);
      console.log(1);
      
      const result = await landPlotService.getLandPlots();

      if (result.statusCode === 200) {
        setState({
          longitude: result.data[0]?.farmLongtitude ?? 0,
          latitude: result.data[0]?.farmLatitude ?? 0,
          landPlots: result.data,
        });
      }
    } catch (error) {
      console.error("Fetch data error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (location.state) {
      const { longitude, latitude, landPlots } = location.state as LandPlotsStateType;
      setState({
        longitude: longitude ?? 0,
        latitude: latitude ?? 0,
        landPlots: landPlots ?? [],
      });
    } else {
      fetchLandPlotData();
    }
  }, [location.state]);

  const { longitude, latitude, landPlots } = state;

  const handleCancel = () => navigate(PATHS.FARM.FARM_PLOT_LIST);

  const handleSave = async () => {
    var values = await form.validateFields();
    console.log(values);
  };

  if (isLoading) return <Loading />;

  return (
    <Flex className={style.container}>
      <Flex justify="flex-end">
        <EditActions handleCancel={handleCancel} handleSave={handleSave} label="Create Plot" />
      </Flex>
      <Flex className={style.contentWrapper}>
        <Flex className={style.formSection}>
          <Form form={form} layout="vertical" className={style.formContainer}>
            <InfoField
              label="Plot Name"
              name={"landPlotName"}
              rules={RulesManager.getFarmNameRules()}
              placeholder="Enter land plot name"
            />
            <InfoField
              type="textarea"
              label="Description"
              name={"description"}
              rules={RulesManager.getFarmNameRules()}
              placeholder="Enter description"
            />
            <InfoField
              label="Area (m²)"
              name={"area"}
              placeholder="Auto-calculated from drawn plot"
              isEditing={false}
            />
            {/* <Flex className={style.sectionFooter}>
            <EditActions handleCancel={handleCancel} handleSave={handleSave} label="Create Plot" />
          </Flex> */}
          </Form>
        </Flex>
        <Flex className={style.mapSection}>
          <Flex className={style.mapControls}>
            <MapControls label="Zoom In" />
            <MapControls label="Zoom Out" />
            <MapControls label="Draw Plot" />
          </Flex>
          <Flex>
            <MapLandPlot
              longitude={longitude}
              latitude={latitude}
              isEditing={false}
              landPlots={landPlots}
            />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default LandPlotCreate;
