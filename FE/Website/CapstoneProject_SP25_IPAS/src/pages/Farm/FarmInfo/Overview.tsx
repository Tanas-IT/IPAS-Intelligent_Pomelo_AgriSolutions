import style from "./FarmInfo.module.scss";
import { Divider, Flex, Form, Image, Upload } from "antd";
import { Icons } from "@/assets";
import { useEffect, useState } from "react";
import { Province, District, GetFarm, Ward } from "@/payloads";
import { getDefaultFarm, RulesManager } from "@/utils";
import { toast } from "react-toastify";
import { thirdService } from "@/services";
import { EditActions, FormInput, Section, SectionHeader, SelectInput } from "@/components";

function Overview() {
  const [isEditing, setIsEditing] = useState(false);
  const [initialFarmDetails, setInitialFarmDetails] = useState<GetFarm>(getDefaultFarm);
  const [logo, setLogo] = useState<{ logo: File | null; logoUrl: string }>({
    logo: null,
    logoUrl: initialFarmDetails.logoUrl || "",
  });
  const [cities, setCities] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const formFieldNames = {
    farmName: "farmName",
    description: "description",
    province: "province",
    district: "district",
    ward: "ward",
    address: "address",
    area: "area",
    soilType: "soilType",
    climateZone: "climateZone",
    logo: "logo",
    logoUrl: "logoUrl",
  };

  const getIdByName = <T extends { id: string; name: string }>(
    data: T[],
    name: string,
  ): string | undefined => {
    return data.find((item) => item.name === name)?.id;
  };

  const handleProvinceChange = async (provinceSelected: string) => {
    try {
      if (provinceSelected) {
        const provinceId = provinceSelected.split(",")[0].trim();
        const provinceName = provinceSelected.split(",")[1].trim();
        const districtData = await thirdService.fetchDistricts(provinceId);
        setDistricts(districtData);
        setWards([]);
        form.setFieldsValue({
          province: provinceName,
          provinceId: provinceId,
          district: undefined,
          districtId: undefined,
          ward: undefined,
          wardId: undefined,
        });
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const handleDistrictChange = async (districtSelected: string) => {
    try {
      if (districtSelected) {
        const districtId = districtSelected.split(",")[0].trim();
        const districtName = districtSelected.split(",")[1].trim();
        const wardData = await thirdService.fetchWards(districtId);

        setWards(wardData);
        form.setFieldsValue({
          district: districtName,
          ward: undefined,
          districtId: districtId,
          wardId: "", // Reset ward
        });
      }
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
  };

  const handleWardChange = async (wardSelected: string) => {
    try {
      if (wardSelected != "") {
        form.setFieldsValue({
          ward: wardSelected.split(",")[1].trim(),
          wardId: wardSelected.split(",")[0].trim(),
        });
      }
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
  };

  const handleEdit = async () => {
    setIsEditing(true);
    try {
      setIsLoading(true);
      const provinceData = await thirdService.fetchCities();
      setCities(provinceData);

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
    form.setFieldsValue(initialFarmDetails); // Cập nhật lại form
  };

  const handleSave = async () => {
    await form.validateFields();
    setIsEditing(false);
    const formValues = form.getFieldsValue();
    console.log("Form values:", formValues);
    console.log(logo);

    toast.success("Changes saved successfully!");
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

  const handleRemove = () => {
    setLogo({
      logo: null,
      logoUrl: initialFarmDetails.logoUrl,
    });
  };

  useEffect(() => {
    form.setFieldsValue(initialFarmDetails);
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
              isEditing={isEditing}
            />
          </Form>
        </Section>

        <Divider className={style.divider} />
        <Section title="Farm Logo" subtitle="Update your farm logo.">
          <Flex className={style.formLogo}>
            <Image className={style.logo} src={logo.logoUrl} />
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
        <Section title="Address" subtitle="Update your address details.">
          <Form layout="vertical" className={style.form} form={form}>
            <Flex className={style.row}>
              <SelectInput
                label="Province"
                name={formFieldNames.province}
                rules={RulesManager.getProvinceRules()}
                options={cities.map((p) => ({ value: `${p.id}, ${p.name}`, label: p.name }))}
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
              />
            </Flex>
          </Form>
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
      </Flex>
      <Divider className={style.divider} />

      {isEditing && (
        <Flex className={style.contentSectionFooter}>
          <EditActions handleCancel={handleCancel} handleSave={handleSave} />
        </Flex>
      )}
    </Flex>
  );
}

export default Overview;
