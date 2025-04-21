import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { ActionMenuItem } from "@/types";

interface ActionMenuProps {
  onEdit: () => void;
  onDelete?: () => void;
}

const ActionMenuRecord: FC<ActionMenuProps> = ({ onEdit, onDelete }) => {
  const actionItems = [
    {
      icon: <Icons.edit />,
      label: "Update Record",
      onClick: () => onEdit(),
    },
    onDelete
      ? {
          icon: <Icons.delete />,
          label: "Delete Record",
          onClick: () => onDelete(),
        }
      : null,
  ].filter(Boolean) as ActionMenuItem[];

  return (
    <>
      <ActionMenu title="Record Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuRecord;
