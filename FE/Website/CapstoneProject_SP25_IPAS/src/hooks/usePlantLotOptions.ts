import { useState, useEffect } from "react";
import { growthStageService, landRowService, plantLotService, plantService } from "@/services";
import { ApiResponse, GetGrowthStageSelected, GetLandRow, GetPlantLot, GetPlantOfRowSelect, GetPlantSelect } from "@/payloads";
import { getFarmId } from "@/utils";

interface SelectOption {
  value: number | string;
  label: string;
}

const usePlantLotOptions = () => {
  const [options, setOptions] = useState<SelectOption[]>([]);

  useEffect(() => {

    const fetchOptions = async () => {
      const result: ApiResponse<GetPlantLot[]> =
        await plantLotService.getPlantLotSelected();
      console.log("apiResponse plantlot", result);

      if (result.statusCode === 200) {
        const mappedOptions = result.data.map((item) => ({
          value: item.id,
          label: item.code,
        }));
        setOptions(mappedOptions);
      }
    };

    fetchOptions();
  }, []);

  return { options };
};

export default usePlantLotOptions;
