import { axiosAuth } from "@/api";
import { ApiResponse, GetMessageOfRoom, GetRooms } from "@/payloads";

export const getRooms = async (search?: string): Promise<ApiResponse<GetRooms[]>> => {
  const res = await axiosAuth.axiosJsonRequest.get("ai/get-all-room", {
    params: { search },
  });
  return res.data as ApiResponse<GetRooms[]>;
};

export const updateRoomName = async (
  roomId: number,
  newRoomName: string,
): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.patch("ai/change-name-of-room", {
    roomID: roomId,
    newRoomName,
  });
  return res.data as ApiResponse<Object>;
};

export const deleteRoom = async (roomId: number): Promise<ApiResponse<Object>> => {
  const res = await axiosAuth.axiosJsonRequest.delete(`ai/delete-room?roomid=${roomId}`);
  return res.data as ApiResponse<Object>;
};

export const newMessage = async (
  question: string,
  roomId?: number,
): Promise<ApiResponse<GetRooms>> => {
  const res = await axiosAuth.axiosJsonRequest.post("ai/chat", {
    question,
    roomId,
  });
  return res.data as ApiResponse<GetRooms>;
};

export const getHistoryChat = async (roomId: number): Promise<ApiResponse<GetMessageOfRoom>> => {
  const res = await axiosAuth.axiosJsonRequest.get(`ai/history-of-chat?roomId=${roomId}`);
  return res.data as ApiResponse<GetMessageOfRoom>;
};
