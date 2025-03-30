import { Input, Avatar, Button, Flex } from "antd";
import { SendOutlined, PlusOutlined, SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import style from "./ChatBox.module.scss";
import { Images } from "@/assets";
import { ActionMenuChat } from "@/components";
import { useEffect, useRef, useState } from "react";

const initialMessages = [
  {
    id: 1,
    type: "sent",
    text: "Lorem ipsum dolor sit amet...",
    time: "Fri, May 08, 2020 5:13 PM",
    avatar: Images.avatar,
  },
  {
    id: 2,
    type: "received",
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis voluptas, sed molestias unde aperiam earum. Incidunt inventore excepturi, porro aperiam doloremque laudantium tenetur molestiae quas aspernatur quae provident aut cupiditate",
    time: "Fri, May 08, 2020 5:13 PM",
    avatar: Images.logo,
  },
  {
    id: 3,
    type: "sent",
    text: "Earum amet sint deleniti...",
    time: "Fri, May 08, 2020 5:13 PM",
    avatar: Images.avatar,
  },
  {
    id: 4,
    type: "received",
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis voluptas, sed molestias unde aperiam earum. Incidunt inventore excepturi, porro aperiam doloremque laudantium tenetur molestiae quas aspernatur quae provident aut cupiditate",
    time: "Fri, May 08, 2020 5:13 PM",
    avatar: Images.logo,
  },
  {
    id: 5,
    type: "sent",
    text: "Earum amet sint deleniti...",
    time: "Fri, May 08, 2020 5:13 PM",
    avatar: Images.avatar,
  },
  {
    id: 6,
    type: "received",
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Perferendis voluptas, sed molestias unde aperiam earum. Incidunt inventore excepturi, porro aperiam doloremque laudantium tenetur molestiae quas aspernatur quae provident aut cupiditate",
    time: "Fri, May 08, 2020 5:13 PM",
    avatar: Images.logo,
  },
];

const chatLists = [
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
  const [messages, setMessages] = useState(initialMessages);
  const [messageInput, setMessageInput] = useState("");
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const handleSendMessage = () => {
    if (isWaitingForResponse || !messageInput.trim()) return;

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
          <Button icon={<PlusOutlined />} className={style.newChatBtn}>
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

        <Flex className={style.chatBoxContentMessages} ref={chatBoxRef}>
          {messages.map(({ id, type, text, time, avatar }) => {
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
          })}
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
