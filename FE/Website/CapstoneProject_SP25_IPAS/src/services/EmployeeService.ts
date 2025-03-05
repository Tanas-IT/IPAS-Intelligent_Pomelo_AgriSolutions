import { axiosAuth } from "@/api";
import { ApiResponse, GetData, GetEmployee, GetUserRoleEmployee } from "@/payloads";
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

export const updateRole = async (
  userId: number,
  roleName: string,
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.put("farms/user-farm", {
    userId,
    roleName,
  });
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const getUserByEmail = async (email: string): Promise<ApiResponse<GetUserRoleEmployee>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`users/get-user-by-email/${email}`);
  const apiResponse = res.data as ApiResponse<GetUserRoleEmployee>;
  return apiResponse;
};
