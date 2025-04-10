import { useState, useEffect } from "react";
import { graftedPlantService } from "@/services";
import { ApiResponse, GetGraftedPlantSelected } from "@/payloads";

interface SelectOption {
  value: number | string;
  label: string;
}

const useGraftedPlantOptions = (farmId: number | null) => {
  const [options, setOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    if (farmId === null) {
      setOptions([]);
      return;
    }

    const fetchOptions = async () => {
      const result: ApiResponse<GetGraftedPlantSelected[]> =
        await graftedPlantService.getGraftedPlantSelect(farmId);

      if (result.statusCode === 200 && result.data) {
        const mappedOptions = result.data.map((item) => ({
          value: item.id,
          label: item.name,
        }));
        setOptions(mappedOptions);
      }
    };

    fetchOptions();
  }, [farmId]);

  return { options };
};

export default useGraftedPlantOptions;
