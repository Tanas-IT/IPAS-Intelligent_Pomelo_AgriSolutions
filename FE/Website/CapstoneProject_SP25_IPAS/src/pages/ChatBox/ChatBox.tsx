import { Input, Avatar, Button, Flex, Empty } from "antd";
import { SendOutlined, PlusOutlined, SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import style from "./ChatBox.module.scss";
import { Images } from "@/assets";
import { ActionMenuChat } from "@/components";
import { useEffect, useRef, useState } from "react";

const initialMessages = Array.from({ length: 60 }, (_, i) => ({
  id: i + 1,
  type: (i + 1) % 2 === 0 ? "received" : "sent",
  text: (i + 1) % 2 === 0 ? "Tin nhắn giả lập từ bot..." : "Tin nhắn giả lập từ người dùng...",
  time: `Fri, May 08, 2020 5:${13 + i} PM`,
  avatar: (i + 1) % 2 === 0 ? Images.logo : Images.avatar,
}));

const initialChatLists = [
  {
    title: "Today",
    chats: [
      { id: 1, text: "Lorem ipsum dolor sit amet...", active: true },
      { id: 2, text: "Lorem, ipsum dolor sit amet consectetur...", active: false },
    ],
  },
  {
    title: "Yesterday",
    chats: [
      { id: 3, text: "Earum amet sint deleniti...", active: false },
      { id: 4, text: "Earum amet sint deleniti...", active: false },
    ],
  },
];

const ChatBox = () => {
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const [chatLists, setChatLists] = useState(initialChatLists);
  const [activeChatId, setActiveChatId] = useState(1);
  const [messages, setMessages] = useState(initialMessages.slice(0, 6)); // Hiển thị 6 tin nhắn đầu tiên
  const [messageInput, setMessageInput] = useState("");
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = () => {
    if (isWaitingForResponse || !messageInput.trim()) return;
    scrollToBottom();
    const newMessage = {
      id: messages.length + 1,
      type: "sent",
      text: messageInput,
      time: new Date().toLocaleTimeString(),
      avatar: Images.avatar,
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessageInput("");
    setIsWaitingForResponse(true);

    // Giả lập phản hồi sau 1s
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          type: "received",
          text: "Bot is typing...",
          time: new Date().toLocaleTimeString(),
          avatar: Images.logo,
        },
      ]);
    }, 1000);

    // Sau 3s nhận phản hồi thực tế
    setTimeout(() => {
      setMessages((prev) => [
        ...prev.slice(0, -1), // Xóa "Bot is typing..."
        {
          id: prev.length + 1,
          type: "received",
          text: "This is a response!",
          time: new Date().toLocaleTimeString(),
          avatar: Images.logo,
        },
      ]);
      setIsWaitingForResponse(false);
    }, 7000);
  };

  const handleScroll = () => {
    if (
      chatBoxRef.current &&
      !isLoading &&
      chatBoxRef.current.scrollTop === 0 &&
      messages.length > 0
    ) {
      setIsLoading(true);

      setTimeout(() => {
        setMessages((prev) => [
          ...Array.from({ length: 6 }, (_, i) => ({
            id: prev.length + i + 1,
            type: (prev.length + i + 1) % 2 === 0 ? "received" : "sent",
            text:
              (prev.length + i + 1) % 2 === 0
                ? "Tin nhắn giả lập từ bot..."
                : "Tin nhắn giả lập từ người dùng...",
            time: `Fri, May 08, 2020 5:${13 + prev.length + i} PM`,
            avatar: (prev.length + i + 1) % 2 === 0 ? Images.logo : Images.avatar,
          })),
          ...prev,
        ]);

        setIsLoading(false);
      }, 3000); // Giả lập delay khi tải thêm
    }
  };

  const handleNewChat = () => {
    const newChatId = chatLists.flatMap((item) => item.chats).length + 1;

    setActiveChatId(newChatId); // Đặt chat mới là active
    setMessages([]); // Xóa tin nhắn cũ khi tạo cuộc trò chuyện mới
  };

  const scrollToBottom = () => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  };

  // Khi tin nhắn thay đổi, cuộn xuống cuối cùng
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
          <Button icon={<PlusOutlined />} className={style.newChatBtn} onClick={handleNewChat}>
            New Chat
          </Button>
          <Input prefix={<SearchOutlined />} placeholder="Search.." className={style.searchInput} />
        </Flex>
        <Flex className={style.chatBoxSidebarList}>
          {chatLists.map(({ title, chats }, index) => (
            <Flex key={index} className={style.listWrapper}>
              <h3>{title}</h3>
              {chats.map(({ id, text, active }) => (
                <Flex
                  key={id}
                  className={`${style.chatBoxSidebarListItem} ${active ? style.active : ""}`}
                  onClick={() => setActiveChatId(id)}
                >
                  <span>{text}</span>
                  <ActionMenuChat onEdit={() => {}} onDelete={() => {}} />
                </Flex>
              ))}
            </Flex>
          ))}
        </Flex>
      </Flex>

      <Flex className={style.chatBoxContent}>
        <Flex className={style.chatBoxContentHeader}>
          <h3>Lorem ipsum dolor sit amet...</h3>
        </Flex>

        <Flex className={style.chatBoxContentMessages} ref={chatBoxRef} onScroll={handleScroll}>
          {messages.length === 0 ? (
            <Flex justify="center" align="center">
              <span>What can I help with?</span>
            </Flex>
          ) : (
            messages.map(({ id, type, text, time, avatar }) => {
              const lastMessage = messages[messages.length - 1];
              return (
                <Flex
                  key={id}
                  className={`${style.message} ${
                    type === "sent" ? style.messageSent : style.messageReceived
                  }`}
                >
                  {type === "received" && <Avatar src={avatar} />}
                  <Flex className={style.messageWrapper}>
                    <span
                      className={`${style.messageTimestamp} ${type === "sent" ? style.right : ""}`}
                    >
                      {time}
                    </span>
                    <div className={style.messageBubble}>
                      {text === "Bot is typing..." && lastMessage.id === id ? (
                        <>
                          <LoadingOutlined /> Bot is typing...
                        </>
                      ) : (
                        text
                      )}
                    </div>
                  </Flex>
                  {type === "sent" && <Avatar src={avatar} />}
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
              handleSendMessage();
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            className={style.sendBtn}
            onClick={handleSendMessage}
            disabled={isWaitingForResponse}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ChatBox;
