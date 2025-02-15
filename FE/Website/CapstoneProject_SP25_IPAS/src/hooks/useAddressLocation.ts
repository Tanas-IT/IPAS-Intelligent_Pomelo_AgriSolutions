import { useState, useEffect } from "react";
import { FormInstance } from "antd";
import { Province, District, Ward, GetFarmInfo } from "@/payloads";
import { thirdService } from "@/services";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce";
import { CoordsState } from "@/types";
import { defaultCoordsFarm } from "@/utils";
import { farmFormFields } from "@/constants";

const useAddressLocation = <T extends { latitude: number; longitude: number }>(
  form: FormInstance,
  setLocation: React.Dispatch<React.SetStateAction<T>>,
  latitude?: number,
  longitude?: number,
) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [markerPosition, setMarkerPosition] = useState<CoordsState>({
    latitude: latitude ?? defaultCoordsFarm.latitude,
    longitude: longitude ?? defaultCoordsFarm.longitude,
  });
  const [addressInput, setAddressInput] = useState(form.getFieldValue("address"));
  const [debouncedAddress] = useDebounce(addressInput, 500);

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

  const handleWardChange = async (wardSelected: string) => {
    try {
      if (wardSelected != "") {
        form.setFieldsValue({
          ward: wardSelected.split(",")[1].trim(),
          wardId: wardSelected.split(",")[0].trim(),
        });
        const fullAddress = `${form.getFieldValue(
          farmFormFields.address,
        )}, ${wardSelected}, ${form.getFieldValue(farmFormFields.district)}, ${form.getFieldValue(
          farmFormFields.province,
        )}, Vietnam`;
        const newCoords = await thirdService.getCoordinatesFromAddress(fullAddress);

        if (newCoords) {
          setMarkerPosition(newCoords); // Dùng để gửi API
          setLocation((prev) => ({
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
    form.setFieldValue(farmFormFields.address, newAddress);
  };

  useEffect(() => {
    const fetchCoords = async () => {
      if (!debouncedAddress) return;

      const fullAddress = `${debouncedAddress}, ${form.getFieldValue(
        farmFormFields.ward,
      )}, ${form.getFieldValue(farmFormFields.district)}, ${form.getFieldValue(
        farmFormFields.province,
      )}, Vietnam`;

      const newCoords = await thirdService.getCoordinatesFromAddress(fullAddress);

      if (newCoords) {
        setMarkerPosition(newCoords);
        setLocation((prev) => ({
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

  return {
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
    debouncedAddress,
    setAddressInput,
    markerPosition,
    setMarkerPosition,
  };
};
export default useAddressLocation;
