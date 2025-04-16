import { ApiResponse } from "@/payloads";
import { masterTypeService } from "@/services";
import { GetMasterType } from "@/types";
import { useState, useEffect, ReactNode } from "react";

export interface SelectOption {
  value: string | number;
  label: string | ReactNode;
}

const useMasterTypeOptions = (type: string, isUseValueAsName: boolean = false) => {
  const [options, setOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
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
