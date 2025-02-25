import { axiosAuth } from "@/api";
import { ApiResponse, GetData, GetPlant, GetUser } from "@/payloads";
import { buildParams } from "@/utils";

export const getUsers = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  brandId?: string | null,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetPlant>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    // brandId,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get("app-users", { params });
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse.data as GetData<GetPlant>;
};

export const getUsersOfFarmByRole = async ( roleId: number, farmId: number ): Promise<GetUser[]> => {
  const res = await axiosAuth.axiosJsonRequest.get(`farms/get-users-farm-by-role?farmId=1&listRole=5`);

  const apiResponse = res.data as ApiResponse<GetUser[]>;

  return apiResponse.data.map(({ userId, fullName, avatarURL }) => ({
    userId,
    fullName,
    avatarURL,
  }));
};