export interface GetRooms {
  roomId: number;
  roomCode: string;
  roomName: string;
  createDate: string;
}

export interface chatMessage {
  messageId: number;
  question: string;
  answer: string;
  createDate: string;
  senderId: string;
  isUser: boolean;
}

export interface GetMessageOfRoom {
  roomId: number;
  roomName: string;
  chatMessages: chatMessage[];
}
