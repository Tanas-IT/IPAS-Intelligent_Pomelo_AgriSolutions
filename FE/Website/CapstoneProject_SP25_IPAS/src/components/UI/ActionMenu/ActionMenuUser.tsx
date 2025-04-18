import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { ActionMenuItem } from "@/types";
import { GetUser2 } from "@/payloads";

interface ActionMenuProps {
  user: GetUser2;
  onEdit: () => void;
  onBan: (ids: number[]) => void;
  onUnBan: (ids: number[]) => void;
  onDelete: () => void;
}

const ActionMenuUser: FC<ActionMenuProps> = ({ user, onEdit, onBan, onUnBan, onDelete }) => {
  const isActive = user.status === "Active";

  const actionItems = [
    {
      icon: <Icons.edit />,
      label: "Update User",
      onClick: () => onEdit(),
    },
    {
      icon: isActive ? <Icons.ban /> : <Icons.checkSuccuss />,
      label: isActive ? "Ban User" : "Unban User",
      onClick: () => {
        isActive ? onBan([user.userId]) : onUnBan([user.userId]);
      },
    },
    {
      icon: <Icons.delete />,
      label: "Delete User",
      onClick: () => onDelete(),
    },
  ].filter(Boolean) as ActionMenuItem[];

  return (
    <>
      <ActionMenu title="User Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuUser;
