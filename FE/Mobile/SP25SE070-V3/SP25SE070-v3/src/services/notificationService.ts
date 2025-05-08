import { ApiResponse } from "@/payloads/ApiBase/ApiResponse";
import { GetNotification } from "@/types/notification";
import axiosAuth from "@/api/axiosAuth";

export const getNotificationByUser = async (
  userId: number,
  isRead?: boolean
): Promise<ApiResponse<GetNotification[]>> => {
  let url = `notification?userId=${userId}`;
  if (isRead !== undefined) {
    url += `&isRead=${isRead}`;
  }
  const res = await axiosAuth.axiosJsonRequest.get(url);
  return res.data as ApiResponse<GetNotification[]>;
};

export const markAsRead = async (
  userId: number,
  status?: string,
  notificationId?: number
): Promise<ApiResponse<Object>> => {

  const res = await axiosAuth.axiosJsonRequest.post(
    `mark-notification-is-read?userId=${userId}`,
    {
      notificationId,
      status,
    }
  );
  return res.data as ApiResponse<Object>;

};
