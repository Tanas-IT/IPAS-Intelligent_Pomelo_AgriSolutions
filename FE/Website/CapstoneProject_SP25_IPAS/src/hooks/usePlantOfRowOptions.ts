import { useState, useEffect } from "react";
import { growthStageService, landRowService, plantService } from "@/services";
import { ApiResponse, GetGrowthStageSelected, GetLandRow, GetPlantOfRowSelect, GetPlantSelect } from "@/payloads";
import { getFarmId } from "@/utils";

interface SelectOption {
  value: number | string;
  label: string;
}

const usePlantOfRowOptions = (landRowId: number | null) => {
  const [options, setOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    if (landRowId === null) {
      setOptions([]);
      return;
    }

    const fetchOptions = async () => {
      console.log("lại ảo", landRowId);
      
      const result: ApiResponse<GetPlantOfRowSelect[]> =
        await plantService.getPlantOfRow(landRowId);
      console.log("apiResponse plant", result);

      if (result.statusCode === 200) {
        const mappedOptions = result.data.map((item) => ({
          value: item.id,
          label: item.code,
        }));
        setOptions(mappedOptions);
      }
    };

    fetchOptions();
  }, [landRowId]);

  return { options };
};

export default usePlantOfRowOptions;
