import { axiosAuth } from "@/api";
import { ApiResponse, GetNotification } from "@/payloads";

export const getNotificationByUser = async (
    userId: number,
    isRead?: boolean
  ): Promise<ApiResponse<GetNotification[]>> => {
    let url = `notification?userId=${userId}`;
    if (isRead !== undefined) {
      url += `&isRead=${isRead}`;
    }
  
    const res = await axiosAuth.axiosJsonRequest.get(url);
    const apiResponse = res.data as ApiResponse<GetNotification[]>;
    return apiResponse;
  };
  

export const markAsRead = async (notificationIds: number[]): Promise<ApiResponse<GetNotification[]>> => {
    const res = await axiosAuth.axiosJsonRequest.post(`mark-notification-is-read`, notificationIds);
    const apiResponse = res.data as ApiResponse<GetNotification[]>
    return apiResponse;
}