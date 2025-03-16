import { useState, useEffect } from "react";
import { ApiResponse } from "@/payloads";
import { farmService } from "@/services";
import { getFarmId } from "@/utils";

interface User {
  userId: number;
  avatarURL: string;
  fullName: string;
}

interface SelectOption {
  value: number;
  label: string;
  avatarURL: string;
}

const useUserInFarmByRole = (listRole: number[]) => {
  const [options, setOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const farmId = getFarmId();
        const result: ApiResponse<any[]> = await farmService.getUserInFarmByRole(farmId, listRole);

        if (result.statusCode === 200) {
          const mappedOptions = result.data.map((user) => ({
            value: user.fullName,
            label: user.fullName,
            avatarURL: user.user.avatarURL,
          }));
          setOptions(mappedOptions);
        } else {
          console.error("Failed to fetch users:", result.message);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchOptions();
  }, [listRole]);
  return { options };
};

export default useUserInFarmByRole;