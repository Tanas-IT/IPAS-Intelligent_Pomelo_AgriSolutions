import { Input, Avatar, Button, Flex, Empty } from "antd";
import { SendOutlined, PlusOutlined, SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import style from "./ChatBox.module.scss";
import { Images } from "@/assets";
import { ActionMenuChat, ConfirmModal, UserAvatar } from "@/components";
import { useEffect, useRef, useState } from "react";
import { ChatMessage, GetMessageOfRoom, GetRooms, MessageRequest } from "@/payloads";
import { ChatBoxService } from "@/services";
import dayjs from "dayjs";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import { LOCAL_STORAGE_KEYS, ROOM_GROUPS } from "@/constants";
import { useModal } from "@/hooks";
import ChangeNameModal from "./ChangeNameModal";
import { toast } from "react-toastify";
import { formatDateTimeChat, getAnswerParts, getUserId } from "@/utils";
import AnimatedAnswer from "./AnimatedAnswer";

dayjs.extend(isToday);
dayjs.extend(isYesterday);

const ChatBox = () => {
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [rooms, setRooms] = useState<GetRooms[]>([]);
  const [activeChat, setActiveChat] = useState<GetRooms>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [lastSentMessageId, setLastSentMessageId] = useState<number | null>(null);
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
    setIsLoadingMessages(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    try {
      const res = await ChatBoxService.getHistoryChat(roomId);
      if (res.statusCode === 200) setMessages(res.data[0].chatMessages || []);
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

  const handleSendMessage = async () => {
    if (isWaitingForResponse || !messageInput.trim() || lastSentMessageId) return;
    const newQuestion = messageInput.trim();
    const messageId = Date.now();
    const userMessage: ChatMessage = {
      messageId: messageId,
      question: newQuestion,
      answer: "",
      createDate: new Date().toISOString(),
      senderId: "",
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessageInput("");
    setIsWaitingForResponse(true);
    try {
      const messReq: MessageRequest = {
        question: newQuestion,
        roomId: activeChat ? activeChat.roomId : undefined,
      };
      const res = await ChatBoxService.newMessage(messReq);

      if (res.statusCode === 200) {
        const updatedMessages = res.data;

        if (updatedMessages) {
          setLastSentMessageId(updatedMessages.messageId);
          setMessages((prev) =>
            prev.map((msg) => (msg.messageId === messageId ? { ...msg, ...updatedMessages } : msg)),
          );
        }
      }
    } finally {
      setIsWaitingForResponse(false);
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

  const renderAnswerMessage = (answer: string, isTyping: boolean) => {
    try {
      const jsonStr = answer
        .trim()
        .replace(/^```json\n/, "")
        .replace(/\n```$/, "");
      const parsed = JSON.parse(jsonStr);
      if (isTyping) {
        return (
          <AnimatedAnswer
            data={parsed}
            onDone={() => {
              setLastSentMessageId(null);
            }}
          />
        );
      } else {
        const parts = getAnswerParts(parsed);

        return (
          <div>
            <h4 style={{ marginBottom: "12px", color: "#333" }}>{parsed.title}</h4>
            {parts.map((p) => (
              <p key={p.key} style={{ margin: "4px 0", lineHeight: 1.6 }}>
                {p.label && <strong style={{ color: "#222" }}>{p.label}: </strong>}
                {p.value}
              </p>
            ))}
          </div>
        );
      }
    } catch (err) {
      return <pre>{answer}</pre>;
    }
  };

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
                      activeChat?.roomId === room.roomId ? style.active : ""
                    }`}
                    onClick={async () => {
                      if (activeChat?.roomId === room.roomId) return;
                      setActiveChat(room);
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

      <Flex className={style.chatBoxContentWrapper}>
        <Flex className={style.chatBoxContentHeader}>
          <h3> {activeChat?.roomName}</h3>
        </Flex>
        <Flex className={style.chatBoxContent} ref={chatBoxRef}>
          <Flex className={style.chatBoxContentMessages}>
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
              messages.map((mess, index) => {
                const isTyping = mess.messageId === lastSentMessageId;
                return (
                  <div key={mess.messageId}>
                    {/* User message (sent) */}
                    <Flex className={`${style.message} ${style.messageSent}`}>
                      <Flex className={style.messageWrapper}>
                        <span className={`${style.messageTimestamp} ${style.right}`}>
                          {formatDateTimeChat(mess.createDate)}
                        </span>
                        <div className={style.messageBubble}>{mess.question}</div>
                      </Flex>
                      <UserAvatar
                        avatarURL={localStorage.getItem(LOCAL_STORAGE_KEYS.AVATAR) || ""}
                      />
                    </Flex>

                    {/* AI message (received) */}
                    {mess.answer && (
                      <Flex className={`${style.message} ${style.messageReceived}`}>
                        <Avatar src={Images.logo} />
                        <Flex className={style.messageWrapper}>
                          <span className={style.messageTimestamp}>
                            {formatDateTimeChat(mess.createDate)}
                          </span>
                          <div className={style.messageBubble}>
                            {renderAnswerMessage(mess.answer, isTyping)}
                          </div>
                        </Flex>
                      </Flex>
                    )}
                  </div>
                );
              })
            )}

            {/* Hiển thị "Bot is typing..." nếu đang chờ phản hồi */}
            {isWaitingForResponse && (
              <Flex className={`${style.message} ${style.messageReceived}`}>
                <Avatar src={Images.logo} />
                <Flex className={style.messageWrapper}>
                  <span className={style.messageTimestamp}>
                    {formatDateTimeChat(new Date().toISOString())}
                  </span>
                  <div className={style.messageBubble}>
                    <LoadingOutlined /> Bot is typing...
                  </div>
                </Flex>
              </Flex>
            )}
          </Flex>
        </Flex>
        <Flex className={style.chatBoxContentFooter}>
          <Input.TextArea
            placeholder="Send a message"
            className={style.messageInput}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onPressEnter={(e) => {
              e.preventDefault(); // Tránh xuống dòng
              handleSendMessage();
            }}
            readOnly={!!lastSentMessageId}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            className={style.sendBtn}
            onClick={handleSendMessage}
            disabled={isWaitingForResponse || !!lastSentMessageId}
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
