import { useState, useEffect } from "react";
import { growthStageService, landPlotService, landRowService } from "@/services";
import { ApiResponse, GetGrowthStageSelected, GetLandPlot, GetLandRow } from "@/payloads";
import { getFarmId } from "@/utils";

interface SelectOption {
  value: number | string;
  label: string;
}

const useLandPlotOptions = () => {
  const [options, setOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const result: ApiResponse<GetLandPlot[]> =
        await landPlotService.getLandPlots();
        console.log('ggggggg',result);
        
      if (result.statusCode === 200) {
        const mappedOptions = result.data.map((item) => ({
          value: item.landPlotId,
          label: item.landPlotName,
        }));
        setOptions(mappedOptions);
      }
    };

    fetchOptions();
  }, []);

  return { options };
};
export default useLandPlotOptions;
