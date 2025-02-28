import { useState, useEffect } from "react";
import { growthStageService } from "@/services";
import { ApiResponse, GetGrowthStageSelected } from "@/payloads";
import { getFarmId } from "@/utils";

interface SelectOption {
  value: number | string;
  label: string;
}

const useGrowthStageOptions = () => {
  const [options, setOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const result: ApiResponse<GetGrowthStageSelected[]> =
        await growthStageService.getGrowthStagesSelect(Number(getFarmId()));
        console.log(result);
        
      if (result.statusCode === 200) {
        const mappedOptions = result.data.map((item) => ({
          value: item.id,
          label: item.name,
        }));
        setOptions(mappedOptions);
      }
    };

    fetchOptions();
  }, []);

  return { options };
};
export default useGrowthStageOptions;
