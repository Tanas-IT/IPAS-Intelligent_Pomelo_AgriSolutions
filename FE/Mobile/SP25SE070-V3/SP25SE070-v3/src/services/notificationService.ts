import { ApiResponse } from "@/payloads/ApiBase/ApiResponse";
import { GetNotification } from "@/types/notification";
import axiosAuth from '@/api/axiosAuth';

export const getNotificationByUser = async (
  userId: number,
  isRead?: boolean
): Promise<ApiResponse<GetNotification[]>> => {
  let url = `notification?userId=${userId}`;
  if (isRead !== undefined) {
    url += `&isRead=${isRead}`;
  }
  console.log("000000000");
  try {
    console.log("111111");
    
    const res = await axiosAuth.axiosJsonNoErrorHandler.get(url);
    console.log("notii", res);
    
    return res.data as ApiResponse<GetNotification[]>;
  } catch (error) {
    throw error;
  }
};

export const markAsRead = async (
  userId: number,
  status?: string,
  notificationId?: number
): Promise<ApiResponse<Object>> => {
  try {
    console.log("payload=================================================================", {userId, status, notificationId});
    
    const res = await axiosAuth.axiosJsonRequest.post(`mark-notification-is-read?userId=${userId}`, {
      notificationId,
      status,
    });
    return res.data as ApiResponse<Object>;
  } catch (error) {
    throw error;
  }
};

