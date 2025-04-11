import { useState, useEffect } from "react";
import { systemConfigService } from "@/services";
import { SelectOption } from "@/types";

const useSystemConfigOptions = (key: string) => {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      try {
        const result = await systemConfigService.getSystemConfigSelect(key);
        if (result.statusCode === 200 && result.data) {
          const mappedOptions = result.data.map((item) => ({
            value: item.name,
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
