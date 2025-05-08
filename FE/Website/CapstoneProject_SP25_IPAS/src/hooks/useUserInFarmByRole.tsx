import { useState, useEffect } from "react";
import { ApiResponse, GetUserInFarm } from "@/payloads";
import { farmService } from "@/services";
import { getFarmId } from "@/utils";
import { SelectOption } from "@/types";

const useUserInFarmByRole = (listRole: number[], isDetail: boolean = false) => {
  const [options, setOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      if (listRole.length === 0) return;

      try {
        const farmId = getFarmId();
        const result: ApiResponse<GetUserInFarm[]> = await farmService.getUserInFarmByRole(
          farmId,
          listRole,
        );

        if (result.statusCode === 200) {
          const mappedOptions: SelectOption[] = result.data.map((user) => ({
            value: isDetail ? user.userId : user.fullName,
            label: user.fullName,
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
  }, []);
  return { options };
};

export default useUserInFarmByRole;
