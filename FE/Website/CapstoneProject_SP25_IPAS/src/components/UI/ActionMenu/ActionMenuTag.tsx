import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { ActionMenuItem } from "@/types";

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ActionMenuTag: FC<ActionMenuProps> = ({ onEdit, onDelete }) => {
  const actionItems = [
    {
      icon: <Icons.edit />,
      label: "Update Tag",
      onClick: () => onEdit(),
    },
    {
      icon: <Icons.delete />,
      label: "Delete Tag",
      onClick: () => onDelete(),
    },
  ].filter(Boolean) as ActionMenuItem[];

  return (
    <>
      <ActionMenu title="Tag Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuTag;
