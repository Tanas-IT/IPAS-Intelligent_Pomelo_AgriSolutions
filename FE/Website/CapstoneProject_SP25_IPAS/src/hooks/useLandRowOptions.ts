import { useState, useEffect } from "react";
import { growthStageService, landRowService } from "@/services";
import { ApiResponse, GetGrowthStageSelected, GetLandRow } from "@/payloads";
import { getFarmId } from "@/utils";

interface SelectOption {
  value: number | string;
  label: string;
}

const useLandRowOptions = (landPlotId: number | null) => {
  const [options, setOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    if (landPlotId === null) {
      setOptions([]);
      return;
    }

    const fetchOptions = async () => {
      const result: ApiResponse<GetLandRow[]> =
        await landRowService.getLandRows(landPlotId);
      console.log("apiResponse landRowOptions", result);

      if (result.statusCode === 200) {
        const mappedOptions = result.data.map((item) => ({
          value: item.id,
          label: item.code,
        }));
        setOptions(mappedOptions);
      }
    };

    fetchOptions();
  }, [landPlotId]); // 👈 Lắng nghe thay đổi của `landPlotId`

  return { options };
};

export default useLandRowOptions;
