import { systemConfigService } from "@/services";
import { SelectOption } from "@/types";
import { useState, useEffect } from "react";

const useSystemConfigOptions = (
  group: string,
  key?: string,
  useCodeAsValue: boolean = false
) => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const result = await systemConfigService.getSystemConfigSelect(
          group,
          key
        );
        if (result.statusCode === 200 && result.data) {
          const mappedOptions = result.data.map((item) => ({
            value: useCodeAsValue ? item.code : item.name,
            label: item.name,
          }));
          setOptions(mappedOptions);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  return { options, loading };
};
export default useSystemConfigOptions;
