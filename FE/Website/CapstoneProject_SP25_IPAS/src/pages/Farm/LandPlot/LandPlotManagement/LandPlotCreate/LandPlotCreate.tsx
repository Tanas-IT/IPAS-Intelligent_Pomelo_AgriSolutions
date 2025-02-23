import { Flex, Form, FormInstance } from "antd";
import style from "./LandPlotCreate.module.scss";
import { InfoField, MapControls, MapLandPlot } from "@/components";
import React, { useEffect, useState } from "react";
import { RulesManager } from "@/utils";
import { GetLandPlot } from "@/payloads";

interface LandPlotCreateProps {
  form: FormInstance;
  landPlots: GetLandPlot[];
  setIsDirty: (dirty: boolean) => void;
}

const LandPlotCreate: React.FC<LandPlotCreateProps> = React.memo(
  ({ form, landPlots, setIsDirty }) => {
    const handleInputChange = () => {
      setIsDirty(true); // Đánh dấu form đã thay đổi
    };

    return (
      <Flex className={style.container}>
        <Flex className={style.contentWrapper}>
          <Flex className={style.formSection}>
            <Form form={form} layout="vertical" className={style.formContainer}>
              <InfoField
                label="Plot Name"
                name={"landPlotName"}
                rules={RulesManager.getLandPlotNameRules()}
                placeholder="Enter land plot name"
                onChange={handleInputChange}
              />
              <InfoField
                type="textarea"
                label="Description"
                name={"description"}
                rules={RulesManager.getFarmDescriptionRules()}
                placeholder="Enter description"
                onChange={handleInputChange}
              />
              <InfoField
                label="Area (m²)"
                name={"area"}
                placeholder="Auto-calculated from drawn plot"
                isEditing={false}
              />
            </Form>
          </Flex>
          <Flex className={style.mapSection}>
            {/* <Flex className={style.mapControls}>
            <MapControls label="Zoom In" />
            <MapControls label="Zoom Out" />
            <MapControls label="Draw Plot" />
          </Flex> */}
            <Flex>
              <MapLandPlot
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
