import { axiosAuth } from "@/api";
import { ApiResponse } from "@/payloads";
import { useAuthStore } from "@/store";
import { MediaFile } from "@/types";
import { GetUser2, UserRequest } from "@/types/user";
import { getUserId } from "@/utils";

// const {userId} = useAuthStore();

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

  export const updateAvatarUser = async (mediaFile: MediaFile, userId: number): Promise<ApiResponse<GetUser2>> => {
    const formData = new FormData();
    formData.append('avatarOfUser', {
      uri: mediaFile.uri,
      name: mediaFile.name,
      type: mediaFile.type,
    } as any);
    const res = await axiosAuth.axiosMultipartForm.put(
      `users/update-user-avatar/${userId}`,
      formData
    );
    return res.data as ApiResponse<GetUser2>;
  };

  export const getUser = async ( userId: number): Promise<ApiResponse<GetUser2>> => {
    const res = await axiosAuth.axiosJsonRequest.get(`users/get-user-by-id/${userId}`);
  
    const apiResponse = res.data as ApiResponse<GetUser2>;
    return apiResponse;
  };