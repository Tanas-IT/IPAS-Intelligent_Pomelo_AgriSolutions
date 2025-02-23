import { Flex, Form, FormInstance } from "antd";
import style from "./LandPlotCreate.module.scss";
import { FormFieldModal, MapControls, MapLandPlot } from "@/components";
import React, { useEffect, useRef, useState } from "react";
import { RulesManager } from "@/utils";
import { GetLandPlot } from "@/payloads";
import { MapLandPlotRef } from "@/components/UI/Maps/MapLandPlot/MapLandPlot";

interface LandPlotCreateProps {
  form: FormInstance;
  landPlots: GetLandPlot[];
  setIsDirty: (dirty: boolean) => void;
}

const LandPlotCreate: React.FC<LandPlotCreateProps> = React.memo(
  ({ form, landPlots, setIsDirty }) => {
    const mapRef = useRef<MapLandPlotRef>(null);

    const handleInputChange = () => {
      setIsDirty(true); // Đánh dấu form đã thay đổi
    };

    const handleDrawPolygon = () => {
      mapRef.current?.startDrawingPolygon();
    };

    return (
      <Flex className={style.container}>
        <Flex className={style.contentWrapper}>
          <Flex className={style.formSection}>
            <Form form={form} layout="vertical" className={style.formContainer}>
              <FormFieldModal
                label="Plot Name"
                name={"landPlotName"}
                rules={RulesManager.getLandPlotNameRules()}
                placeholder="Enter land plot name"
                onChange={handleInputChange}
              />
              <FormFieldModal
                type="textarea"
                label="Description"
                name={"description"}
                rules={RulesManager.getFarmDescriptionRules()}
                placeholder="Enter description"
                onChange={handleInputChange}
              />
              <FormFieldModal
                label="Area (m²)"
                name={"area"}
                placeholder="Auto-calculated from drawn plot"
                readonly={true}
              />
            </Form>
          </Flex>
          <Flex className={style.mapSection}>
            <Flex className={style.mapControls}>
              <MapControls label="Draw Polygon" onClick={handleDrawPolygon} />
              <MapControls label="Delete Plot" />
              <MapControls label="Edit Plot" />
              <MapControls label="Finish Drawing" />
              {/* <MapControls label="Combine Plots" />
              <MapControls label="Uncombine Plots" /> */}
            </Flex>
            <Flex>
              <MapLandPlot
                ref={mapRef}
                longitude={landPlots[0]?.farmLongtitude ?? 0}
                latitude={landPlots[0]?.farmLatitude ?? 0}
                landPlots={landPlots}
                isShowInfo={false}
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    );
  },
);

export default LandPlotCreate;
