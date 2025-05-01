import style from "./FarmInfo.module.scss";
import { Divider, Flex, Form, Image, Upload } from "antd";
import { Icons } from "@/assets";
import { useEffect, useState } from "react";
import { Province, District, GetFarmInfo, Ward, FarmRequest } from "@/payloads";
import { formatDateAndTime, isOwner, RulesManager } from "@/utils";
import { toast } from "react-toastify";
import { farmService, thirdService } from "@/services";
import { EditActions, InfoField, MapAddress, Section, SectionHeader } from "@/components";
import { LogoState } from "@/types";
import { useFarmStore, useLoadingStore } from "@/stores";
import { useAddressLocation, useStyle } from "@/hooks";
import { farmFormFields } from "@/constants";

interface OverviewProps {
  farm: GetFarmInfo;
  setFarm: React.Dispatch<React.SetStateAction<GetFarmInfo>>;
  logo: LogoState;
  setLogo: React.Dispatch<React.SetStateAction<LogoState>>;
}

const Overview: React.FC<OverviewProps> = ({ farm, setFarm, logo, setLogo }) => {
  const { styles } = useStyle();
  const { isLoading, setIsLoading } = useLoadingStore();
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm();
  const updateFormValues = () => {
    form.setFieldsValue({
      ...farm,
      createDate: formatDateAndTime(farm.createDate),
    });
  };
  const [initialCoords, setInitialCoords] = useState({
    latitude: farm.latitude,
    longitude: farm.longitude,
  });
  const {
    provinces,
    setProvinces,
    districts,
    setDistricts,
    wards,
    setWards,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
    handleAddressChange,
    getIdByName,
    markerPosition,
    setMarkerPosition,
  } = useAddressLocation(form, setFarm, farm.latitude, farm.longitude);
  const isLoginOwner = isOwner();

  const handleEdit = async () => {
    try {
      setIsEditing(true);
      setIsLoading(true);
      const provinceData = await thirdService.fetchProvinces();
      setProvinces(provinceData);

      const provinceId = getIdByName(provinceData, form.getFieldValue(farmFormFields.province));

      let districtData: District[] = [];
      if (provinceId) {
        districtData = await thirdService.fetchDistricts(provinceId);
        setDistricts(districtData);
      }
      const districtId = getIdByName(districtData, form.getFieldValue(farmFormFields.district));

      let wardData: Ward[] = [];
      if (districtId) {
        wardData = await thirdService.fetchWards(districtId);
        setWards(wardData);
      }
      const wardId = getIdByName(wardData, form.getFieldValue(farmFormFields.ward));

      form.setFieldsValue({
        provinceId: provinceId ?? form.getFieldValue(farmFormFields.province),
        districtId: districtId ?? form.getFieldValue(farmFormFields.district),
        wardId: wardId ?? form.getFieldValue(farmFormFields.ward),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    updateFormValues();
    setLogo({ logoUrl: farm.logoUrl, logo: null });
    setMarkerPosition({
      latitude: initialCoords.latitude,
      longitude: initialCoords.longitude,
    });
    setFarm((prev) => ({
      ...prev,
      latitude: initialCoords.latitude,
      longitude: initialCoords.longitude,
    }));
  };

  const handleSave = async () => {
    await form.validateFields();
    const formValues: FarmRequest = form.getFieldsValue();
    let logoUpdated = !!logo.logo;
    let infoUpdated = (Object.keys(formValues) as (keyof FarmRequest)[])
      .filter((key) => key !== (farmFormFields.createDate as keyof FarmRequest))
      .some((key) => formValues[key] != null && farm[key] != null && formValues[key] !== farm[key]);

    const isCoordsValid = markerPosition.latitude !== 0 && markerPosition.longitude !== 0;
    const isCoordsUpdated =
      isCoordsValid &&
      (markerPosition.latitude !== initialCoords.latitude ||
        markerPosition.longitude !== initialCoords.longitude);
    try {
      setIsLoading(true);
      if (logoUpdated && logo.logo) {
        var logoResult = await farmService.updateFarmLogo(logo.logo);
        if (logoResult.statusCode === 200) {
          const logoUrl = logoResult.data.logoUrl;
          setLogo({ logo: null, logoUrl: logoUrl });
          useFarmStore.getState().setFarmInfo("", logoUrl);
        }
      }
      if (infoUpdated || isCoordsUpdated) {
        const updatedFormValues = { ...formValues };
        if (isCoordsUpdated && markerPosition) {
          updatedFormValues.longitude = markerPosition.longitude;
          updatedFormValues.latitude = markerPosition.latitude;
        }
        var result = await farmService.updateFarmInfo(updatedFormValues);
        if (result.statusCode === 200) {
          const data = result.data;
          setFarm((prev) => ({
            ...prev,
            ...Object.fromEntries(
              Object.entries(data).filter(([key, value]) => value !== undefined),
            ),
          }));
          setInitialCoords({
            latitude: data.latitude,
            longitude: data.longitude,
          });
          useFarmStore.getState().setFarmInfo(formValues.farmName, "");
        } else {
          toast.warning(result.message);
        }
      }

      if (logoUpdated || infoUpdated) {
        toast.success("Changes saved successfully!");
      }
    } catch (e) {
      updateFormValues();
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      toast.warning("Only image files (JPG, PNG, GIF, WEBP) are allowed!");
      return Upload.LIST_IGNORE;
    }

    // Đọc file và cập nhật logo tạm thời
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const newLogoUrl = e.target.result as string;
        setLogo({
          logo: file, // Cập nhật logo (file)
          logoUrl: newLogoUrl, // Cập nhật URL của logo (dạng base64)
        });
      }
    };
    reader.readAsDataURL(file);

    return false; // Ngăn Upload tự động gửi file
  };

  const handleRemove = () => setLogo({ logo: null, logoUrl: farm.logoUrl });

  useEffect(() => {
    updateFormValues();
  }, []);

  return (
    <Flex className={style.contentWrapper}>
      <SectionHeader
        isLoginOwner={isLoginOwner}
        title="Farm Information"
        subtitle={
          isLoginOwner
            ? "Update your farm logo and details here"
            : "You can view farm information here"
        }
        isEditing={isEditing}
        handleEdit={handleEdit}
        handleCancel={handleCancel}
        handleSave={handleSave}
      />

      <Divider className={style.divider} />
      <Flex className={style.contentSectionBody}>
        <Section title="Public Profile" subtitle="This will be displayed on your profile.">
          <Form layout="vertical" className={style.form} form={form}>
            <Flex className={style.row}>
              <InfoField
                label="Farm Name"
                name={farmFormFields.farmName}
                rules={RulesManager.getFarmNameRules()}
                isEditing={isEditing}
                placeholder="Enter the farm name"
              />
              <InfoField label="Create Date" name={farmFormFields.createDate} isEditing={false} />
            </Flex>

            <InfoField
              label="Description"
              name={farmFormFields.description}
              rules={RulesManager.getFarmDescriptionRules()}
              type="textarea"
              isEditing={isEditing}
            />
          </Form>
        </Section>

        <Divider className={style.divider} />
        <Section title="Farm Logo" subtitle="Update your farm logo.">
          <Flex className={style.formLogo}>
            <Image crossOrigin="anonymous" className={style.logo} src={logo.logoUrl} />
            {isEditing && (
              <Upload.Dragger
                beforeUpload={beforeUpload}
                accept="image/png, image/jpeg, image/jpg, image/gif, image/webp"
                onRemove={handleRemove}
                maxCount={1}
                className={`${style.uploadWrapper} ${styles.customUpload}`}
              >
                <p className={style.uploadIcon}>
                  <Icons.upload />
                </p>
                <p className="ant-upload-text">Click or drag an image file here to upload</p>
                <p className="ant-upload-hint">
                  Only image formats: JPG, PNG, GIF, WEBP are allowed.
                </p>
              </Upload.Dragger>
            )}
          </Flex>
        </Section>

        <Divider className={style.divider} />
        <Section title="Farm Characteristics" subtitle="Update your farm's environmental details.">
          <Form layout="vertical" className={style.form} form={form}>
            <Flex className={style.row}>
              <InfoField
                label="Area (m²)"
                name={farmFormFields.area}
                rules={RulesManager.getAreaRules()}
                isEditing={isEditing}
                placeholder="Enter the farm area"
              />

              <InfoField
                label="Soil Type"
                name={farmFormFields.soilType}
                rules={RulesManager.getSoilTypeRules()}
                isEditing={isEditing}
                placeholder="Enter soil type"
              />
              <InfoField
                label="Climate Zone"
                name={farmFormFields.climateZone}
                rules={RulesManager.getClimateZoneRules()}
                isEditing={isEditing}
                placeholder="Enter climate zone"
              />
            </Flex>
          </Form>
        </Section>

        <Divider className={style.divider} />
        <Section title="Address" subtitle="Update your address details.">
          <Form layout="vertical" className={style.form} form={form}>
            <Flex className={style.row}>
              <InfoField
                type="select"
                label="Province"
                name={farmFormFields.province}
                rules={RulesManager.getProvinceRules()}
                options={provinces.map((p) => ({ value: `${p.id}, ${p.name}`, label: p.name }))}
                onChange={handleProvinceChange}
                isEditing={isEditing}
                isLoading={isLoading}
              />
              <InfoField
                type="select"
                label="District"
                name={farmFormFields.district}
                rules={RulesManager.getDistrictRules()}
                options={districts.map((d) => ({ value: `${d.id}, ${d.name}`, label: d.name }))}
                onChange={handleDistrictChange}
                isEditing={isEditing}
                isLoading={isLoading}
              />
              <InfoField
                type="select"
                label="Ward"
                name={farmFormFields.ward}
                rules={RulesManager.getWardRules()}
                options={wards.map((w) => ({ value: `${w.id}, ${w.name}`, label: w.name }))}
                onChange={handleWardChange}
                isEditing={isEditing}
                isLoading={isLoading}
              />
            </Flex>
            <Flex className={style.row}>
              <InfoField
                label="Address"
                name={farmFormFields.address}
                rules={RulesManager.getAddressRules()}
                isEditing={isEditing}
                placeholder="Enter your detailed address (House number, street...)"
                onChange={handleAddressChange}
              />
            </Flex>
            <Flex className={style.row}>
              <Flex className={style.mapContainer}>
                {isEditing && (
                  <div className={style.mapNotice}>
                    <span className={style.icon}>*</span> Click on the map to select your location.
                  </div>
                )}
                <MapAddress
                  longitude={farm.longitude}
                  latitude={farm.latitude}
                  isEditing={isEditing}
                  setMarkerPosition={setMarkerPosition}
                />
              </Flex>
            </Flex>
          </Form>
        </Section>
      </Flex>
      <Divider className={style.divider} />

      {isEditing && (
        <Flex className={style.contentSectionFooter}>
          <EditActions handleBtn1={handleCancel} handleBtn2={handleSave} />
        </Flex>
      )}
    </Flex>
  );
};

export default Overview;
