import { useState, useEffect } from "react";
import { cropService, landPlotService } from "@/services";
import { ApiResponse, CropResponse, GetLandPlotSelected } from "@/payloads";
import { SelectOption } from "@/types";

const useCropCurrentOption = () => {
  const [options, setOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const result: ApiResponse<CropResponse[]> =
        await cropService.getCropsInCurrentTime();
      if (result.statusCode === 200 && result.data) {
        const mappedOptions = result.data.map((plot) => ({
          value: plot.cropId,
          label: `${plot.cropCode} - ${plot.cropName}`,
        }));
        setOptions(mappedOptions);
      }
    };

    fetchOptions();
  }, []);

  return { options };
};
export default useCropCurrentOption;
