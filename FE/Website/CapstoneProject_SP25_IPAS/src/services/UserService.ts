import { axiosAuth } from "@/api";
import { ApiResponse, GetData, GetPlant, GetUser, GetUser2, UserRequest } from "@/payloads";
import { buildParams, getUserId } from "@/utils";

export const getUsers = async (
  currentPage?: number,
  rowsPerPage?: number,
  sortField?: string,
  sortDirection?: string,
  searchValue?: string,
  additionalParams?: Record<string, any>,
): Promise<GetData<GetUser2>> => {
  const params = buildParams(
    currentPage,
    rowsPerPage,
    sortField,
    sortDirection,
    searchValue,
    additionalParams,
  );
  const res = await axiosAuth.axiosJsonRequest.get("users", { params });
  const apiResponse = res.data as ApiResponse<GetData<GetUser2>>;
  return apiResponse.data as GetData<GetUser2>;
};

export const getUser = async (userId: number): Promise<ApiResponse<GetUser2>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`users/get-user-by-id/${userId}`);

  const apiResponse = res.data as ApiResponse<GetUser2>;
  return apiResponse;
};

export const deleteUsers = async (ids: number[] | string[]): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.patch(`users/softed-delete-user`, ids);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const updateUser = async (user: UserRequest): Promise<ApiResponse<GetUser2>> => {
  const payload = {
    userId: user.userId,
    fullName: user.fullName,
    gender: user.gender,
    phoneNumber: user.phoneNumber,
    dob: user.dob,
    role: user.roleName,
  };
  const res = await axiosAuth.axiosJsonRequest.put("users/update-user-info", payload);
  const apiResponse = res.data as ApiResponse<GetUser2>;
  return apiResponse;
};

export const updateAvatarUser = async (avatarFile: File): Promise<ApiResponse<GetUser2>> => {
  const formData = new FormData();
  formData.append("avatarOfUser", avatarFile);

  const res = await axiosAuth.axiosMultipartForm.put(
    `users/update-user-avatar/${getUserId()}`,
    formData,
  );
  const apiResponse = res.data as ApiResponse<GetUser2>;
  return apiResponse;
};

export const createUser = async (user: UserRequest): Promise<ApiResponse<GetUser2>> => {
  const payload = {
    email: user.email,
    password: user.password,
    fullName: user.fullName,
    gender: user.gender,
    phoneNumber: user.phoneNumber,
    dob: user.dob,
    role: user.roleName,
  };
  const res = await axiosAuth.axiosJsonRequest.post(`users`, payload);
  const apiResponse = res.data as ApiResponse<GetUser2>;
  return apiResponse;
};

export const banUsers = async (ids: number[] | string[]): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.put(`users/banned-user`, ids);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const unBanUsers = async (ids: number[] | string[]): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.put(`users/un-banned-user`, ids);
  const apiResponse = res.data as ApiResponse<Object>;
  return apiResponse;
};

export const getUsersByRole = async (role: string): Promise<GetUser[]> => {
  const res = await axiosAuth.axiosJsonRequest.get(`users/get-all-user-by-role/${role}`);

  const apiResponse = res.data as ApiResponse<GetUser[]>;
  return apiResponse.data.map(({ userId, fullName, avatarURL }) => ({
    userId,
    fullName,
    avatarURL,
  }));
};

export const getUserById = async (userId: number): Promise<GetUser> => {
  const res = await axiosAuth.axiosJsonRequest.get(`users/get-user-by-id/${userId}`);

  const apiResponse = res.data as ApiResponse<GetUser>;
  return apiResponse.data;
};
