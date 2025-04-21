import { axiosAuth } from "@/api";
import { ApiResponse } from "@/payloads";
import { GetMasterType } from "@/types";

export const getSelectMasterTypes = async (
  typeName: string
): Promise<ApiResponse<GetMasterType[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(
    `masterTypes/get-masterType-by-name`,
    {
      params: {
        typeName,
      },
    }
  );
  const apiResponse = res.data as ApiResponse<GetMasterType[]>;
  return apiResponse;
};
