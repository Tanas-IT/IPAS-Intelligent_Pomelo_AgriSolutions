import { Flex, Form, Typography, Upload } from "antd";
import style from "./CreateFarm.module.scss";
import { useEffect, useState } from "react";
import { farmFormFields } from "@/constants";
import { defaultCoordsFarm, RulesManager } from "@/utils";
import { EditActions, InfoField, MapAddress } from "@/components";
import { toast } from "react-toastify";
import { CoordsState } from "@/types";
import { useAddressLocation } from "@/hooks";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import { farmService } from "@/services";
import { FarmRequest } from "@/payloads";
import { useLoadingStore } from "@/stores";

const Text = Typography;

function CreateFarm() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { setIsLoading } = useLoadingStore();
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

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      toast.error("Only image files (JPG, PNG, GIF, WEBP) are allowed!");
      return Upload.LIST_IGNORE;
    }

    return false; // Ngăn Upload tự động gửi file
  };

  const handleCancel = () => navigate(PATHS.FARM_PICKER);

  const handleSave = async () => {
    var values: FarmRequest = await form.validateFields();

    const logoValue = form.getFieldValue(farmFormFields.logo);
    values = {
      ...values,
      farmLogo: logoValue ? logoValue.file ?? null : null,
      latitude: markerPosition.latitude,
      longitude: markerPosition.longitude,
    };

    try {
      setIsLoading(true);
      var result = await farmService.createFarm(values);
      const toastMessage = result.message;
      if (result.statusCode === 201) {
        navigate(PATHS.FARM_PICKER, { state: { toastMessage } });
      } else {
        toast.error(toastMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex className={style.container}>
      <Flex className={style.sectionHeader}>
        <Text>Create a new farm</Text>
        <EditActions handleBtn1={handleCancel} handleBtn2={handleSave} labelBtn2="Create Farm" />
      </Flex>
      <Flex className={style.contentWrapper}>
        <Flex className={style.row}>
          <Flex className={style.sectionLeft}>
            <Form layout="vertical" className={style.form} form={form}>
              <Text className={style.farmTitle}>Farm Information</Text>
              <InfoField
                label="Farm Name"
                name={farmFormFields.farmName}
                rules={RulesManager.getFarmNameRules()}
                placeholder="Enter the farm name"
              />
              <InfoField
                label="Description"
                name={farmFormFields.description}
                rules={RulesManager.getFarmDescriptionRules()}
                type="textarea"
              />
              <InfoField
                label="Farm Logo"
                name={farmFormFields.logo}
                type="uploadDragger"
                beforeUpload={beforeUpload}
              />
            </Form>
          </Flex>
          <Flex className={style.sectionRight}>
            <Form layout="vertical" className={style.form} form={form}>
              <Text className={style.farmTitle}>Farm Environmental</Text>
              <InfoField
                label="Area (m²)"
                name={farmFormFields.area}
                rules={RulesManager.getAreaRules()}
                placeholder="Enter the farm area"
              />

              <InfoField
                label="Soil Type"
                name={farmFormFields.soilType}
                rules={RulesManager.getSoilTypeRules()}
                placeholder="Enter soil type"
              />
              <InfoField
                label="Climate Zone"
                name={farmFormFields.climateZone}
                rules={RulesManager.getClimateZoneRules()}
                placeholder="Enter climate zone"
              />
            </Form>
          </Flex>
        </Flex>
        <Flex className={style.row}>
          <Flex className={style.sectionLeft}>
            <Form layout="vertical" className={style.form} form={form}>
              <Text className={style.farmTitle}>Farm Address</Text>
              <Flex className={style.row}>
                <InfoField
                  type="select"
                  label="Province"
                  name={farmFormFields.province}
                  rules={RulesManager.getProvinceRules()}
                  options={provinces.map((p) => ({ value: `${p.id}, ${p.name}`, label: p.name }))}
                  onChange={handleProvinceChange}
                />
                <InfoField
                  type="select"
                  label="District"
                  name={farmFormFields.district}
                  rules={RulesManager.getDistrictRules()}
                  options={districts.map((d) => ({ value: `${d.id}, ${d.name}`, label: d.name }))}
                  onChange={handleDistrictChange}
                />
                <InfoField
                  type="select"
                  label="Ward"
                  name={farmFormFields.ward}
                  rules={RulesManager.getWardRules()}
                  options={wards.map((w) => ({ value: `${w.id}, ${w.name}`, label: w.name }))}
                  onChange={handleWardChange}
                />
              </Flex>
              <Flex className={style.row}>
                <InfoField
                  label="Address"
                  name={farmFormFields.address}
                  rules={RulesManager.getAddressRules()}
                  placeholder="Enter your detailed address (House number, street...)"
                  onChange={handleAddressChange}
                />
              </Flex>
              <Text className={style.mapNotice}>
                <span className={style.icon}>*</span>Select an address to get the location, and
                click on the map to choose your location.
              </Text>
              <MapAddress
                longitude={farmLocation.longitude}
                latitude={farmLocation.latitude}
                isEditing={true}
                setMarkerPosition={setMarkerPosition}
              />
            </Form>
          </Flex>
        </Flex>
        <Flex className={style.contentSectionFooter}>
        <EditActions handleBtn1={handleCancel} handleBtn2={handleSave} labelBtn2="Create Farm" />
        </Flex>
      </Flex>
    </Flex>
  );
}

export default CreateFarm;
