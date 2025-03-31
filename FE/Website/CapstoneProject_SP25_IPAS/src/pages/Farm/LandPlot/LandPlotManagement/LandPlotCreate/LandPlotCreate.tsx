import { Flex, Form, FormInstance } from "antd";
import style from "./LandPlotCreate.module.scss";
import { FormFieldModal, MapControls, MapNewLandPlot } from "@/components";
import React, { useEffect, useState } from "react";
import { RulesManager } from "@/utils";
import { GetLandPlot } from "@/payloads";
import { PolygonInit } from "@/types";
import { useMapStore } from "@/stores";
import { Icons } from "@/assets";
import { createPlotFormFields } from "@/constants";

interface LandPlotCreateProps {
  isOpen: boolean;
  form: FormInstance;
  selectedPlot?: GetLandPlot | null;
  landPlots: GetLandPlot[];
}

const LandPlotCreate: React.FC<LandPlotCreateProps> = React.memo(
  ({ isOpen, form, selectedPlot, landPlots }) => {
    const {
      setIsDirty,
      startDrawingPolygon,
      clearPolygons,
      area,
      width,
      length,
      currentPolygon,
      setCurrentPolygon,
      setPolygonDimensions,
      isPolygonReady,
      setPolygonReady,
    } = useMapStore();

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

    const addNewPolygon = (newPolygon: PolygonInit) => setCurrentPolygon(newPolygon);

    const deletePlot = () => {
      setCurrentPolygon(null);
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
                  onChange={(e) => handleInputChange(e.target.value)}
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
                  longitude={landPlots[0]?.farmLongtitude ?? 0}
                  latitude={landPlots[0]?.farmLatitude ?? 0}
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
