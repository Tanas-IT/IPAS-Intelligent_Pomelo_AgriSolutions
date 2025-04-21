import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { ActionMenuItem } from "@/types";

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ActionMenuGrowth: FC<ActionMenuProps> = ({ onEdit, onDelete }) => {
  const actionItems = [
    {
      icon: <Icons.edit />,
      label: "Update Note",
      onClick: () => onEdit(),
    },
    {
      icon: <Icons.delete />,
      label: "Delete Note",
      onClick: () => onDelete(),
    },
  ].filter(Boolean) as ActionMenuItem[];

  return (
    <>
      <ActionMenu title="Growth Note Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuGrowth;
