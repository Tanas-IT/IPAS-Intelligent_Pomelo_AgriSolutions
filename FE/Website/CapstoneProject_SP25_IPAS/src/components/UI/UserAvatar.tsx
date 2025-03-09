import { Avatar } from "antd";

interface UserAvatarProps {
  avatarURL?: string;
  fallbackText?: string;
  size?: number;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ avatarURL, fallbackText = "?", size = 40 }) => {
  return (
    <div>
      <Avatar
        src={avatarURL}
        alt="Avatar"
        crossOrigin="anonymous"
        style={{
          width: size,
          height: size,
        }}
      >
        {fallbackText}
      </Avatar>
    </div>
  );
};

export default UserAvatar;
