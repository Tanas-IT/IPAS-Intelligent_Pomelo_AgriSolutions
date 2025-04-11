import { FileResource } from "@/types";

export interface GetRooms {
  roomId: number;
  roomCode: string;
  roomName: string;
  createDate: string;
}

export interface ChatMessage {
  messageId: number;
  question: string;
  answer: string;
  createDate: string;
  senderId: string;
  resources: FileResource[];
}

export interface GetMessageOfRoom {
  roomId: number;
  roomName: string;
  chatMessages: ChatMessage[];
}
