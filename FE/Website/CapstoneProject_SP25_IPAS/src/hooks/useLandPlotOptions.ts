import { useState, useEffect } from "react";
import { landPlotService } from "@/services";
import { ApiResponse, GetLandPlotSelected } from "@/payloads";
import { SelectOption } from "@/types";

const useLandPlotOptions = () => {
  const [options, setOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const result: ApiResponse<GetLandPlotSelected[]> =
        await landPlotService.getLandPlotsSelected();
      if (result.statusCode === 200 && result.data) {
        const mappedOptions = result.data.map((plot) => ({
          value: plot.id,
          label: `${plot.name} - ${plot.code}`,
        }));
        setOptions(mappedOptions);
      }
    };

    fetchOptions();
  }, []);

  return { options };
};
export default useLandPlotOptions;
