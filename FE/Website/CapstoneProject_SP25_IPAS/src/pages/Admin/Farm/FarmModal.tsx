import { Flex, Form } from "antd";
import { useState, useEffect } from "react";
import style from "./Farm.module.scss";
import { FormFieldModal, ModalForm } from "@/components";
import { defaultCoordsFarm, RulesManager } from "@/utils";
import { farmFormFields, SYSTEM_CONFIG_GROUP } from "@/constants";
import { GetFarmInfo, AdminFarmRequest } from "@/payloads";
import { useAddressLocation, useSystemConfigOptions } from "@/hooks";
import { CoordsState } from "@/types";

type FarmModalProps = {
  isOpen: boolean;
  onClose: (values: AdminFarmRequest, isUpdate: boolean) => void;
  onSave: (values: AdminFarmRequest) => void;
  isLoadingAction?: boolean;
  farmData?: GetFarmInfo;
};

const FarmModal = ({ isOpen, onClose, onSave, farmData, isLoadingAction }: FarmModalProps) => {
  const [form] = Form.useForm();
  const isUpdate = farmData !== undefined && Object.keys(farmData).length > 0;
  const [farmLocation, setFarmLocation] = useState<CoordsState>(defaultCoordsFarm);
  const {
    provinces,
    districts,
    wards,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
    handleAddressChange,
    markerPosition,
    setMarkerPosition,
  } = useAddressLocation(form, setFarmLocation);
  const { options: soilOptions, loading: soilLoading } = useSystemConfigOptions(
    SYSTEM_CONFIG_GROUP.SOIL_TYPE,
  );
  const { options: climateOptions, loading: climateLoading } = useSystemConfigOptions(
    SYSTEM_CONFIG_GROUP.CLIMATE_ZONE,
  );

  const resetForm = () => {
    form.resetFields();
  };

  useEffect(() => {
    resetForm();
    if (isOpen && farmData) {
      form.setFieldsValue({ ...farmData });
    }
  }, [isOpen, farmData]);

  const getFormData = (): AdminFarmRequest => {
    const rawData = Object.fromEntries(
      Object.values(farmFormFields).map((field) => [field, form.getFieldValue(field)]),
    );

    return {
      ...rawData,
      farmId: farmData?.farmId,
      latitude: markerPosition.latitude,
      longitude: markerPosition.longitude,
    } as AdminFarmRequest;
  };

  const handleOk = async () => {
    await form.validateFields();
    onSave(getFormData());
  };

  const handleCancel = () => onClose(getFormData(), isUpdate);

  return (
    <ModalForm
      isOpen={isOpen}
      onClose={handleCancel}
      onSave={handleOk}
      isUpdate={isUpdate}
      isLoading={isLoadingAction}
      title={isUpdate && "Update Farm"}
      size="large"
    >
      <Form form={form} layout="vertical">
        <FormFieldModal
          label="Farm Name"
          name={farmFormFields.farmName}
          rules={RulesManager.getRequiredRules("FarmName")}
        />
        <Flex gap={20}>
          <FormFieldModal
            label="Area (m²)"
            name={farmFormFields.area}
            rules={RulesManager.getAreaRules()}
          />
          <FormFieldModal
            type="select"
            label="Soil Type"
            name={farmFormFields.soilType}
            isLoading={soilLoading}
            options={soilOptions}
            rules={RulesManager.getSoilTypeRules()}
          />
          <FormFieldModal
            type="select"
            label="Climate Zone"
            name={farmFormFields.climateZone}
            rules={RulesManager.getClimateZoneRules()}
            isLoading={climateLoading}
            options={climateOptions}
          />
        </Flex>

        <fieldset className={style.plantLocationContainer}>
          <legend>Farm Location</legend>
          <Flex justify="space-between" vertical>
            <Flex gap={20}>
              <FormFieldModal
                type="select"
                label="Province"
                name={farmFormFields.province}
                options={provinces.map((p) => ({ value: `${p.id}, ${p.name}`, label: p.name }))}
                onChange={handleProvinceChange}
                rules={RulesManager.getRequiredRules("Province")}
              />
              <FormFieldModal
                type="select"
                label="District"
                name={farmFormFields.district}
                options={districts.map((d) => ({ value: `${d.id}, ${d.name}`, label: d.name }))}
                onChange={handleDistrictChange}
                rules={RulesManager.getRequiredRules("District")}
              />
              <FormFieldModal
                type="select"
                label="Ward"
                name={farmFormFields.ward}
                options={wards.map((w) => ({ value: `${w.id}, ${w.name}`, label: w.name }))}
                onChange={handleWardChange}
                rules={RulesManager.getRequiredRules("Ward")}
              />
            </Flex>
            <FormFieldModal
              label="Address"
              name={farmFormFields.address}
              placeholder="Enter your detailed address (House number, street...)"
              onChange={handleAddressChange}
              rules={RulesManager.getRequiredRules("Address")}
            />
          </Flex>
        </fieldset>
        <FormFieldModal
          type="textarea"
          label="Description"
          name={farmFormFields.description}
          rules={RulesManager.getFarmDescriptionRules()}
        />
      </Form>
    </ModalForm>
  );
};

export default FarmModal;
