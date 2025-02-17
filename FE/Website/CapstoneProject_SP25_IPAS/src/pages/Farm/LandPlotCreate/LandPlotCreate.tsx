import { Button, Flex, Form, Input, Popover, Typography } from "antd";
import style from "./LandPlotCreate.module.scss";
import { EditActions, InfoField, MapControls, MapLandPlot } from "@/components";
import { useEffect, useState } from "react";
import { CoordsState, PolygonInit } from "@/types";
import { Icons } from "@/assets";

import { useSidebarStore } from "@/stores";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import { RulesManager } from "@/utils";

function LandPlotCreate() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [farmLocation, setFarmLocation] = useState<CoordsState>({
    longitude: 106.786528,
    latitude: 10.9965,
  });
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
  const { setSidebarState } = useSidebarStore();
  useEffect(() => {
    setSidebarState(false);
  }, []);

  const handleCancel = () => navigate(PATHS.FARM.FARM_PLOT_LIST);

  const handleSave = async () => {
    var values = await form.validateFields();
    console.log(values);
  };

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
              longitude={farmLocation.longitude}
              latitude={farmLocation.latitude}
              isEditing={false}
              polygons={polygons}
            />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default LandPlotCreate;
