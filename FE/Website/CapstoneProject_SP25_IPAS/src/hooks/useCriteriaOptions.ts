import { useState, useEffect } from "react";
import { masterTypeService } from "@/services";
import { ApiResponse, GetMasterTypeSelected } from "@/payloads";
import { SelectOption } from "@/types";

const useCriteriaOptions = (target: string) => {
  const [options, setOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      const result: ApiResponse<GetMasterTypeSelected[]> =
        await masterTypeService.getCriteriaTypeSelect(target);

      if (result.statusCode === 200) {
        const mappedOptions = result.data.map((item) => ({
          value: String(item.id),
          label: item.name,
        }));
        setOptions(mappedOptions);
      }
    };

    fetchOptions();
  }, [target]);

  return { options };
};
export default useCriteriaOptions;
