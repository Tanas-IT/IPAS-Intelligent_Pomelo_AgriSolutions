import { Flex, Form, FormInstance } from "antd";
import style from "./LandPlotCreate.module.scss";
import { FormFieldModal, MapControls, MapNewLandPlot } from "@/components";
import React, { useEffect } from "react";
import { RulesManager } from "@/utils";
import { GetLandPlot } from "@/payloads";
import { PolygonInit } from "@/types";
import { useMapStore } from "@/stores";
import { Icons } from "@/assets";
import { createPlotFormFields, SYSTEM_CONFIG_GROUP } from "@/constants";
import { useSystemConfigOptions } from "@/hooks";

interface LandPlotCreateProps {
  isOpen: boolean;
  form: FormInstance;
  selectedPlot?: GetLandPlot | null;
  latitude: number;
  longitude: number;
  landPlots: GetLandPlot[];
}

const LandPlotCreate: React.FC<LandPlotCreateProps> = React.memo(
  ({ isOpen, form, selectedPlot, latitude, longitude, landPlots }) => {
    const {
      setIsDirty,
      startDrawingPolygon,
      clearPolygons,
      area,
      width,
      length,
      setPolygonDimensions,
      currentPolygon,
      setCurrentPolygon,
      isPolygonReady,
      setPolygonReady,
    } = useMapStore();

    const { options: soilOptions, loading: soilLoading } = useSystemConfigOptions(
      SYSTEM_CONFIG_GROUP.SOIL_TYPE,
    );

    useEffect(() => {
      if (!isOpen) return;

      if (isOpen && selectedPlot) {
        form.setFieldsValue({
          [createPlotFormFields.landPlotName]: selectedPlot.landPlotName,
          [createPlotFormFields.description]: selectedPlot.description,
          [createPlotFormFields.soilType]: selectedPlot.soilType,
          [createPlotFormFields.targetMarket]: selectedPlot.targetMarket,
          [createPlotFormFields.area]: selectedPlot.area,
          [createPlotFormFields.length]: selectedPlot.length,
          [createPlotFormFields.width]: selectedPlot.width,
          // [createPlotFormFields.status]: selectedPlot.status,
        });

        setPolygonDimensions(selectedPlot.area, selectedPlot.width, selectedPlot.length);
        const landPlotCoordinationsData =
          typeof selectedPlot.landPlotCoordinations === "string"
            ? JSON.parse(selectedPlot.landPlotCoordinations)
            : selectedPlot.landPlotCoordinations;

        // Kiểm tra nếu landPlotCoordinations tồn tại và là một mảng hợp lệ
        if (Array.isArray(landPlotCoordinationsData) && landPlotCoordinationsData.length > 0) {
          const coordinates = landPlotCoordinationsData.map(({ longitude, latitude }) => [
            longitude,
            latitude,
          ]);

          // Đóng polygon lại nếu chưa khép kín
          if (
            coordinates.length > 2 &&
            (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
              coordinates[0][1] !== coordinates[coordinates.length - 1][1])
          ) {
            coordinates.push(coordinates[0]); // Thêm điểm đầu vào cuối để polygon khép kín
          }
          setCurrentPolygon({
            id: selectedPlot.landPlotId,
            coordinates: [coordinates], // Đảm bảo có cấu trúc [[[]]]
          });

          setTimeout(() => setPolygonReady(true), 0);
        }
      } else {
        setPolygonReady(true);
      }
    }, [isOpen, selectedPlot]);

    // useEffect(() => {
    //   if (area !== 0 && width !== 0 && length !== 0) {
    //     form.setFieldsValue({
    //       [createPlotFormFields.area]: area,
    //       [createPlotFormFields.width]: width,
    //       [createPlotFormFields.length]: length,
    //     });
    //   }
    // }, [area, width, length]);

    const handleInputChange = (value: string | number) => {
      if (value !== null && value !== undefined && value !== "") {
        setIsDirty(true);
      } else {
        setIsDirty(false);
      }
    };

    const addNewPolygon = (newPolygon: PolygonInit) => setCurrentPolygon(newPolygon);

    const deletePlot = () => {
      setCurrentPolygon(null);
      // setPolygonDimensions(0, 0, 0);
      // form.resetFields([
      //   createPlotFormFields.area,
      //   createPlotFormFields.width,
      //   createPlotFormFields.length,
      // ]);
      clearPolygons();
    };

    const AutoCalculateArea: React.FC<{ form: FormInstance }> = ({ form }) => {
      const length = Form.useWatch(createPlotFormFields.length, form);
      const width = Form.useWatch(createPlotFormFields.width, form);

      useEffect(() => {
        const l = Number(length);
        const w = Number(width);
        if (!isNaN(l) && !isNaN(w) && l > 0 && w > 0) {
          const area = l * w;
          form.setFieldValue(createPlotFormFields.area, parseFloat(area.toFixed(2)));
        } else {
          form.setFieldValue(createPlotFormFields.area, undefined);
        }
      }, [length, width]);

      return null;
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
                  type="select"
                  label="Soil Type"
                  name={createPlotFormFields.soilType}
                  rules={RulesManager.getSoilTypeRules()}
                  placeholder="Enter soil type"
                  onChange={handleInputChange}
                  isLoading={soilLoading}
                  options={soilOptions}
                />
                <FormFieldModal
                  label="Target Market"
                  name={createPlotFormFields.targetMarket}
                  rules={RulesManager.getTargetMarketRules()}
                  placeholder="Enter target market"
                  onChange={(e) => handleInputChange(e.target.value)}
                />
              </Flex>
              {/* {selectedPlot && (
                <FormFieldModal
                  label="Status"
                  name={createPlotFormFields.status}
                  placeholder="Enter status"
                  onChange={(e) => handleInputChange(e.target.value)}
                />
              )} */}
              <Flex gap={20}>
                <FormFieldModal
                  label="Length (m)"
                  name={createPlotFormFields.length}
                  placeholder="Length (m)"
                  rules={RulesManager.getNumberRules("Length")}
                />
                <FormFieldModal
                  label="Width (m)"
                  name={createPlotFormFields.width}
                  placeholder="Width (m)"
                  rules={RulesManager.getNumberRules("Width")}
                />
              </Flex>
              <FormFieldModal
                label="Area (m²)"
                description="Automatically calculated from length × width. Actual size may vary slightly."
                name={createPlotFormFields.area}
                placeholder="Calculated from length and width"
                readonly={true}
              />
              <AutoCalculateArea form={form} />
            </Form>
          </Flex>
          <Flex className={style.mapSection}>
            <Flex className={style.mapControls}>
              <MapControls
                icon={<Icons.drawPolygon />}
                isDisabled={!!currentPolygon}
                label="Draw Plot"
                onClick={startDrawingPolygon}
              />
              <MapControls icon={<Icons.delete />} label="Delete Plot" onClick={deletePlot} />
              {/* <MapControls label="Edit Plot" /> */}
              {/* <MapControls label="Finish Drawing" /> */}
              {/* <MapControls label="Combine Plots" />
              <MapControls label="Uncombine Plots" /> */}
            </Flex>
            {isPolygonReady && (
              <Flex>
                <MapNewLandPlot
                  longitude={longitude}
                  latitude={latitude}
                  landPlots={landPlots}
                  selectedPlot={selectedPlot}
                  addNewPolygon={addNewPolygon}
                />
              </Flex>
            )}
          </Flex>
        </Flex>
      </Flex>
    );
  },
);

export default LandPlotCreate;
