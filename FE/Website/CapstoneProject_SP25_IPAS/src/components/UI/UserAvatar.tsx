import { Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

interface UserAvatarProps {
  avatarURL?: string;
  size?: number;
  shape?: "circle" | "square";
}

const UserAvatar: React.FC<UserAvatarProps> = ({ avatarURL, size = 40, shape = "circle" }) => {
  return (
    <Avatar
      src={avatarURL || undefined}
      alt="Avatar"
      crossOrigin="anonymous"
      style={{
        width: size,
        height: size,
      }}
      shape={shape}
      icon={!avatarURL ? <UserOutlined /> : undefined}
    />
  );
};

export default UserAvatar;
