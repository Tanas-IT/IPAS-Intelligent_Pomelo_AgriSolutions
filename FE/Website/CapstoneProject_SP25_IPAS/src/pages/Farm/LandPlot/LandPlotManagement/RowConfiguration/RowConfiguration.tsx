import { Flex, Form, FormInstance } from "antd";
import style from "./RowConfiguration.module.scss";
import React from "react";
import { CustomButton, InfoField } from "@/components";
import { generateValidPlotAutoFillData, RulesManager } from "@/utils";
import { createPlotFormFields } from "@/constants";
import { useMapStore, useVirtualPlotConfigStore } from "@/stores";

interface RowConfigurationProps {
  form: FormInstance;
  plotName: string;
  plotLength: number;
  plotWidth: number;
}

const RowConfiguration: React.FC<RowConfigurationProps> = React.memo(
  ({ form, plotName, plotLength, plotWidth }) => {
    const { setIsDirty } = useMapStore();
    const { metricUnit } = useVirtualPlotConfigStore();

    const handleAutoFill = () => {
      const plotAuto = generateValidPlotAutoFillData(plotLength, plotWidth);
      form.setFieldsValue(plotAuto);
      setIsDirty(true);
    };

    const handleClear = () => {
      form.setFieldsValue({
        [createPlotFormFields.rowLength]: undefined,
        [createPlotFormFields.rowWidth]: undefined,
        [createPlotFormFields.numberOfRows]: undefined,
        [createPlotFormFields.rowSpacing]: undefined,
        [createPlotFormFields.rowsPerLine]: undefined,
        [createPlotFormFields.lineSpacing]: undefined,
        [createPlotFormFields.rowOrientation]: undefined,
        [createPlotFormFields.plantsPerRow]: undefined,
        [createPlotFormFields.plantSpacing]: undefined,
      });
      setIsDirty(false);
    };

    const handleInputChange = (value: string | number) => {
      if (value !== null && value !== undefined && value !== "") {
        setIsDirty(true);
      } else {
        setIsDirty(false);
      }
    };

    return (
      <Flex className={style.rowConfigurationContainer}>
        <Flex className={style.plotInfoHeader}>
          <Flex className={style.plotNameWrapper}>
            <label className={style.plotLabel}>Plot Name: </label>
            <span className={style.plotName}>{plotName}</span>
          </Flex>

          <Flex className={style.autoFillButtonContainer}>
            <CustomButton label="Clear Data" handleOnClick={handleClear} />
            <CustomButton label="Generate Sample Data" handleOnClick={handleAutoFill} />
          </Flex>
        </Flex>

        <Flex className={style.rowContentSection}>
          <Form form={form} className={style.formContainer}>
            <Flex className={style.formSection}>
              <label className={style.sectionLabel}>Row Information</label>
              {/* <div className={style.unitNote}>
              <i>Note: Distances are in pixels (px). In this setup, 1 meter ≈ 10 px.</i>
            </div> */}
              <Flex className={style.setupSection}>
                <Flex className={style.row}>
                  <InfoField
                    type="text"
                    label={`Length (${metricUnit})`}
                    name={createPlotFormFields.rowLength}
                    rules={RulesManager.getRowLengthRules()}
                    onChange={(e) => handleInputChange(e.target.value)}
                  />

                  <InfoField
                    type="text"
                    label={`Width (${metricUnit})`}
                    name={createPlotFormFields.rowWidth}
                    rules={RulesManager.getRowWidthRules()}
                    onChange={(e) => handleInputChange(e.target.value)}
                  />
                  <InfoField
                    type="text"
                    label="Number of Rows"
                    name={createPlotFormFields.numberOfRows}
                    rules={RulesManager.getNumberOfRowsRules()}
                    onChange={(e) => handleInputChange(e.target.value)}
                  />
                  <InfoField
                    type="text"
                    label={`Spacing Between Rows (${metricUnit})`}
                    name={createPlotFormFields.rowSpacing}
                    rules={RulesManager.getRowSpacingRules()}
                    onChange={(e) => handleInputChange(e.target.value)}
                  />
                </Flex>
                <Flex className={style.row}>
                  <div className={style.inputGroup}>
                    <InfoField
                      type="text"
                      label="Rows per Line"
                      name={createPlotFormFields.rowsPerLine}
                      rules={RulesManager.getRowsPerLineRules()}
                      onChange={(e) => handleInputChange(e.target.value)}
                    />
                  </div>
                  <div className={style.inputGroup}>
                    <InfoField
                      type="text"
                      label={`Line Spacing (${metricUnit})`}
                      value={50}
                      name={createPlotFormFields.lineSpacing}
                      rules={RulesManager.getLineSpacingRules()}
                      onChange={(e) => handleInputChange(e.target.value)}
                    />
                  </div>
                  <div className={style.inputGroup}>
                    <InfoField
                      type="select"
                      label="Row Orientation"
                      name={createPlotFormFields.rowOrientation}
                      rules={RulesManager.getRowOrientationRules()}
                      onChange={(e) => {
                        if (e.target && e.target.value !== undefined) {
                          handleInputChange(e.target.value);
                        }
                      }}
                      options={[
                        { value: "Horizontal", label: "Horizontal" },
                        { value: "Vertical", label: "Vertical" },
                      ]}
                    />
                  </div>
                </Flex>
              </Flex>
            </Flex>

            {/* Tree Setup Section */}
            <Flex className={style.formSection}>
              <label className={style.sectionLabel}>Plant Information in Rows</label>
              {/* <div className={style.unitNote}>
              <i>Note: Distances are in pixels (px). In this setup, 1 meter ≈ 10 px.</i>
            </div> */}
              <Flex className={style.setupSection}>
                <Flex className={style.row}>
                  <InfoField
                    type="text"
                    label="Plants per Row"
                    name={createPlotFormFields.plantsPerRow}
                    rules={RulesManager.getPlantsPerRowRules()}
                    onChange={(e) => handleInputChange(e.target.value)}
                  />

                  <InfoField
                    type="text"
                    label={`Spacing Between Plants (${metricUnit})`}
                    name={createPlotFormFields.plantSpacing}
                    rules={RulesManager.getPlantSpacingRules()}
                    onChange={(e) => handleInputChange(e.target.value)}
                  />
                </Flex>
              </Flex>
            </Flex>
            {/* <Flex className={style.inputGroup}>
              <label>Alternate Planting:</label>
              <Switch defaultChecked />
            </Flex> */}
          </Form>
        </Flex>
      </Flex>
    );
  },
);

export default RowConfiguration;
