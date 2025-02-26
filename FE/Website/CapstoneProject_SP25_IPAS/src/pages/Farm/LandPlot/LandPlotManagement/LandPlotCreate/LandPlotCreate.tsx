import { Flex, Form, FormInstance } from "antd";
import style from "./LandPlotCreate.module.scss";
import { FormFieldModal, MapControls, MapNewLandPlot } from "@/components";
import React, { useEffect } from "react";
import { RulesManager } from "@/utils";
import { GetLandPlot } from "@/payloads";
import { PolygonInit } from "@/types";
import { useMapStore } from "@/stores";
import { Icons } from "@/assets";
import { createPlotFormFields } from "@/constants";

interface LandPlotCreateProps {
  form: FormInstance;
  landPlots: GetLandPlot[];
  setIsDirty: (dirty: boolean) => void;
}

const LandPlotCreate: React.FC<LandPlotCreateProps> = React.memo(
  ({ form, landPlots, setIsDirty }) => {
    const {
      startDrawingPolygon,
      clearPolygons,
      area,
      width,
      length,
      newPolygon,
      setNewPolygon,
      setPolygonDimensions,
    } = useMapStore();

    useEffect(() => {
      if (area !== 0 && width !== 0 && length !== 0) {
        form.setFieldsValue({
          [createPlotFormFields.area]: area,
          [createPlotFormFields.width]: width,
          [createPlotFormFields.length]: length,
        });
      }
    }, [area, width, length]);

    const handleInputChange = (value: string | number) => {
      if (value !== null && value !== undefined && value !== "") {
        setIsDirty(true);
      } else {
        setIsDirty(false);
      }
    };

    const addNewPolygon = (newPolygon: PolygonInit) => setNewPolygon(newPolygon);

    const deletePlot = () => {
      setNewPolygon(null);
      setPolygonDimensions(0, 0, 0);
      form.resetFields([
        createPlotFormFields.area,
        createPlotFormFields.width,
        createPlotFormFields.length,
      ]);
      clearPolygons();
    };

    return (
      <Flex className={style.container}>
        <Flex className={style.contentWrapper}>
          <Flex className={style.formSection}>
            <Form form={form} layout="vertical" className={style.formContainer}>
              <FormFieldModal
                label="Plot Name"
                name={createPlotFormFields.landPlotName}
                rules={RulesManager.getLandPlotNameRules()}
                placeholder="Enter land plot name"
                onChange={(e) => handleInputChange(e.target.value)}
              />
              <FormFieldModal
                type="textarea"
                label="Description"
                name={createPlotFormFields.description}
                rules={RulesManager.getFarmDescriptionRules()}
                placeholder="Enter description"
                onChange={(e) => handleInputChange(e.target.value)}
              />
              <Flex gap={20}>
                <FormFieldModal
                  label="Soil Type"
                  name={createPlotFormFields.soilType}
                  rules={RulesManager.getSoilTypeRules()}
                  placeholder="Enter soil type"
                />
                <FormFieldModal
                  label="Target Market"
                  name={createPlotFormFields.targetMarket}
                  rules={RulesManager.getTargetMarketRules()}
                  placeholder="Enter target market"
                />
              </Flex>
              <FormFieldModal
                label="Area (m²)"
                description="The calculated area is approximate and may vary slightly from the actual size."
                name={createPlotFormFields.area}
                placeholder="Auto-calculated from drawn plot"
                readonly={true}
              />
              <Flex gap={20}>
                <FormFieldModal
                  label="Length (m)"
                  description="Approximate Length"
                  name={createPlotFormFields.length}
                  placeholder="Auto-calculated from drawn plot"
                  readonly={true}
                />
                <FormFieldModal
                  label="Width (m)"
                  description="Approximate width"
                  name={createPlotFormFields.width}
                  placeholder="Auto-calculated from drawn plot"
                  readonly={true}
                />
              </Flex>
            </Form>
          </Flex>
          <Flex className={style.mapSection}>
            <Flex className={style.mapControls}>
              <MapControls
                icon={<Icons.drawPolygon />}
                isDisabled={!!newPolygon}
                label="Draw Plot"
                onClick={startDrawingPolygon}
              />
              <MapControls icon={<Icons.delete />} label="Delete Plot" onClick={deletePlot} />
              {/* <MapControls label="Edit Plot" /> */}
              {/* <MapControls label="Finish Drawing" /> */}
              {/* <MapControls label="Combine Plots" />
              <MapControls label="Uncombine Plots" /> */}
            </Flex>
            <Flex>
              <MapNewLandPlot
                longitude={landPlots[0]?.farmLongtitude ?? 0}
                latitude={landPlots[0]?.farmLatitude ?? 0}
                landPlots={landPlots}
                addNewPolygon={addNewPolygon}
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    );
  },
);

export default LandPlotCreate;
