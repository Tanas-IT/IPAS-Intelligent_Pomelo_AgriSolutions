import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { ActionMenuItem } from "@/types";

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ActionMenuChat: FC<ActionMenuProps> = ({ onEdit, onDelete }) => {
  const actionItems = [
    {
      icon: <Icons.edit />,
      label: "Rename Chat",
      onClick: () => onEdit(),
    },
    {
      icon: <Icons.delete />,
      label: "Delete Chat",
      onClick: () => onDelete(),
    },
  ].filter(Boolean) as ActionMenuItem[];

  return (
    <>
      <ActionMenu title="Chat Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuChat;
