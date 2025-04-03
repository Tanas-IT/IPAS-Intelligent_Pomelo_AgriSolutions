import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ActionMenuMasterType: FC<ActionMenuProps> = ({ onEdit, onDelete }) => {
  const actionItems = [
    {
      icon: <Icons.edit />,
      label: "Update Type",
      onClick: () => onEdit(),
    },
    {
      icon: <Icons.delete />,
      label: "Delete Type",
      onClick: () => onDelete(),
    },
  ];

  return (
    <>
      <ActionMenu title="Master Type Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuMasterType;
