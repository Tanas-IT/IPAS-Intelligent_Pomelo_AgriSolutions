import { Input, Avatar, Button, Flex, Empty } from "antd";
import { SendOutlined, PlusOutlined, SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import style from "./ChatBox.module.scss";
import { Images } from "@/assets";
import { ActionMenuChat, ConfirmModal, UserAvatar } from "@/components";
import { useEffect, useRef, useState } from "react";
import { chatMessage, GetMessageOfRoom, GetRooms } from "@/payloads";
import { ChatBoxService } from "@/services";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import { LOCAL_STORAGE_KEYS, ROOM_GROUPS } from "@/constants";
import { useModal } from "@/hooks";
import ChangeNameModal from "./ChangeNameModal";
import { toast } from "react-toastify";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

const ChatBox = () => {
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [rooms, setRooms] = useState<GetRooms[]>([]);
  const [activeChatId, setActiveChatId] = useState(0);
  const [messages, setMessages] = useState<chatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const changeNameModal = useModal<{ roomId: number }>();
  const deleteConfirmModal = useModal<{ id: number }>();

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const res = await ChatBoxService.getRooms();
      if (res.statusCode === 200) {
        setRooms(res.data ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleGetHistoryMessage = async (roomId: number) => {
    try {
      setIsLoadingMessages(true);
      const res = await ChatBoxService.getHistoryChat(roomId);
      console.log(res);
      
      if (res.statusCode === 200) setMessages(res.data.chatMessages || []);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleChangeName = async (roomName: string, roomId?: number) => {
    if (!roomId) return;
    try {
      setIsLoading(true);
      const res = await ChatBoxService.updateRoomName(roomId, roomName);
      if (res.statusCode === 200) {
        toast.success(res.message);
        changeNameModal.hideModal();
        await fetchRooms();
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId?: number) => {
    if (!roomId) return;
    try {
      setIsLoading(true);
      const res = await ChatBoxService.deleteRoom(roomId);
      if (res.statusCode === 200) {
        toast.success(res.message);
        deleteConfirmModal.hideModal();
        await fetchRooms();
      } else {
        toast.error(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const groupRoomsByDate = (rooms: GetRooms[]) => {
    const grouped: Record<(typeof ROOM_GROUPS)[number], GetRooms[]> = {
      Today: [],
      Yesterday: [],
      "Previous 7 Days": [],
      "Previous 30 Days": [],
      Earlier: [],
    };
    const now = dayjs();
    rooms.forEach((room) => {
      const date = dayjs(room.createDate);
      if (date.isToday()) {
        grouped.Today.push(room);
      } else if (date.isYesterday()) {
        grouped.Yesterday.push(room);
      } else if (date.isAfter(now.subtract(7, "day"))) {
        grouped["Previous 7 Days"].push(room);
      } else if (date.isAfter(now.subtract(30, "day"))) {
        grouped["Previous 30 Days"].push(room);
      } else {
        grouped.Earlier.push(room);
      }
    });

    return grouped;
  };

  const groupedRooms = groupRoomsByDate(rooms);

  return (
    <Flex className={style.chatBoxContainer}>
      <Flex className={style.chatBoxSidebar}>
        <Flex className={style.chatBoxSidebarHeader}>
          <Flex align="center" gap={10}>
            <Avatar src={Images.logo} size={40} />
            <h2>ChatBox Ai</h2>
          </Flex>
          <Button icon={<PlusOutlined />} className={style.newChatBtn}>
            New Chat
          </Button>
          <Input prefix={<SearchOutlined />} placeholder="Search.." className={style.searchInput} />
        </Flex>
        <Flex className={style.chatBoxSidebarList}>
          {ROOM_GROUPS.map((label) => {
            const group = groupedRooms[label];
            if (!group.length) return null;

            return (
              <div key={label}>
                <h4 className={style.groupLabel}>{label}</h4>
                {group.map((room) => (
                  <Flex
                    key={room.roomId}
                    className={`${style.chatBoxSidebarListItem} ${
                      activeChatId === room.roomId ? style.active : ""
                    }`}
                    onClick={async () => {
                      setActiveChatId(room.roomId);
                      await handleGetHistoryMessage(room.roomId);
                    }}
                    justify="space-between"
                  >
                    <span>{room.roomName}</span>
                    <ActionMenuChat
                      onEdit={() => changeNameModal.showModal({ roomId: room.roomId })}
                      onDelete={() => deleteConfirmModal.showModal({ id: room.roomId })}
                    />
                  </Flex>
                ))}
              </div>
            );
          })}
        </Flex>
      </Flex>

      <Flex className={style.chatBoxContent}>
        <Flex className={style.chatBoxContentHeader}>
          <h3>New Chat</h3>
        </Flex>
        <Flex className={style.chatBoxContentMessages} ref={chatBoxRef}>
          {isLoadingMessages ? (
            <Flex justify="center" align="center" className={style.welcomeMessage}>
              <LoadingOutlined spin />
              <span style={{ marginLeft: 8 }}>Loading messages...</span>
            </Flex>
          ) : messages.length === 0 ? (
            <Flex justify="center" align="center" className={style.welcomeMessage}>
              <span>
                👋 Hi there! How can I assist you today? Just type your question below to get
                started.
              </span>
            </Flex>
          ) : (
            messages.map((mess) => {
              const lastMessage = messages[messages.length - 1];
              return (
                <Flex key={mess.messageId} className={`${style.message} ${style.messageSent}`}>
                  <UserAvatar avatarURL={localStorage.getItem(LOCAL_STORAGE_KEYS.AVATAR) || ""} />
                  <Flex className={style.messageWrapper}>
                    <span className={`${style.messageTimestamp} ${style.right}`}>
                      {mess.createDate}
                    </span>
                    {/* <div className={style.messageBubble}>
                      {text === "Bot is typing..." && lastMessage.messageId === id ? (
                        <>
                          <LoadingOutlined /> Bot is typing...
                        </>
                      ) : (
                        text
                      )}
                    </div> */}
                  </Flex>
                  {/* {type === "sent" && <Avatar src={avatar} />} */}
                </Flex>
              );
            })
          )}

          {isLoading && (
            <Flex className={style.loadingWrapper}>
              <LoadingOutlined spin />
              <span>Đang tải thêm tin nhắn...</span>
            </Flex>
          )}
        </Flex>

        <Flex className={style.chatBoxContentFooter}>
          <Input.TextArea
            placeholder="Send a message"
            className={style.messageInput}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onPressEnter={(e) => {
              e.preventDefault(); // Tránh xuống dòng
              // handleSendMessage();
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            className={style.sendBtn}
            // onClick={handleSendMessage}
            disabled={isWaitingForResponse}
          />
        </Flex>
      </Flex>
      <ChangeNameModal
        isOpen={changeNameModal.modalState.visible}
        onClose={changeNameModal.hideModal}
        onSave={(value) => handleChangeName(value, changeNameModal.modalState.data?.roomId)}
        isLoadingAction={isLoading}
      />
      {/* Confirm Delete Modal */}
      <ConfirmModal
        visible={deleteConfirmModal.modalState.visible}
        onConfirm={() => handleDeleteRoom(deleteConfirmModal.modalState.data?.id)}
        onCancel={deleteConfirmModal.hideModal}
        itemName="Chat"
        actionType="delete"
      />
    </Flex>
  );
};

export default ChatBox;
