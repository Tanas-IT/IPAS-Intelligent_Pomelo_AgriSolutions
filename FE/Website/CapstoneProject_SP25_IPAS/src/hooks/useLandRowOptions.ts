import { useState, useEffect } from "react";
import { growthStageService, landRowService } from "@/services";
import { ApiResponse, GetGrowthStageSelected, GetLandRowSelected } from "@/payloads";
import { getFarmId } from "@/utils";
import { SelectOption } from "@/types";

const useLandRowOptions = (landPlotId: number | null) => {
  const [options, setOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    if (landPlotId === null) {
      setOptions([]);
      return;
    }

    const fetchOptions = async () => {
      const result: ApiResponse<GetLandRowSelected[]> = await landRowService.getLandRowsSelected(
        landPlotId,
      );
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
