import { useState, useEffect } from "react";
import { cropService, landPlotService } from "@/services";
import { ApiResponse, CropResponse, GetLandPlotOfCrop, GetLandPlotSelected } from "@/payloads";
import { SelectOption } from "@/types";

const useLandPlotOfCropOption = (cropId: number) => {
  const [options, setOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    if (!cropId) return;
    const fetchOptions = async () => {
      const result: ApiResponse<GetLandPlotOfCrop[]> = await cropService.getLandPlotOfCrop(cropId);
      if (result.statusCode === 200 && result.data) {
        const mappedOptions = result.data.map((plot) => ({
          value: plot.landPlotId,
          label: plot.landPlotName,
        }));
        setOptions(mappedOptions);
      }
    };

    fetchOptions();
  }, []);

  return { options };
};
export default useLandPlotOfCropOption;
