import { Flex, Form, FormInstance, InputNumber, Select, Switch } from "antd";
import style from "./RowConfiguration.module.scss";
import React, { useEffect } from "react";
import { Option } from "antd/es/mentions";
import { CustomButton, InfoField } from "@/components";
import { RulesManager } from "@/utils";
import { createPlotFormFields } from "@/constants";
import { useMapStore } from "@/stores";

interface RowConfigurationProps {
  form: FormInstance;
}

const RowConfiguration: React.FC<RowConfigurationProps> = React.memo(({ form }) => {
  const handleAutoFill = () => {
    form.setFieldsValue({
      [createPlotFormFields.rowLength]: 210,
      [createPlotFormFields.rowWidth]: 50,
      [createPlotFormFields.numberOfRows]: 20,
      [createPlotFormFields.rowSpacing]: 50,
      [createPlotFormFields.rowsPerLine]: 5,
      [createPlotFormFields.lineSpacing]: 50,
      [createPlotFormFields.rowOrientation]: "Horizontal",
      [createPlotFormFields.plantsPerRow]: 5,
      [createPlotFormFields.plantSpacing]: 10,
    });
  };

  return (
    <Flex className={style.rowConfigurationContainer}>
      <Flex className={style.plotInfoHeader}>
        <label className={style.plotLabel}>Plot Name: </label>
        <span className={style.plotName}>Land plot A</span>
        {/* <span className={style.separator}>-------</span>
        <span
          className={`${style.orientationTag} ${isHorizontal ? style.horizontal : style.vertical}`}
        >
          {isHorizontal ? "Horizontal" : "Vertical"}
        </span> */}
      </Flex>
      <Flex className={style.autoFillButtonContainer}>
        <CustomButton label="Generate Sample Data" handleOnClick={handleAutoFill} />
      </Flex>
      <Flex className={style.rowContentSection}>
        <Form form={form} className={style.formContainer}>
          <Flex className={style.formSection}>
            <label className={style.sectionLabel}>Set Up Row</label>
            <Flex className={style.setupSection}>
              <Flex className={style.row}>
                <InfoField
                  type="text"
                  label="Length (px)"
                  name={createPlotFormFields.rowLength}
                  rules={RulesManager.getRowLengthRules()}
                />

                <InfoField
                  type="text"
                  label="Width (px)"
                  name={createPlotFormFields.rowWidth}
                  rules={RulesManager.getRowWidthRules()}
                />
                <InfoField
                  type="text"
                  label="Number of Rows"
                  name={createPlotFormFields.numberOfRows}
                  rules={RulesManager.getNumberOfRowsRules()}
                />
                <InfoField
                  type="text"
                  label="Spacing Between Rows (px)"
                  name={createPlotFormFields.rowSpacing}
                  rules={RulesManager.getRowSpacingRules()}
                />
              </Flex>
              <Flex className={style.row}>
                <div className={style.inputGroup}>
                  <InfoField
                    type="text"
                    label="Rows per Line"
                    name={createPlotFormFields.rowsPerLine}
                    rules={RulesManager.getRowsPerLineRules()}
                  />
                </div>
                <div className={style.inputGroup}>
                  <InfoField
                    type="text"
                    label="Line Spacing (px)"
                    name={createPlotFormFields.lineSpacing}
                    rules={RulesManager.getLineSpacingRules()}
                  />
                </div>
                <div className={style.inputGroup}>
                  <InfoField
                    type="select"
                    label="Row Orientation"
                    name={createPlotFormFields.rowOrientation}
                    rules={RulesManager.getRowOrientationRules()}
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
            <label className={style.sectionLabel}>Set Up Plants in Rows</label>
            <Flex className={style.setupSection}>
              <Flex className={style.row}>
                <InfoField
                  type="text"
                  label="Plants per Row"
                  name={createPlotFormFields.plantsPerRow}
                  rules={RulesManager.getPlantsPerRowRules()}
                />

                <InfoField
                  type="text"
                  label="Spacing Between Plants (px)"
                  name={createPlotFormFields.plantSpacing}
                  rules={RulesManager.getPlantSpacingRules()}
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
});

export default RowConfiguration;
{
  /* <div>Step 2: Add Rows (Coming Soon)</div>; */
}
