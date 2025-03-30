import { useState, useEffect } from "react";
import { plantLotService } from "@/services";
import { ApiResponse, GetPlantLot } from "@/payloads";

interface SelectOption {
  value: number | string;
  label: string;
}

const usePlantLotOptions = (isFromGrafted?: boolean) => {
  const [options, setOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const result = await plantLotService.getPlantLotSelected(isFromGrafted);

        if (result && Array.isArray(result)) {
          const mappedOptions = result.map((item) => ({
            value: item.value,
            label: item.label,
          }));
          setOptions(mappedOptions);
        }
      } catch (error) {
        console.error("Failed to fetch plant lot options:", error);
      }
    };

    fetchOptions();
  }, []);

  return { options };
};

export default usePlantLotOptions;
