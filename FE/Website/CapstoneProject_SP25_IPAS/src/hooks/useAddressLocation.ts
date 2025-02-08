import { useState, useEffect } from "react";
import { FormInstance } from "antd";
import { Province, District, Ward } from "@/payloads";
import { thirdService } from "@/services";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";
import { CoordsState } from "@/types";
import { defaultCoordsFarm } from "@/utils";

const useAddressLocation = (form: FormInstance) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  //   const [markerPosition, setMarkerPosition] = useState<CoordsState>(defaultCoordsFarm);
  //   const [addressInput, setAddressInput] = useState(form.getFieldValue("address"));
  //   const [debouncedAddress] = useDebounce(addressInput, 500);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const data = await thirdService.fetchProvinces();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  const getIdByName = <T extends { id: string; name: string }>(data: T[], name: string) => {
    return data.find((item) => item.name === name)?.id;
  };

  const handleProvinceChange = async (provinceSelected: string) => {
    if (!provinceSelected) return;
    try {
      const [provinceId, provinceName] = provinceSelected.split(",").map((s) => s.trim());
      const districtData = await thirdService.fetchDistricts(provinceId);
      setDistricts(districtData);
      setWards([]);
      form.setFieldsValue({
        province: provinceName,
        provinceId,
        district: undefined,
        districtId: undefined,
        ward: undefined,
        wardId: undefined,
      });
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  };

  const handleDistrictChange = async (districtSelected: string) => {
    if (!districtSelected) return;
    try {
      const [districtId, districtName] = districtSelected.split(",").map((s) => s.trim());
      const wardData = await thirdService.fetchWards(districtId);
      setWards(wardData);
      form.setFieldsValue({
        district: districtName,
        districtId,
        ward: undefined,
        wardId: undefined,
      });
    } catch (error) {
      console.error("Error fetching wards:", error);
    }
  };

  //   const handleWardChange = (wardSelected: string) => {
  //     if (!wardSelected) return;
  //     const [wardId, wardName] = wardSelected.split(",").map((s) => s.trim());
  //     form.setFieldsValue({ ward: wardName, wardId });
  //   };

  return {
    provinces,
    setProvinces,
    districts,
    setDistricts,
    wards,
    setWards,
    handleProvinceChange,
    handleDistrictChange,
    getIdByName,
    // handleWardChange,
    // addressInput,
    // setAddressInput,
    // markerPosition,
    // setMarkerPosition,
  };
};
export default useAddressLocation;
