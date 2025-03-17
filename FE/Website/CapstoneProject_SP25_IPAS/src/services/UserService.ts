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

export const getUsersByRole = async (role: string): Promise<GetUser[]> => {
  console.log("ảo nữa");
  
  const res = await axiosAuth.axiosJsonRequest.get(`users/get-all-user-by-role/${role}`);

  const apiResponse = res.data as ApiResponse<GetUser[]>;
  console.log("apiResponseuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuuu", apiResponse);

  return apiResponse.data.map(({ userId, fullName, avatarURL }) => ({
    userId,
    fullName,
    avatarURL,
  }));
};

export const getUserById = async (userId: number): Promise<GetUser> => {
  const res = await axiosAuth.axiosJsonRequest.get(`users/get-user-by-id/${userId}`);

  const apiResponse = res.data as ApiResponse<GetUser>;
  console.log("apiResponse", apiResponse);

  return apiResponse.data;
};
