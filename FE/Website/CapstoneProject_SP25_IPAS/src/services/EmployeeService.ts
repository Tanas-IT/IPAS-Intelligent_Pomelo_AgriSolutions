import { axiosAuth } from "@/api";
import { AddUserFarmRequest, ApiResponse, GetData, GetEmployee, GetUserRoleEmployee } from "@/payloads";
import { buildParams } from "@/utils";

export const getEmployeeList = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetEmployee>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get("farms/user-farm", { params });
  const apiResponse = res.data as ApiResponse<GetData<GetEmployee>>;
  return apiResponse.data as GetData<GetEmployee>;
};

// export const updateEmployee = async (
//   userId: number,
//   roleName?: string,
//   isActive?: boolean,
// ): Promise<ApiResponse<Object>> => {
//   const payload: Record<string, any> = { userId };

//   if (roleName !== undefined) payload.roleName = roleName;
//   if (isActive !== undefined) payload.isActive = isActive;

//   const res = await axiosAuth.axiosJsonRequest.put("farms/user-farm", payload);
//   return res.data as ApiResponse<Object>;
// };

export const updateEmployee = async (data: AddUserFarmRequest): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.put("farms/user-farm", data);
  return res.data as ApiResponse<Object>;
};

export const getUserByEmail = async (
  email: string,
): Promise<ApiResponse<GetUserRoleEmployee[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`users/search-by-email?emailSearch=${email}`);
  const apiResponse = res.data as ApiResponse<GetUserRoleEmployee[]>;
  return apiResponse;
};

export const addNewUserInFarm = async (data: AddUserFarmRequest): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.post(`farms/user-farm`, data);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const deleteUserInFarm = async (
  userId: number[] | string[],
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.delete(`farms/user-farm?userId=${userId}`);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};
