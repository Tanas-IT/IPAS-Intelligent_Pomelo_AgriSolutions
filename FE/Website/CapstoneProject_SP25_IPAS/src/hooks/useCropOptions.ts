import { useState, useEffect } from "react";
import { cropService } from "@/services";
import { ApiResponse, GetCropSelect } from "@/payloads";
import { SelectOption } from "@/types";

const useCropOptions = () => {
  const [options, setOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const result: ApiResponse<GetCropSelect[]> = await cropService.getCropsOfFarmSelect();

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
export default useCropOptions;
