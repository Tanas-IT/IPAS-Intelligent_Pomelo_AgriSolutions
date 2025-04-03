import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

interface UserAvatarProps {
  avatarURL?: string;
  fallbackText?: string;
  size?: number;
  shape?: "circle" | "square";
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarURL,
  fallbackText = "?",
  size = 40,
  shape = "circle",
}) => {
  return (
    <div>
      <Avatar
        src={avatarURL || undefined}
        alt="Avatar"
        crossOrigin="anonymous"
        style={{
          width: size,
          height: size,
        }}
        shape={shape}
        icon={!avatarURL && !fallbackText ? <UserOutlined /> : undefined}
      >
        {fallbackText}
      </Avatar>
    </div>
  );
};

export default UserAvatar;
