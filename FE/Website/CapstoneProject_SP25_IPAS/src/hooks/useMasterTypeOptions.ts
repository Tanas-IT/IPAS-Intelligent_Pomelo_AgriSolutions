import { useState, useEffect } from "react";
import { masterTypeService } from "@/services";
import { ApiResponse, GetMasterType } from "@/payloads";
import { SelectOption } from "@/types";

const useMasterTypeOptions = (type?: string, isUseValueAsName: boolean = false) => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  useEffect(() => {
    if (!type) return;
    const fetchOptions = async () => {
      const result: ApiResponse<GetMasterType[]> = await masterTypeService.getSelectMasterTypes(
        type,
      );
      if (result.statusCode === 200 && result.data) {
        const mappedOptions = result.data.map((item) => ({
          value: isUseValueAsName ? item.masterTypeName : item.masterTypeId,
          label: item.masterTypeName,
        }));
        setOptions(mappedOptions);
      }
    };

    fetchOptions();
  }, [type]);

  return { options };
};
export default useMasterTypeOptions;
