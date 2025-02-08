import style from "./FarmInfo.module.scss";
import { Divider, Flex, Form, Image, Upload } from "antd";
import { Icons } from "@/assets";
import { useEffect, useState } from "react";
import { Province, District, GetFarmInfo, Ward, FarmRequest } from "@/payloads";
import { defaultCoordsFarm, RulesManager } from "@/utils";
import { toast } from "react-toastify";
import { farmService, thirdService } from "@/services";
import {
  EditActions,
  FormInput,
  MapAddress,
  Section,
  SectionHeader,
  SelectInput,
} from "@/components";
import { CoordsState, LogoState } from "@/types";
import { useFarmStore, useLoadingStore } from "@/stores";
import { useDebounce } from "use-debounce";
import { useAddressLocation } from "@/hooks";

interface OverviewProps {
  farm: GetFarmInfo;
  setFarm: React.Dispatch<React.SetStateAction<GetFarmInfo>>;
  logo: LogoState;
  setLogo: React.Dispatch<React.SetStateAction<LogoState>>;
}

const Overview: React.FC<OverviewProps> = ({ farm, setFarm, logo, setLogo }) => {
  const { isLoading, setIsLoading } = useLoadingStore();
  const [isEditing, setIsEditing] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<CoordsState>(defaultCoordsFarm);
  const [initialCoords, setInitialCoords] = useState({
    latitude: farm.latitude,
    longitude: farm.longitude,
  });
  const [form] = Form.useForm();
  const formFieldNames = {
    farmName: "farmName",
    description: "description",
    province: "province",
    district: "district",
    ward: "ward",
    address: "address",
    area: "area",
    length: "length",
    width: "width",
    soilType: "soilType",
    climateZone: "climateZone",
    logo: "logo",
    logoUrl: "logoUrl",
  };
  const [addressInput, setAddressInput] = useState(form.getFieldValue(formFieldNames.address));
  const [debouncedAddress] = useDebounce(addressInput, 500);
  const {
    provinces,
    setProvinces,
    districts,
    setDistricts,
    wards,
    setWards,
    handleProvinceChange,
    handleDistrictChange,
    getIdByName,
  } = useAddressLocation(form);

  const handleWardChange = async (wardSelected: string) => {
    try {
      if (wardSelected != "") {
        form.setFieldsValue({
          ward: wardSelected.split(",")[1].trim(),
          wardId: wardSelected.split(",")[0].trim(),
        });
        const fullAddress = `${form.getFieldValue(
          formFieldNames.address,
        )}, ${wardSelected}, ${form.getFieldValue(formFieldNames.district)}, ${form.getFieldValue(
          formFieldNames.province,
        )}, Vietnam`;
        const newCoords = await thirdService.getCoordinatesFromAddress(fullAddress);
        if (newCoords) {
          setMarkerPosition(newCoords); // Dùng để gửi API
          setFarm((prev) => ({
            ...prev,
            latitude: newCoords.latitude,
            longitude: newCoords.longitude,
          })); // Dùng để hiển thị
        } else {
          toast.error("Failed to get coordinates for the new address.");
        }
      }
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newAddress = e.target.value;
    setAddressInput(newAddress);

    form.setFieldValue(formFieldNames.address, newAddress);
  };

  useEffect(() => {
    const fetchCoords = async () => {
      if (!debouncedAddress) return;

      const fullAddress = `${debouncedAddress}, ${form.getFieldValue(
        formFieldNames.ward,
      )}, ${form.getFieldValue(formFieldNames.district)}, ${form.getFieldValue(
        formFieldNames.province,
      )}, Vietnam`;

      const newCoords = await thirdService.getCoordinatesFromAddress(fullAddress);

      if (newCoords) {
        setMarkerPosition(newCoords);
        setFarm((prev) => ({
          ...prev,
          latitude: newCoords.latitude,
          longitude: newCoords.longitude,
        }));
      } else {
        toast.error("Failed to get coordinates for the new address.");
      }
    };

    fetchCoords();
  }, [debouncedAddress]);

  const handleEdit = async () => {
    try {
      setIsEditing(true);
      setIsLoading(true);
      const provinceData = await thirdService.fetchProvinces();
      setProvinces(provinceData);

      const provinceId = getIdByName(provinceData, form.getFieldValue(formFieldNames.province));

      let districtData: District[] = [];
      if (provinceId) {
        districtData = await thirdService.fetchDistricts(provinceId);
        setDistricts(districtData);
      }
      const districtId = getIdByName(districtData, form.getFieldValue(formFieldNames.district));

      let wardData: Ward[] = [];
      if (districtId) {
        wardData = await thirdService.fetchWards(districtId);
        setWards(wardData);
      }
      const wardId = getIdByName(wardData, form.getFieldValue(formFieldNames.ward));

      form.setFieldsValue({
        provinceId: provinceId ?? form.getFieldValue(formFieldNames.province),
        districtId: districtId ?? form.getFieldValue(formFieldNames.district),
        wardId: wardId ?? form.getFieldValue(formFieldNames.ward),
      });
    } catch (error) {
      console.error("Error fetching location data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.setFieldsValue(farm);
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
    let infoUpdated = (Object.keys(formValues) as (keyof FarmRequest)[]).some(
      (key) => formValues[key] != null && farm[key] != null && formValues[key] !== farm[key],
    );
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
          setFarm((prev) => ({
            ...prev,
            farmName: formValues.farmName,
            longitude: isCoordsUpdated ? markerPosition.longitude : prev.longitude,
            latitude: isCoordsUpdated ? markerPosition.latitude : prev.latitude,
          }));
          useFarmStore.getState().setFarmInfo(formValues.farmName, "");
        } else {
          toast.error(result.message);
        }
      }

      if (logoUpdated || infoUpdated) {
        toast.success("Changes saved successfully!");
      }
    } catch (e) {
      form.setFieldsValue(farm);
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      toast.error("Only image files (JPG, PNG, GIF, WEBP) are allowed!");
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
    form.setFieldsValue(farm);
  }, []);

  return (
    <Flex className={style.contentWrapper}>
      <SectionHeader
        title="Farm Information"
        subtitle="Update your farm logo and details here"
        isEditing={isEditing}
        handleEdit={handleEdit}
        handleCancel={handleCancel}
        handleSave={handleSave}
      />

      <Divider className={style.divider} />
      <Flex className={style.contentSectionBody}>
        <Section title="Public Profile" subtitle="This will be displayed on your profile.">
          <Form layout="vertical" className={style.form} form={form}>
            <FormInput
              label="Farm Name"
              name={formFieldNames.farmName}
              rules={RulesManager.getFarmNameRules()}
              isEditing={isEditing}
              placeholder="Enter the farm name"
            />
            <FormInput
              label="Description"
              name={formFieldNames.description}
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
                className={style.uploadWrapper}
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
              <FormInput
                label="Area (m²)"
                name={formFieldNames.area}
                rules={RulesManager.getAreaRules()}
                isEditing={isEditing}
                placeholder="Enter the farm area"
              />
              <FormInput
                label="Soil Type"
                name={formFieldNames.soilType}
                rules={RulesManager.getSoilTypeRules()}
                isEditing={isEditing}
                placeholder="Enter soil type"
              />
              <FormInput
                label="Climate Zone"
                name={formFieldNames.climateZone}
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
              <SelectInput
                label="Province"
                name={formFieldNames.province}
                rules={RulesManager.getProvinceRules()}
                options={provinces.map((p) => ({ value: `${p.id}, ${p.name}`, label: p.name }))}
                onChange={handleProvinceChange}
                isEditing={isEditing}
                isLoading={isLoading}
              />
              <SelectInput
                label="District"
                name={formFieldNames.district}
                rules={RulesManager.getDistrictRules()}
                options={districts.map((d) => ({ value: `${d.id}, ${d.name}`, label: d.name }))}
                onChange={handleDistrictChange}
                isEditing={isEditing}
                isLoading={isLoading}
              />
              <SelectInput
                label="Ward"
                name={formFieldNames.ward}
                rules={RulesManager.getWardRules()}
                options={wards.map((w) => ({ value: `${w.id}, ${w.name}`, label: w.name }))}
                onChange={handleWardChange}
                isEditing={isEditing}
                isLoading={isLoading}
              />
            </Flex>
            <Flex className={style.row}>
              <FormInput
                label="Address"
                name={formFieldNames.address}
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
          <EditActions handleCancel={handleCancel} handleSave={handleSave} />
        </Flex>
      )}
    </Flex>
  );
};

export default Overview;
